import { GameMetaData, GameState } from "shared";
import GameManager from "../game/game_manager";
import UserManager from "../user/user_manager";
import subscribeSocketToServerEvents from "./subscribeSocketToServerEvents";
import { ServerSocket, ServerUser } from "../types";
import parseSocketCookies from "./parse_socket_cookies";

class ServerManager {
  userManager: UserManager;
  games: Map<string, GameManager> = new Map();

  constructor(userManager: UserManager) {
    this.userManager = userManager;
  }

  public newGame({
    gameName,
    creator,
  }: {
    gameName: string;
    creator: ServerUser;
  }) {
    // does this user already have a game?
    if (creator.currentGameId) {
      console.log("server_manager: user already has a game");
      const currentGame = this.getGameById(creator.currentGameId);

      if (!currentGame.isGameCompleted()) {
        throw new Error("User is already in a game");
      }

      // user is in a completed game, let them create a new one
      this.leaveGame(creator);
    }

    const game = new GameManager({
      gameName,
      creator,
      destroyGame: (gameId: string) => this.destroyGame(gameId),
    });

    this.games.set(game.id, game);

    // have the creator join the game
    this.joinGame({ gameId: game.id, user: creator });

    this.updateGamesList();
  }

  private destroyGame(gameId: string) {
    const game = this.getGameById(gameId);

    game.onDestroy();
    this.games.delete(gameId);

    this.updateGamesList();
  }

  public joinGame({ gameId, user }: { gameId: string; user: ServerUser }) {
    const game = this.getGameById(gameId);

    // are we already in the game (reconnecting)?
    const wasDisconnected = user.currentGameId === gameId;

    if (wasDisconnected && user.disconnectTimeout) {
      clearTimeout(user.disconnectTimeout);
      user.disconnectTimeout = null;
    }

    // XXX: important: set the users currentGameId
    user.currentGameId = game.id;
    game.userJoinGame(user, wasDisconnected);

    this.updateGamesList();
  }

  // TODO: currently we lose the game on refresh
  public leaveGame(user: ServerUser) {
    let game: GameManager;

    game = this.getGameById(user.currentGameId);
    game.playerLeaveGame(user.sessionId);

    // XXX: important: clear the users currentGameId
    // must be done after game.playerLeaveGame
    user.currentGameId = "";

    // destroy the game if it has no players left
    if (game.getPlayerCount() === 0) {
      this.destroyGame(game.id);
    }

    this.updateGamesList();
  }

  public handleDisconnect(user: ServerUser) {
    const potentiallyStaleSocketId = user.socket.id;

    if (user.disconnectTimeout) {
      clearTimeout(user.disconnectTimeout);
      user.disconnectTimeout = null;
    }

    user.disconnectTimeout = setTimeout(
      () => this.finalizeDisconnect(user, potentiallyStaleSocketId),
      10 * 1000
    );
  }

  private finalizeDisconnect(
    user: ServerUser,
    potentiallyStaleSocketId: string
  ) {
    if (user.disconnectTimeout) {
      clearTimeout(user.disconnectTimeout);
      user.disconnectTimeout = null;
    }

    console.log(user.socket.id, potentiallyStaleSocketId);

    if (user.socket.id !== potentiallyStaleSocketId) {
      // user reconnected
      return;
    }

    if (user.currentGameId) {
      this.leaveGame(user);
    }

    console.log(
      `server_manager: disconnecting user with sessionId: ${user.sessionId}`
    );
    user.socket.disconnect(true);
    this.updateGamesList();
  }

  public joinServer(user: ServerUser) {
    if (user.currentGameId) {
      console.log(
        `server_manager: user has currentGameId: ${user.currentGameId}`
      );
      try {
        this.joinGame({
          gameId: user.currentGameId,
          user,
        });
      } catch (error) {
        console.error(`failed to rejoin the game because: ${error}`);
      }
    }

    this.updateGamesList();
  }

  public updateGamesList() {
    const gamesList: Array<GameMetaData> = [];

    for (const game of this.games.values()) {
      const gameMetaData = game.getMetaData();

      if (gameMetaData.gameState === GameState.waitingToStart) {
        gamesList.push(gameMetaData);
      }
    }

    gamesList.sort((gameA, gameB) => {
      return gameB.createdAt.getTime() - gameA.createdAt.getTime();
    });

    this.userManager.updateGamesListForAllUsers(gamesList);
  }

  public onSocketConnect(socket: ServerSocket) {
    try {
      const { name, sessionId } = parseSocketCookies(
        socket.handshake.headers.cookie || ""
      );

      console.log(
        `server_manager: socket connected with sessionId: ${sessionId}`
      );

      const user = this.userManager.getOrCreateUser({
        sessionId,
        socket,
        name,
      });
      socket.onAny((event, ...args) => {
        console.log(`socket event: ${event}`, ...args);
      });
      subscribeSocketToServerEvents(user);

      userManager.emitUpdateUser(user.sessionId);
    } catch (error) {
      console.error(
        `server_manager: socket connection failed because: ${error}`
      );
    }
  }

  private getGameById(gameId: string): GameManager {
    if (!gameId) {
      throw new Error("Game ID is required");
    }

    const game = this.games.get(gameId);

    if (!game) {
      throw new Error(`Game with id ${gameId} not found`);
    }

    return game;
  }
}

const userManager = new UserManager();
const serverManager = new ServerManager(userManager);
export default serverManager;

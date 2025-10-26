import { GameMetaData, GameState } from "shared";
import GameManager from "../game/game_manager";
import UserManager from "../user/user_manager";
import subscribeSocketToServerEvents from "./subscribeSocketToServerEvents";
import { ServerSocket, ServerUser } from "../types";

class ServerManager {
  userManager: UserManager;
  games: Map<string, GameManager> = new Map();

  constructor(userManager: UserManager) {
    this.userManager = userManager;
  }

  public newGame(gameName: string, creatorId: string) {
    // does this user already have a game?
    const creator = this.userManager.getUserById(creatorId);

    if (creator.currentGameId) {
      const currentGame = this.getGameById(creator.currentGameId);

      if (currentGame.getGameState() !== GameState.complete) {
        throw new Error("User is already in a game");
      }

      // user is in a completed game, let them create a new one
      this.leaveGame(creator.socket.id);
    }

    const game = new GameManager({
      gameName,
      creator,
      destroyGame: (gameId: string) => this.destroyGame(gameId),
    });

    this.games.set(game.id, game);

    // have the creator join the game
    this.joinGame(game.id, creator.socket.id);
  }

  private destroyGame(gameId: string) {
    const game = this.getGameById(gameId);

    game.onDestroy();
    this.games.delete(gameId);

    this.updateGamesList();
  }

  public joinGame(gameId: string, userSocketId: string) {
    const game = this.getGameById(gameId);

    const user = this.userManager.getUserById(userSocketId);

    // XXX: important: set the users currentGameId
    user.currentGameId = game.id;
    game.userJoinGame(user);
    this.updateGamesList();
  }

  public leaveGame(userSocketId: string) {
    const user = this.userManager.getUserById(userSocketId);
    let game: GameManager;

    game = this.getGameById(user.currentGameId);
    game.playerLeaveGame(user.socket.id);

    // XXX: important: clear the users currentGameId
    // must be done after game.playerLeaveGame
    user.currentGameId = "";

    // destroy the game if it has no players left
    if (game.getPlayerCount() === 0) {
      this.destroyGame(game.id);
    }

    this.updateGamesList();
  }

  public handleDisconnect(socketId: string, reason: string) {
    const user = this.userManager.getUserById(socketId);
    console.log(`disconnecting user ${user.name} for reason: ${reason}`);

    if (user.currentGameId) {
      this.leaveGame(user.socket.id);
    }

    user.socket.disconnect(true);
  }

  public joinServer(name: string, socket: ServerSocket) {
    let user: ServerUser;

    try {
      user = this.userManager.hasUser(socket.id)
        ? this.userManager.getUserById(socket.id)
        : this.userManager.addNewUser({ name, socket });
    } catch (error) {
      console.error(`error joining server: ${error}`);
      return;
    }

    if (user.currentGameId) {
      try {
        this.joinGame(user.currentGameId, socket.id);
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
    console.log(`user connected with socket id: ${socket.id}`);
    subscribeSocketToServerEvents(socket);
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

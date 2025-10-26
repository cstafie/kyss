import {
  GameMetaData,
  GameState,
  ClientToServerEvents,
  ServerToClientEvents,
} from "shared";
import { Socket } from "socket.io";
import GameManager from "../game/game_manager";
import User from "../user/user";
import UserManager from "../user/user_manager";
import subscribeSocketToServerEvents from "./subscribeSocketToServerEvents";

interface JoinServerParams {
  name: string;
  socket: Socket;
}

class ServerManager {
  userManager: UserManager;
  games: Map<string, GameManager> = new Map();

  constructor(userManager: UserManager) {
    this.userManager = userManager;
  }

  public newGame(gameName: string, creatorSocketId: string) {
    // does this user already have a game?
    const creator = this.userManager.getUserById(creatorSocketId);

    if (creator.currentGameId) {
      throw new Error("User is already in a game");
    }

    const game = new GameManager({
      gameName,
      creator,
      destroyGame: (gameId: string) => this.destroyGame(gameId),
    });

    this.games.set(game.id, game);

    // have the creator join the game
    this.joinGame(game.id, creator.id);
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
    game.playerLeaveGame(user.id);

    // XXX: important: clear the users currentGameId
    // must be done after game.playerLeaveGame
    user.currentGameId = "";

    // TODO:
    // destroy the game if it has no players left
    if (game.getPlayerCount() === 0) {
      this.destroyGame(game.id);
    }

    this.updateGamesList();
  }

  public disconnect(socketId: string, reason: string) {
    const user = this.userManager.getUserById(socketId);

    // TODO: double check this works as intended
    if (user.currentGameId) {
      this.leaveGame(user.id);
    }

    user.socket.disconnect(true);
  }

  public joinServer({ name, socket }: JoinServerParams) {
    let user: User;

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

  public onSocketConnect(
    socket: Socket<ClientToServerEvents, ServerToClientEvents>
  ) {
    console.log(`user connected with socket id: ${socket.id}`);

    // debug: log all received events
    socket.onAny((event, ...args) => {
      console.log("Received:", socket.id, event, args);
    });

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

  private destroyGame(gameId: string) {
    const game = this.getGameById(gameId);

    game.onDestroy();
    this.games.delete(gameId);

    this.updateGamesList();
  }
}

const userManager = new UserManager();
const serverManager = new ServerManager(userManager);
export default serverManager;

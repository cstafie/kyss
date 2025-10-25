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
import subscribeUserToServerEvents from "./subscribeSocketToServerEvents";
import { Server } from "http";

interface JoinServerParams {
  id?: string;
  name: string;
  socket: Socket;
}

class ServerManager {
  userManager: UserManager;
  games: Map<string, GameManager> = new Map();

  constructor(userManager: UserManager) {
    this.userManager = userManager;
  }

  public newGame(gameName: string, creator: User) {
    // destroy the game after 30min
    const destroyTimeoutCallback = setTimeout(() => {
      this.destroyGame(game.id);
    }, 30 * 60 * 1000);

    const game = new GameManager({ gameName, creator, destroyTimeoutCallback });
    this.games.set(game.id, game);

    // have the creator join the game
    this.joinGame(game.id, creator);
  }

  public joinGame(gameId: string, user: User) {
    const game = this.getGameById(gameId);

    // XXX: important: set the users currentGameId
    user.currentGameId = game.id;
    game.userJoinGame(user);
    this.updateGamesList();
  }

  public leaveGame(user: User) {
    let game: GameManager;

    try {
      game = this.getGameById(user.currentGameId);
      game.playerLeaveGame(user.id);

      // XXX: important: clear the users currentGameId
      // must be done after game.playerLeaveGame
      user.currentGameId = "";
    } catch (error) {
      console.error(`failed to leave game because: ${error}`);
      return;
    }

    // TODO:
    // destroy the game if it has no players left
    if (game.getPlayerCount() === 0) {
      this.destroyGame(game.id);
    }

    this.updateGamesList();
  }

  public disconnect(user: User) {
    console.log(`${user.name} disconnected from server`);
    user.socket.disconnect(true);

    // TODO: handle game disconnect nicely?
    // const game = this.tryGetUserGame(user);
    // game?.playerDisconnect(user.id);
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

  private joinServer({ id, name, socket }: JoinServerParams) {
    let user: User;

    console.log(`user joining server with name: ${name}`);

    try {
      if (id) {
        console.log(`existing user ${name} joining server with id ${id}`);
        user = this.userManager.updateUser(id, { name, socket });
      } else {
        console.log(`new user ${name} joining server`);
        user = this.userManager.addNewUser({ name, socket });
      }
    } catch (error) {
      console.error(`error joining server: ${error}`);
      return;
    }

    subscribeUserToServerEvents(user);

    try {
      this.joinGame(user.currentGameId, user);
    } catch (error) {
      console.error(`failed to rejoin the game because: ${error}`);
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

  destroyGame(gameId: string) {
    const game = this.getGameById(gameId);

    game.onDestroy();
    this.games.delete(gameId);

    this.updateGamesList();
  }

  onSocketConnect(socket: Socket<ClientToServerEvents, ServerToClientEvents>) {
    console.log(`user connected with socket id: ${socket.id}`);

    // we are about to setup the socket for a user, so first clear any existing listeners
    socket.removeAllListeners();

    // debug: log all received events
    socket.onAny((event, ...args) => {
      console.log("Received:", socket.id, event, args);
    });

    socket.on("joinServer", (userInfo: { id?: string; name: string }) => {
      this.joinServer({ id: userInfo.id, name: userInfo.name, socket });
    });
  }
}

const userManager = new UserManager();
const serverManager = new ServerManager(userManager);
export default serverManager;

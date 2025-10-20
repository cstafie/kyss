import { GameMetaData, GameState, ClientToServerEvents } from "shared";
import { Socket } from "socket.io";
import GameManager from "../game/game_manager";
import User from "../user/user";
import UserManager from "../user/user_manager";
import subscribeSocketToServerEvents from "./subscribeSocketToServerEvents";

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

  private log(message: string) {
    console.log(`server manager: ${message}`);
  }

  public newGame(gameName: string, creator: User) {
    // destroy the game after 30min
    const destroyTimeoutCallback = setTimeout(() => {
      this.destroyGame(game.id);
    }, 30 * 60 * 1000);

    // the Game Manager will automatically add the creator to the game
    const game = new GameManager({ gameName, creator, destroyTimeoutCallback });
    this.games.set(game.id, game);

    game.userJoinGame(creator);
  }

  public joinGame(gameId: string, user: User) {
    const game = this.getGameById(gameId);

    // XXX: important: set the users currentGameId
    user.currentGameId = game.id;
    game.userJoinGame(user);
  }

  public leaveGame(user: User) {
    const game = this.getGameById(user.currentGameId);

    // XXX: important: clear the users currentGameId
    user.currentGameId = "";
    game.playerLeaveGame(user.id);

    // destroy the game if it has no players left
    if (game.getPlayerCount() === 0) {
      this.destroyGame(game.id);
    }
  }

  public disconnect(user: User) {
    this.log(`${user.name} disconnected from server`);
    user.socket.removeAllListeners();
    user.socket.disconnect();

    // TODO: handle game disconnect nicely?
    // should maybe clean up the socket listeners here
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
    const user = id
      ? this.userManager.updateUser(id, { name, socket })
      : this.userManager.addNewUser({ name, socket });

    // TODO: double check if this is needed
    // hard socket reset as we are about to resubscribe to all relevant events
    socket.removeAllListeners();
    subscribeSocketToServerEvents(socket, user);

    this.joinGame(user.currentGameId, user);

    console.log(`server_manager: ${name} joined server`);
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

    this.userManager.updateAllUsers(gamesList);
  }

  destroyGame(gameId: string) {
    const game = this.getGameById(gameId);

    game.onDestroy();
    this.games.delete(gameId);

    this.updateGamesList();
  }

  onSocketConnect(socket: Socket<ClientToServerEvents, ClientToServerEvents>) {
    console.log(`user connected with socket id: ${socket.id}`);

    socket.on("joinServer", (userInfo: { id?: string; name: string }) => {
      this.joinServer({ id: userInfo.id, name: userInfo.name, socket });
    });
  }
}

const userManager = new UserManager();
const serverManager = new ServerManager(userManager);
export default serverManager;

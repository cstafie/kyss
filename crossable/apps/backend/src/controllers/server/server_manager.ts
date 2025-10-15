import { GameMetaData, GameState, ClientToServerEvents } from "shared";
import { Socket } from "socket.io";
import GameManager from "../game_manager/game_manager";
import User from "../user/user";

interface JoinServerParams {
  id: string;
  name: string;
  socket: Socket;
}

class ServerManager {
  users: Map<string, User> = new Map();
  games: Map<string, GameManager> = new Map();

  private tryGetUserGame(user: User) {
    if (user.currentGameId) {
      const game = this.games.get(user.currentGameId);

      if (game) {
        return game;
      }

      // if the game corresponding to user.currentGameId doesn't exist
      // the user's currentGameId is invalid and should be cleared
      user.currentGameId = "";
    }
    console.log("server manager: user has no current game id");
  }

  private tryRejoinGame(user: User) {
    const game = this.tryGetUserGame(user);
    game?.userJoinGame(user, true);
  }

  private newGame(gameName: string, creator: User) {
    // the Game Manager will automatically add the creator to the game
    const game = new GameManager(gameName, creator);
    this.games.set(game.id, game);

    creator.currentGameId = game.id;

    // games get destroyed after 30min
    const gameId = game.id;
    setTimeout(() => {
      this.destroyGame(gameId);
    }, 30 * 60 * 1000);
  }

  private joinGame(gameId: string, user: User) {
    const game = this.games.get(gameId);

    if (game) {
      user.currentGameId = gameId;
      game.userJoinGame(user);
    }
  }

  private leaveGame(user: User) {
    const game = this.tryGetUserGame(user);

    if (!game) {
      console.log("server manager: could not find game to leave");
      return;
    }

    game.playerLeaveGame(user.id);
    this.resetAndRejoinUser(user);

    // destroy the game if it has no players left
    if (game.game.players.size - game.bots.size === 0) {
      this.destroyGame(game.id);
    }
  }

  private disconnect(user: User) {
    console.log("server manager: disconnect: ", user.name);
    user.socket.removeAllListeners();
    user.socket.disconnect();

    // TODO: handle game disconnect nicely?
    // should maybe clean up the socket listeners here
    // const game = this.tryGetUserGame(user);
    // game?.playerDisconnect(user.id);
  }

  private joinServer({ id, name, socket }: JoinServerParams) {
    const user = this.users.get(id) || new User({ id, name, socket });

    user.name = name;
    user.socket = socket;

    this.users.set(user.id, user);

    // hard socket reset as we are about to resubscribe to all relevant events
    socket.removeAllListeners();

    socket.on("newGame", (name: string) => {
      this.newGame(name, user);
      this.updateGamesList();
    });
    socket.on("joinGame", (gameId: string) => {
      this.joinGame(gameId, user);
      this.updateGamesList();
    });
    socket.on("leaveGame", () => {
      this.leaveGame(user);
      this.updateGamesList();
    });
    socket.on("disconnect", () => {
      this.disconnect(user);
      this.updateGamesList();
    });

    this.tryRejoinGame(user);
    this.updateGamesList();

    console.log(`${name} joined server`);
  }

  private updateGamesList() {
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

    // TODO: this is a bit inefficient, maybe we should have a set of connected user ids
    for (const user of this.users.values()) {
      if (user.socket.connected) {
        user.socket.emit("updateGamesList", gamesList);
      }
    }
  }

  destroyGame(gameId: string) {
    const game = this.games.get(gameId);

    if (!game) {
      console.log("could not find game to destroy");
      return;
    }

    Array.from(game.game.players.values()).forEach((player) => {
      const user = this.users.get(player.id);

      if (!user) {
        return;
      }

      // TODO: call the unsubscribe function from game manager to clean up listeners
      this.resetAndRejoinUser(user);
    });

    game.onDestroy();
    this.games.delete(gameId);

    this.updateGamesList();
  }

  resetAndRejoinUser(user: User) {
    user.currentGameId = "";
    user.socket.offAny();
    this.joinServer(user);
  }

  onSocketConnect(socket: Socket<ClientToServerEvents, ClientToServerEvents>) {
    console.log(`user connected with socket id: ${socket.id}`);

    socket.on("joinServer", (userInfo: { id: string; name: string }) => {
      this.joinServer({ id: userInfo.id, name: userInfo.name, socket });
    });
  }
}

const serverManager = new ServerManager();
export default serverManager;

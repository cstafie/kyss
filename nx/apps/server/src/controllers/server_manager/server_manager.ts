import {
  ClientToServerEvent,
  ClientToServerEvents,
  GameMetaData,
  GameState,
  ServerGameUpdate,
  ServerToClientEvent,
  SocketClientToServerEvents,
  SocketServerToClientEvents,
} from '@nx/api-interfaces';
import { Socket } from 'socket.io';
import GameManager from '../game_manager/game_manager';
import User from '../user/user';

interface JoinServerParams {
  id: string;
  name: string;
  socket: Socket<SocketClientToServerEvents, SocketServerToClientEvents>;
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
      user.currentGameId = '';
    }
    console.log('server manager: user has no current game id');
  }

  private tryRejoinGame(user: User) {
    const game = this.tryGetUserGame(user);
    game?.userJoinGame(user, true);
  }

  private newGame(gameName: string, creator: User) {
    // the Game Manager will automatically add the creator to the game
    const game = new GameManager(gameName, creator, this.updateGame.bind(this));
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
      game.userJoinGame(user);
      user.currentGameId = gameId;
    }
  }

  private leaveGame(user: User) {
    const game = this.tryGetUserGame(user);

    if (!game) {
      console.log('server manager: could not find game to leave');
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
    console.log('server manager: disconnect: ', user.name);

    // TODO: handle game disconnect nicely?
    // should maybe clean up the socket listeners here
    // const game = this.tryGetUserGame(user);
    // game?.playerDisconnect(user.id);
  }

  private handleEvent(
    user: User,
    event: ClientToServerEvent<keyof ClientToServerEvents>
  ) {
    // TODO: this almost looks like we could do `this[event.type](user, event);`
    const eventToHandlerMap = {
      newGame: () => {
        const { name } = (event as ClientToServerEvent<'newGame'>).data;
        this.newGame(name, user);
      },
      joinGame: () => {
        const { gameId } = (event as ClientToServerEvent<'joinGame'>).data;
        this.joinGame(gameId, user);
      },
      leaveGame: () => {
        this.leaveGame(user);
      },
    };

    if (Object.prototype.hasOwnProperty.call(eventToHandlerMap, event.type)) {
      eventToHandlerMap[event.type]();
      this.updateGamesList();
    }
  }

  private joinServer({ id, name, socket }: JoinServerParams) {
    const user = this.users.get(id) || new User({ id, name, socket });

    user.name = name;
    user.socket = socket;

    // TODO: if we store users by socket.id instead we could potentially treat joinServer event
    // as we do all other events
    this.users.set(user.id, user);

    this.tryRejoinGame(user);
    this.updateGamesList();

    socket.removeAllListeners();

    socket.on(
      'clientToServerEvent',
      (event: ClientToServerEvent<keyof ClientToServerEvents>) => {
        console.log('server manager: ', event.type);
        this.handleEvent(user, event);
      }
    );

    const disconnectHandler = () => {
      this.disconnect(user);
      this.updateGamesList();
    };

    socket.on('disconnect', disconnectHandler);

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

    const event: ServerToClientEvent<'updateGamesList'> = {
      type: 'updateGamesList',
      data: {
        games: gamesList,
      },
    };

    // TODO: this is a bit inefficient, maybe we should have a set of connected user ids
    for (const user of this.users.values()) {
      if (user.socket.connected) {
        user.socket.emit('serverToClientEvent', event);
      }
    }
  }

  updateGame(userId: string, gameUpdate: ServerGameUpdate) {
    const user = this.users.get(userId);

    if (!user || !user.socket.connected) {
      return;
    }

    const event: ServerToClientEvent<'updateGame'> = {
      type: 'updateGame',
      data: { gameUpdate },
    };
    user.socket.emit('serverToClientEvent', event);

    if (gameUpdate.gameState === GameState.complete) {
      this.destroyGame(gameUpdate.id);
    }
  }

  destroyGame(gameId) {
    const game = this.games.get(gameId);

    if (!game) {
      console.log('could not find game to destroy');
      return;
    }

    Array.from(game.game.players.values()).forEach((player) => {
      const user = this.users.get(player.id);

      if (!user) {
        return;
      }

      this.resetAndRejoinUser(user);
    });

    game.onDestroy();
    this.games.delete(gameId);

    this.updateGamesList();
  }

  resetAndRejoinUser(user: User) {
    user.currentGameId = '';
    user.socket.offAny();
    this.joinServer(user);
  }

  onSocketConnect(
    socket: Socket<SocketClientToServerEvents, SocketServerToClientEvents>
  ) {
    console.log(`user connected with socket id: ${socket.id}`);

    socket.on(
      'clientToServerEvent',
      (event: ClientToServerEvent<keyof ClientToServerEvents>) => {
        // the join server event is special as it gives us all the users info
        // all other events require this info and are handled by `handleEvent`
        if (event.type === 'joinServer') {
          const { id, name } = (event as ClientToServerEvent<'joinServer'>)
            .data;
          this.joinServer({ id, name, socket });
        }
      }
    );
  }
}

const serverManager = new ServerManager();
export default serverManager;

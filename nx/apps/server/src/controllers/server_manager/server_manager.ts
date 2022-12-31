import {
  ClientToServerEvent,
  ClientToServerEvents,
  GameMetaData,
  GameState,
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

      user.currentGameId = '';
    }
  }

  private tryRejoinGame(user: User) {
    const game = this.tryGetUserGame(user);
    game?.userJoinGame(user, true);
  }

  private newGame(gameName: string, creator: User) {
    const game = new GameManager(gameName, creator);
    this.games.set(game.id, game);

    game.userJoinGame(creator);
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
    game?.playerLeaveGame(user.id);
  }

  private disconnect(user: User) {
    user.isConnected = false;

    // TODO: handle game disconnect nicely?
    // should maybe clean up the socket listeners here
    // const game = this.tryGetUserGame(user);
    // game?.playerDisconnect(user.id);
  }

  handleEvent(
    user: User,
    event: ClientToServerEvent<keyof ClientToServerEvents>
  ) {
    // TODO: this almost looks like we could do `this[event.type](user, event);`
    switch (event.type) {
      case 'newGame': {
        const { name } = (event as ClientToServerEvent<'newGame'>).data;
        return this.newGame(name, user);
      }
      case 'joinGame': {
        const { gameId } = (event as ClientToServerEvent<'joinGame'>).data;
        return this.joinGame(gameId, user);
      }
      case 'leaveGame': {
        return this.leaveGame(user);
      }
    }

    this.updateUsers();
  }

  joinServer({ id, name, socket }: JoinServerParams) {
    const user = this.users.get(id) || new User({ id, name, socket });

    user.isConnected = true;
    user.name = name;
    user.socket = socket;

    this.users.set(user.id, user);

    this.tryRejoinGame(user);

    socket.on(
      'clientToServerEvent',
      (event: ClientToServerEvent<keyof ClientToServerEvents>) => {
        console.log(event.type);
        this.handleEvent(user, event);
      }
    );
    socket.on('disconnect', () => {
      this.disconnect(user);
      this.updateUsers();
    });

    this.updateUsers();

    console.log(`${name} joined server`);
  }

  updateUsers() {
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
      if (user.isConnected) {
        user.socket.emit('serverToClientEvent', event);
      }
    }
  }
}

const serverManager = new ServerManager();
export default serverManager;

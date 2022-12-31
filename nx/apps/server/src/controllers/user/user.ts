import {
  SocketClientToServerEvents,
  SocketServerToClientEvents,
} from '@nx/api-interfaces';
import { Socket } from 'socket.io';

import Entity from '../entity/entity';

interface ConstructorParams {
  name: string;
  socket: Socket<SocketClientToServerEvents, SocketServerToClientEvents>;
  id?: string;
}

class User extends Entity {
  name: string;
  socket: Socket<SocketClientToServerEvents, SocketServerToClientEvents>;
  currentGameId = '';
  isConnected = false;

  constructor({ name, socket, id }: ConstructorParams) {
    super(id);
    this.name = name;
    this.socket = socket;
  }
}

export default User;

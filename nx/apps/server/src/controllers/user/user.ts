import { ClientToServerEvents, ServerToClientEvents } from '@nx/api-interfaces';
import { Socket } from 'socket.io';

import Entity from '../entity/entity';

interface ConstructorParams {
  name: string;
  socket: Socket<ClientToServerEvents, ServerToClientEvents>;
  id?: string;
}

class User extends Entity {
  name: string;
  socket: Socket<ClientToServerEvents, ServerToClientEvents>;
  currentGameId = '';
  isConnected = false;

  constructor({ name, socket, id }: ConstructorParams) {
    super(id);
    this.name = name;
    this.socket = socket;
  }
}

export default User;

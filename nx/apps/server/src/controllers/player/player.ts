import { Socket } from 'socket.io';

import Entity from '../entity/entity';

class Player extends Entity {
  name: string;
  socket: Socket;
  currentGameId: string;

  constructor(name: string, socket: Socket, isBot: boolean, id?: string) {
    super(id);
    this.name = name;
    this.socket = socket;
    this.currentGameId = '';
  }
}

export default Player;

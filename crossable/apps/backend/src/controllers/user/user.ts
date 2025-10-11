import { ServerToClientEvents, ClientToServerEvents } from "shared";
import { Socket } from "socket.io";

import Entity from "../entity/entity";

interface ConstructorParams {
  name: string;
  socket: Socket<ClientToServerEvents, ServerToClientEvents>;
  id?: string;
}

class User extends Entity {
  name: string;
  socket: Socket<ClientToServerEvents, ServerToClientEvents>;
  currentGameId = "";

  constructor({ name, socket, id }: ConstructorParams) {
    super(id);
    this.name = name;
    this.socket = socket;
  }
}

export default User;

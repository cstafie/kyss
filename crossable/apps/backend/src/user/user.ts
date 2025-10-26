import { ServerToClientEvents, ClientToServerEvents } from "shared";
import { Socket } from "socket.io";

interface ConstructorParams {
  name: string;
  socket: Socket<ClientToServerEvents, ServerToClientEvents>;
}

class User {
  id: string;
  name: string;
  socket: Socket<ClientToServerEvents, ServerToClientEvents>;
  currentGameId = "";

  constructor({ name, socket }: ConstructorParams) {
    this.id = socket.id;
    this.name = name;
    this.socket = socket;
  }
}

export default User;

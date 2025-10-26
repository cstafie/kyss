import { ServerSocket } from "../types";

class User {
  id: string;
  name: string;
  socket: ServerSocket;
  currentGameId = "";

  constructor(name: string, socket: ServerSocket) {
    this.id = socket.id;
    this.name = name;
    this.socket = socket;
  }
}

export default User;

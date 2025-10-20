import { type ClientToServerEvents, type ServerToClientEvents } from "shared";
import User from "./user";
import { type Socket } from "socket.io";

export default class UserManager {
  private users: Map<string, User> = new Map();

  constructor() {
    console.log("user manager: initialized");
  }

  getUserById(id: string): User {
    const user = this.users.get(id);

    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }

    return user;
  }

  setUser({
    id,
    name,
    socket,
    currentGameId = "",
  }: {
    id?: string;
    name: string;
    socket: Socket<ClientToServerEvents, ServerToClientEvents>;
    currentGameId?: string;
  }) {
    this.users.set(user.id, user);
    user.socket.emit("updateUser", { id: user.id, name: user.name });
  }
}

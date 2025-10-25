import {
  GameMetaData,
  type ClientToServerEvents,
  type ServerToClientEvents,
} from "shared";
import User from "./user";
import { type Socket } from "socket.io";

interface UserInfo {
  name?: string;
  socket?: Socket<ClientToServerEvents, ServerToClientEvents>;
  currentGameId?: string;
}

export default class UserManager {
  private users: Map<string, User> = new Map();

  constructor() {}

  getUserById(id: string): User {
    const user = this.users.get(id);

    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }

    return user;
  }

  addNewUser({
    name,
    socket,
  }: {
    name?: string;
    socket?: Socket<ClientToServerEvents, ServerToClientEvents>;
  }): User {
    if (!name) {
      throw new Error("Name is required to add a new user");
    }

    if (!socket) {
      throw new Error("Socket is required to add a new user");
    }

    const user = new User({ name, socket });
    this.users.set(user.id, user);

    this.emitUpdateUser(user.id);
    return user;
  }

  updateUser(id: string, userInfo: UserInfo): User {
    const { name, socket, currentGameId } = userInfo;

    let user: User;

    try {
      user = this.getUserById(id);
    } catch (error) {
      return this.addNewUser({
        name,
        socket: socket,
      });
    }

    user.name = name || user.name;
    user.socket = socket || user.socket;
    user.currentGameId =
      currentGameId !== undefined ? currentGameId : user.currentGameId;

    this.emitUpdateUser(user.id);
    return user;
  }

  emitUpdateUser(id: string): void {
    const user = this.getUserById(id);
    user.socket.emit("updateUser", { id, name: user.name });
  }

  toJSON(): Array<{ id: string; name: string }> {
    const usersArray: Array<{ id: string; name: string }> = [];
    for (const user of this.users.values()) {
      usersArray.push({ id: user.id, name: user.name });
    }
    return usersArray;
  }

  updateGamesListForAllUsers(gamesList: Array<GameMetaData>) {
    for (const user of this.users.values()) {
      if (user.socket.connected) {
        user.socket.emit("updateGamesList", gamesList);
      }
    }
  }
}

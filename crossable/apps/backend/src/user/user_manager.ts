import {
  GameMetaData,
  type ClientToServerEvents,
  type ServerToClientEvents,
} from "shared";
import { type Socket } from "socket.io";
import { ServerUser } from "../types";

export default class UserManager {
  private users: Map<string, ServerUser> = new Map();
  constructor() {}

  getUserById(id: string): ServerUser {
    const user = this.users.get(id);

    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }

    return user;
  }

  hasUser(id: string): boolean {
    return this.users.has(id);
  }

  addNewUser({
    name,
    socket,
  }: {
    name: string;
    socket: Socket<ClientToServerEvents, ServerToClientEvents>;
  }): ServerUser {
    const user: ServerUser = {
      name,
      socket,
      currentGameId: "",
    };

    this.users.set(user.socket.id, user);

    this.emitUpdateUser(user.socket.id);
    return user;
  }

  updateUser(id: string, user: ServerUser): ServerUser {
    const { name, socket, currentGameId } = user;

    try {
      user = this.getUserById(id);
    } catch (error) {
      user = this.addNewUser({
        name,
        socket: socket,
      });
    }

    user.name = name || user.name;
    user.socket = socket || user.socket;
    user.currentGameId =
      currentGameId !== undefined ? currentGameId : user.currentGameId;

    this.emitUpdateUser(user.socket.id);
    return user;
  }

  emitUpdateUser(id: string): void {
    const user = this.getUserById(id);
    user.socket?.emit("updateUser", { id, name: user.name });
  }

  toJSON(): Array<{ id: string; name: string }> {
    const usersArray: Array<{ id: string; name: string }> = [];
    for (const user of this.users.values()) {
      usersArray.push({ id: user.socket.id, name: user.name });
    }
    return usersArray;
  }

  updateGamesListForAllUsers(gamesList: Array<GameMetaData>) {
    for (const user of this.users.values()) {
      if (user.socket?.connected) {
        user.socket?.emit("updateGamesList", gamesList);
      }
    }
  }
}

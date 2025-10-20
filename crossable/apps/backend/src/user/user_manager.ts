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

  addNewUser({
    name,
    socket,
  }: {
    name: string;
    socket: Socket<ClientToServerEvents, ServerToClientEvents>;
  }): User {
    const user = new User({ name, socket });
    this.users.set(user.id, user);

    return user;
  }

  updateUser(id: string, userInfo: UserInfo): User {
    const { name, socket, currentGameId } = userInfo;

    const user = this.getUserById(id);

    user.name = name || user.name;
    user.socket = socket || user.socket;
    user.currentGameId =
      currentGameId !== undefined ? currentGameId : user.currentGameId;

    return user;
  }

  updateAllUsers(gamesList: Array<GameMetaData>) {
    for (const user of this.users.values()) {
      if (user.socket.connected) {
        user.socket.emit("updateGamesList", gamesList);
      }
    }
  }
}

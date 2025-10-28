import {
  GameMetaData,
  type ClientToServerEvents,
  type ServerToClientEvents,
} from "shared";
import { type Socket } from "socket.io";
import { ServerUser, ServerSocket } from "../types";

export default class UserManager {
  private users: Map<string, ServerUser> = new Map();
  constructor() {}

  getOrCreateUser({
    sessionId,
    socket,
    name,
  }: {
    sessionId?: string;
    socket: ServerSocket;
    name: string;
  }): ServerUser {
    // console.log(
    //   `user_manager: getOrCreateUser called with sessionId: ${sessionId}`
    // );

    if (!sessionId) {
      // console.log(`user_manager: creating new user because no sessionId`);
      return this.addNewUser({ name, socket });
    }

    // try to find existing user
    try {
      // console.log(
      //   `user_manager: looking for user with sessionId: ${sessionId}`
      // );
      const user = this.getUserBySessionId(sessionId);
      if (user.socket.id !== socket.id) {
        // disconnect old socket
        console.log(
          `user_manager: disconnecting old socket ${user.socket.id} for user with sessionId: ${sessionId}`
        );
        user.socket.disconnect(true);
      }

      user.socket = socket;
      return user;
    } catch (error) {
      // user not found, create new one
      return this.addNewUser({ name, socket });
    }
  }

  getUserBySessionId(sessionId: string): ServerUser {
    const user = this.users.get(sessionId);

    if (!user) {
      throw new Error(`User with id ${sessionId} not found`);
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
      disconnectTimeout: null,
      // TODO: have the user session expire after some time
      sessionId: crypto.randomUUID(),
    };

    this.users.set(user.sessionId, user);

    this.emitUpdateUser(user.sessionId);
    return user;
  }

  updateUser(sessionId: string, user: ServerUser): ServerUser {
    const { name, socket, currentGameId } = user;

    try {
      user = this.getUserBySessionId(sessionId);
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

    this.emitUpdateUser(user.sessionId);
    return user;
  }

  emitUpdateUser(sessionId: string): void {
    const user = this.getUserBySessionId(sessionId);
    user.socket.emit("updateUser", sessionId);
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
      if (user.socket.connected) {
        user.socket.emit("updateGamesList", gamesList);
      }
    }
  }
}

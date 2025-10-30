import theServerManager from "./server_manager";
import { OutOfGameClientToServerEvents } from "shared";
import { type DisconnectReason } from "socket.io";
import { ServerUser } from "../types";

export default function subscribeSocketToServerEvents(user: ServerUser) {
  type SocketHandlers = {
    [K in keyof OutOfGameClientToServerEvents]: (
      ...args: Parameters<OutOfGameClientToServerEvents[K]>
    ) => void;
  };

  const handlers: SocketHandlers = {
    newGame: (gameName: string) => {
      try {
        theServerManager.newGame({ gameName, creator: user });
      } catch (error) {
        console.error(`failed to create new game because: ${error}`);
      }
    },
    joinGame: (gameId: string) => {
      try {
        theServerManager.joinGame({ gameId, user });
      } catch (error) {
        console.error(`failed to join game because: ${error}`);
      }
    },
    leaveGame: () => {
      try {
        theServerManager.leaveGame(user);
      } catch (error) {
        console.error(`failed to leave game because: ${error}`);
      }
    },
    joinServer: (userInfo: { name: string }) => {
      try {
        user.name = userInfo.name;
        theServerManager.joinServer(user);
      } catch (error) {
        console.error(`failed to connect user because: ${error}`);
      }
    },
  };

  const disconnectHandler = (reason: DisconnectReason) => {
    try {
      unsubscribeSocket();
      theServerManager.handleDisconnect(user);
    } catch (error) {
      console.error(`failed to disconnect user because: ${error}`);
    }
  };

  const unsubscribeSocket = () => {
    eventNames.forEach((event) => {
      user.socket.off(event, handlers[event]);
    });
    user.socket.off("disconnect", disconnectHandler);
  };

  const eventNames = Object.keys(handlers) as Array<
    keyof OutOfGameClientToServerEvents
  >;

  // Register all handlers
  eventNames.forEach((event) => {
    user.socket.on(event, handlers[event]);
  });
  user.socket.on("disconnect", disconnectHandler);
}

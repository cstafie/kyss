import theServerManager from "./server_manager";
import { OutOfGameClientToServerEvents } from "shared";
import { DisconnectReason } from "socket.io";
import { ServerSocket } from "../types";

export default function subscribeSocketToServerEvents(socket: ServerSocket) {
  type SocketHandlers = {
    [K in keyof OutOfGameClientToServerEvents]: (
      ...args: Parameters<OutOfGameClientToServerEvents[K]>
    ) => void;
  };

  const handlers: SocketHandlers = {
    newGame: (name: string) => {
      try {
        theServerManager.newGame(name, socket.id);
      } catch (error) {
        console.error(`failed to create new game because: ${error}`);
      }
    },
    joinGame: (gameId: string) => {
      try {
        theServerManager.joinGame(gameId, socket.id);
      } catch (error) {
        console.error(`failed to join game because: ${error}`);
      }
    },
    leaveGame: () => {
      try {
        theServerManager.leaveGame(socket.id);
      } catch (error) {
        console.error(`failed to leave game because: ${error}`);
      }
    },
    joinServer: (name: string) => {
      try {
        theServerManager.joinServer({ name, socket });
      } catch (error) {
        console.error(`failed to connect user because: ${error}`);
      }
    },
  };

  const unsubscribeSocket = () => {
    eventNames.forEach((event) => {
      socket.off(event, handlers[event]);
    });
    socket.off("disconnect", disconnectHandler);
  };

  const disconnectHandler = (reason: DisconnectReason) => {
    try {
      unsubscribeSocket();
      theServerManager.disconnect(socket.id, reason);
    } catch (error) {
      console.error(`failed to disconnect user because: ${error}`);
    }
  };

  const eventNames = Object.keys(handlers) as Array<
    keyof OutOfGameClientToServerEvents
  >;

  // Register all handlers
  eventNames.forEach((event) => {
    socket.on(event, handlers[event]);
  });
  socket.on("disconnect", disconnectHandler);
}

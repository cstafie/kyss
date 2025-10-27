import { ClientToServerEvents, ServerToClientEvents } from "shared";
import { Socket } from "socket.io";

export type ServerSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

export type ServerUser = {
  name: string;
  socket: ServerSocket;
  currentGameId: string;
  disconnectTimeout?: NodeJS.Timeout;
  sessionId: string;
};

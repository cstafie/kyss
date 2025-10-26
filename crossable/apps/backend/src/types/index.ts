import { ClientToServerEvents, ServerToClientEvents } from "shared";
import { Socket } from "socket.io";

export type ServerSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

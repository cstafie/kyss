import { type ClientToServerEvents, type ServerToClientEvents } from "shared";
import { createContext } from "react";
import { createSafeUseContext } from "../util";
import type { SocketActions } from "@/services/socketActions";
import type { Socket } from "socket.io-client";

interface UserContext {
  name: string;
  sessionId: string;
  setName: (name: string) => void;
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  isConnected: boolean;
  error: Error | null;
  socketActions: SocketActions;
}

export const UserContext = createContext<UserContext | null>(null);
export const useUser = createSafeUseContext(UserContext, "useUser");

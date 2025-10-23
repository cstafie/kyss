import {
  type ClientToServerEvents,
  type ServerToClientEvents,
  type User,
} from "shared";
import { createContext } from "react";
import { createSafeUseContext } from "../util";
import type { Socket } from "socket.io-client";

interface UserContext {
  signedIn: boolean;
  user: User;
  setName: (name: string) => void;
  socket: Socket<ClientToServerEvents, ServerToClientEvents> | null;
  isConnected: boolean;
  error: Error | null;
}

export const UserContext = createContext<UserContext | null>(null);
export const useUser = createSafeUseContext(UserContext, "useUser");

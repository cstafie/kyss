import { type User } from "shared";
import { createContext } from "react";
import { createSafeUseContext } from "../util";

interface Auth {
  signedIn: boolean;
  user: User;
  setName: (name: string) => void;
}

export const AuthContext = createContext<Auth | null>(null);
export const useAuth = createSafeUseContext(AuthContext, "useAuth");

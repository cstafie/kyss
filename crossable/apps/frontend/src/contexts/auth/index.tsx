import { type User } from "shared";
import { createContext, useContext } from "react";

interface Auth {
  signedIn: boolean;
  user: User;
  setName: (name: string) => void;
}

export const AuthContext = createContext<Auth | null>(null);

export const useAuthContext = () => useContext(AuthContext);

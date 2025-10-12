import { createContext, useContext, type ReactNode } from "react";

interface Nav {
  setNavLeft: (node: ReactNode) => void;
  resetNavLeft: () => void;
}

export const NavContext = createContext<Nav | null>(null);
export const useNavContext = () => useContext(NavContext);

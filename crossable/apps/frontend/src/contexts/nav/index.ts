import { createContext, type ReactNode } from "react";
import { createSafeUseContext } from "../util";

interface Nav {
  setNavLeft: (node: ReactNode) => void;
  resetNavLeft: () => void;
}

export const NavContext = createContext<Nav | null>(null);
export const useNav = createSafeUseContext(NavContext, "useNav");

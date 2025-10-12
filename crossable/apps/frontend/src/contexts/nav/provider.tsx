import { Link } from "react-router-dom";
import Emoji from "@/components/emoji";
import { Menu, MenuItem } from "@/components/menu";
import NavTitle from "@/components/nav_title";
import UserName from "@/components/user_name/user_name";
import { useCallback, useState, type ReactNode } from "react";
import { NavContext } from ".";

export default function NavContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [navLeft, setNavLeft] = useState<ReactNode>(<NavTitle />);

  const resetNavLeft = useCallback(() => {
    setNavLeft(<NavTitle />);
  }, []);

  return (
    <NavContext.Provider
      value={{
        setNavLeft,
        resetNavLeft,
      }}
    >
      <nav className="p-2 bg-neutral-800 max-h-12 h-12 flex justify-center w-full">
        <ul className="flex justify-between items-center gap-4 h-full w-full max-w-screen-2xl">
          <li className="w-full">{navLeft}</li>
          <li className="flex items-center">
            <UserName />
            <Menu>
              <Link to="/">
                <MenuItem>
                  <Emoji description="Home">🏡</Emoji> Home
                </MenuItem>
              </Link>
              <Link to="/instructions">
                <MenuItem>
                  <Emoji description="Notebook">📔</Emoji> Instructions
                </MenuItem>
              </Link>
              <Link to="/feedback">
                <MenuItem>
                  <Emoji description="Megaphone">📣</Emoji> Feedback
                </MenuItem>
              </Link>
              <a
                href="https://www.buymeacoffee.com/crossable"
                target="_blank"
                rel="noreferrer"
              >
                <MenuItem>
                  <Emoji description="Heart">💜</Emoji> Donate
                </MenuItem>
              </a>
            </Menu>
          </li>
        </ul>
      </nav>
      {children}
    </NavContext.Provider>
  );
}

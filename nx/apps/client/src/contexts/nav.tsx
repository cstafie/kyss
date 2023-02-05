import React, { createContext, useCallback, useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import Emoji from '../components/emoji';
import { Menu, MenuItem } from '../components/menu';
import NavTitle from '../components/nav_title';
import UserName from '../components/user_name/user_name';

interface Nav {
  setNavLeft: (node: React.ReactNode) => void;
  resetNavLeft: () => void;
}

const NavContext = createContext<Nav>({
  setNavLeft: (node: React.ReactNode) =>
    console.error('No matching provider for NavContext'),
  resetNavLeft: () => console.error('No matching provider for NavContext'),
});

export const useNavContext = () => useContext(NavContext);

interface Props {
  children: React.ReactNode;
}

export const NavContextProvider = ({ children }: Props) => {
  const [navLeft, setNavLeft] = useState<React.ReactNode>(<NavTitle />);

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
              <Link to="/coffee">
                <MenuItem>
                  <Emoji description="Coffee">☕</Emoji> Buy me a coffee
                </MenuItem>
              </Link>
            </Menu>
          </li>
        </ul>
      </nav>
      {children}
    </NavContext.Provider>
  );
};

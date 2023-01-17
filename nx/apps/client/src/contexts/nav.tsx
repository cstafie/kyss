import React, { createContext, useCallback, useContext, useState } from 'react';
import { Link } from 'react-router-dom';
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

export const NavContextProvider = ({ children }: any) => {
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
      <nav className="p-2 bg-neutral-800 max-h-12 h-12">
        <ul className="flex justify-between items-center gap-4 h-full">
          <li className="w-full">{navLeft}</li>
          <li className="w-full">
            <UserName />
          </li>
        </ul>
      </nav>
      {children}
    </NavContext.Provider>
  );
};

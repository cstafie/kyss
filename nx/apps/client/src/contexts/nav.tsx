import React, { createContext, useCallback, useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import UserName from '../components/user_name';

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

const NavTitle = () => (
  <Link to="/">
    <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-500 to-purple-700 text-transparent bg-clip-text w-fit">
      CROSSABLE
    </h1>
  </Link>
);

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
      <nav className="p-2 mb-4 bg-neutral-800 max-h-12 h-12">
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

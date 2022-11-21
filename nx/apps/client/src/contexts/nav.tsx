import React, { createContext, useContext, useState } from 'react';
import UserName from '../screens/user_name';

interface Nav {
  setNavLeft: (node: React.ReactNode) => void;
}

const NavContext = createContext<Nav>({
  setNavLeft: (node: React.ReactNode) =>
    console.error('No matching provider for NavContext'),
});

export const useNavContext = () => useContext(NavContext);

export const NavContextProvider = ({ children }: any) => {
  const [navLeft, setNavLeft] = useState<React.ReactNode>();

  return (
    <NavContext.Provider
      value={{
        setNavLeft,
      }}
    >
      <nav className="p-2 mb-4 bg-neutral-800">
        <ul className="flex justify-between gap-4">
          <li>{navLeft}</li>
          <li>
            <UserName />
          </li>
        </ul>
      </nav>
      {children}
    </NavContext.Provider>
  );
};

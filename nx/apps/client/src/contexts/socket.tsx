import { Game, GameUpdate } from '@nx/api-interfaces';
import { createContext, useContext, useEffect, useState } from 'react';

interface Socket {
  createGame: () => void;
  updateGame: (gameUpdate: GameUpdate) => void;
  games: Array<Game>;
}

const SocketContext = createContext<Socket>({
  createGame: () => console.error('No matching provider for SocketContext'),
  updateGame: () => console.error('No matching provider for SocketContext'),
});

export const useSocketContext = () => useContext(SocketContext);

export const SocketContextProvider = ({ children }: any) => {
  const [id, setID] = reactUseCookie('id');
  const [name, setName] = reactUseCookie('name');

  // no auth pages yet, so user is always signed in
  const [signedIn, setSignedIn] = useState(true);

  // user auto "signs in"
  useEffect(() => {
    if (!id) {
      setID(uuidv4());
    } else {
      // keep cookie fresh
      setID(id);
    }

    if (!name) {
      setName(uuidv4());
    } else {
      // keep cookie fresh
      setName(name);
    }
  });

  console.log(id, name);

  return (
    <SocketContext.Provider
      value={{
        signedIn,
        user: {
          id,
          name,
        },
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

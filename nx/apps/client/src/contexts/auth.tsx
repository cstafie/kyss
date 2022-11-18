import { User } from '@nx/api-interfaces';
import { createContext, useContext, useEffect, useState } from 'react';
import reactUseCookie from 'react-use-cookie';
import { v4 as uuidv4 } from 'uuid';

interface Auth {
  signedIn: boolean;
  user: User;
  setName: (name: string) => void;
}

const AuthContext = createContext<Auth>({
  signedIn: false,
  user: {
    name: '',
    id: '',
  },
  setName: (name: string) =>
    console.error('No matching provider for AuthContext'),
});

const PLAYER_NAME_LENGTH = 6;

export const useAuthContext = () => useContext(AuthContext);

export const AuthContextProvider = ({ children }: any) => {
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
      setName(`guest-${uuidv4().substring(0, PLAYER_NAME_LENGTH)}`);
    } else {
      // keep cookie fresh
      setName(name);
    }
  }, []);

  console.log(id, name);

  return (
    <AuthContext.Provider
      value={{
        signedIn,
        user: {
          id,
          name,
        },
        setName: setName as (name: string) => void,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

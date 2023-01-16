import { User } from '@nx/api-interfaces';
import { createContext, useContext, useEffect, useState } from 'react';
import reactUseCookie from 'react-use-cookie';
import { v4 as uuidv4 } from 'uuid';
import NavTitle from '../components/nav_title';
import UserNameForm from '../components/user_name/user_name_form';

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

export const useAuthContext = () => useContext(AuthContext);

export const AuthContextProvider = ({ children }: any) => {
  const [id, setID] = reactUseCookie('id');
  const [name, setName] = reactUseCookie('name');

  // no auth pages yet, so user is always signed in
  const [signedIn, setSignedIn] = useState(true);

  // user auto "signs in"
  useEffect(() => {
    if (!id) {
      // TODO: backend not frontend should be giving ids
      setID(uuidv4());
    } else {
      // keep cookie fresh
      setID(id);
    }

    if (!name) {
      // keep cookie fresh
      setName(name);
    }
  }, []);

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
      {!name && (
        <section className="bg-neutral-900 fixed w-full h-full flex flex-col items-center pt-40 bg-opacity-90 ">
          <section className="bg-gray-700 p-24 px-48 flex flex-col items-center gap-8 rounded-xl">
            <NavTitle className="text-6xl" />
            <section className="flex flex-col gap-4 p-12">
              <h2 className="text-lg"> USER NAME </h2>
              <UserNameForm className="flex justify-between gap-4 items-center" />
              <div className="mt-8 max-w-xs">
                ❔ Enter a user name other players can know you by. No need to
                think too hard, you can always change it later! 😃
              </div>
            </section>
          </section>
        </section>
      )}
      {children}
    </AuthContext.Provider>
  );
};

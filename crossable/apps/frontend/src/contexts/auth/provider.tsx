import { useEffect, type ReactNode } from "react";
import reactUseCookie from "react-use-cookie";
import Emoji from "@/components/emoji";
import NavTitle from "@/components/nav_title";
import UserNameForm from "@/components/user_name/user_name_form";
import { AuthContext } from ".";

export default function AuthContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [id, setID] = reactUseCookie("id");
  const [name, setName] = reactUseCookie("name");

  // user auto "signs in"
  useEffect(() => {
    if (!id) {
      // TODO: backend not frontend should be giving ids
      setID(crypto.randomUUID());
    } else {
      // keep cookie fresh
      setID(id);
    }

    if (!name) {
      // keep cookie fresh
      setName(name);
    }
  }); // empty dependency array so this only runs once

  return (
    <AuthContext.Provider
      value={{
        signedIn: true,
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
            <section className="flex flex-col items-center gap-4 p-12">
              <h2 className="text-lg"> USER NAME </h2>
              <UserNameForm className="flex justify-start gap-4 items-center" />
              <div className="mt-8 max-w-xs">
                <Emoji description="Question mark">❔</Emoji>
                Enter a user name which other players can know you by. No need
                to think too hard, you can always change it later!{" "}
                <Emoji description="Smiley face">😃</Emoji>
              </div>
            </section>
          </section>
        </section>
      )}
      {children}
    </AuthContext.Provider>
  );
}

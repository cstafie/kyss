import { useEffect, type ReactNode, useCallback, useMemo } from "react";
import reactUseCookie from "react-use-cookie";
import Emoji from "@/components/emoji";
import NavTitle from "@/components/nav_title";
import UserNameForm from "@/components/user_name/user_name_form";
import { UserContext } from ".";
import { useSocket } from "./useSocket";
import { SocketActions } from "@/services/socketActions";

export default function UserContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const onConnect = useCallback(() => console.log("Socket connected"), []);
  const onDisconnect = useCallback(
    () => console.log("Socket disconnected"),
    []
  );
  const onError = useCallback(
    (error: Error) => console.error("Socket error:", error),
    []
  );

  const [id, setID] = reactUseCookie("id");
  const [name, setName] = reactUseCookie("name");
  const { socket, isConnected, error } = useSocket({
    url: "http://localhost:3333",
    onConnect,
    onDisconnect,
    onError,
  });

  // Socket actions
  const actions = useMemo(() => new SocketActions(socket), [socket]);

  // keep cookies in sync with state
  // only run once
  useEffect(() => {
    // keep cookies in sync
    if (id) setID(id);
    if (name) setName(name);
  });

  useEffect(() => {
    if (!socket) return;

    socket.on("updateUser", (user) => {
      setID(user.id);
    });
  }, [socket, setID]);

  return (
    <UserContext.Provider
      value={{
        signedIn: true,
        user: {
          id,
          name,
        },
        setName,
        isConnected,
        error,
        socketActions: actions,
        socket,
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
    </UserContext.Provider>
  );
}

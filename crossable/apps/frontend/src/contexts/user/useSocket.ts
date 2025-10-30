import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import type { ServerToClientEvents, ClientToServerEvents } from "shared";

interface UseSocketOptions {
  autoConnect?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

interface SocketState {
  isConnected: boolean;
  error: Error | null;
}

export function useSocket(options: UseSocketOptions) {
  console.log("useSocket called");
  const { onConnect, onDisconnect, onError } = options;

  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents>>(
    io(import.meta.env.VITE_SERVER_URL, {
      transports: ["polling", "websocket"],
      path: "/socket.io",
      autoConnect: false,
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 1,
      reconnectionDelay: 1000,
    })
  );
  const [state, setState] = useState<SocketState>({
    isConnected: false,
    error: null,
  });

  useEffect(() => {
    console.log("Creating socket instance");

    // Connection handlers
    const handleConnect = () => {
      setState({ isConnected: true, error: null });
      onConnect?.();
    };

    const handleDisconnect = () => {
      setState((prev) => ({ ...prev, isConnected: false }));
      onDisconnect?.();
    };

    // TODO: figure out why type error on this event
    // const handleError = (error: Error) => {
    //   setState((prev) => ({ ...prev, error }));
    //   onError?.(error);
    // };

    const handleConnectError = (error: Error) => {
      setState({ isConnected: false, error });
      onError?.(error);
    };

    // Register event listeners
    socketRef.current.on("connect", handleConnect);
    socketRef.current.on("disconnect", handleDisconnect);
    // socketRef.current.on("error", handleError);
    socketRef.current.on("connect_error", handleConnectError);

    // Frontend
    socketRef.current.onAny((event, ...args) => {
      console.log("Emitting:", event, args);
    });

    // Cleanup on unmount
    return () => {
      socketRef.current.off("connect", handleConnect);
      socketRef.current.off("disconnect", handleDisconnect);
      // socketRef.current.off("error", handleError);
      socketRef.current.off("connect_error", handleConnectError);
      socketRef.current.close();
    };
  }, [onConnect, onDisconnect, onError]);

  return {
    socket: socketRef.current,
    ...state,
  };
}

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

  const socketRef = useRef<Socket<
    ServerToClientEvents,
    ClientToServerEvents
  > | null>(null);
  const [state, setState] = useState<SocketState>({
    isConnected: false,
    error: null,
  });

  useEffect(() => {
    // Create socket instance
    // TODO: replace with env variable
    const socket = io("https://crossable.cristianstafie.ca/socket.io", {
      autoConnect: false,
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 1,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    // Connection handlers
    const handleConnect = () => {
      setState({ isConnected: true, error: null });
      onConnect?.();
    };

    const handleDisconnect = () => {
      setState((prev) => ({ ...prev, isConnected: false }));
      onDisconnect?.();
    };

    const handleError = (error: Error) => {
      setState((prev) => ({ ...prev, error }));
      onError?.(error);
    };

    const handleConnectError = (error: Error) => {
      setState({ isConnected: false, error });
      onError?.(error);
    };

    // Register event listeners
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("error", handleError);
    socket.on("connect_error", handleConnectError);

    // Frontend
    socket.onAny((event, ...args) => {
      console.log("Emitting:", event, args);
    });

    // Cleanup on unmount
    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("error", handleError);
      socket.off("connect_error", handleConnectError);
      socket.close();
      socketRef.current = null;
    };
  }, [onConnect, onDisconnect, onError]);

  return {
    socket: socketRef.current,
    ...state,
  };
}

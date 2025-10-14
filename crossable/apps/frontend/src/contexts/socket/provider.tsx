import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { produce } from "immer";
import { type GameInfo, SocketContext } from ".";
import type { Tile, BotDifficulty } from "shared";
import { useAuth } from "@/contexts/auth";
import { useSocket } from "@/hooks/useSocket";
import { useGameState } from "@/hooks/useGameState";
import { useGameNavigation } from "@/hooks/useGameNavigation";
import { SocketActions } from "@/services/socketActions";
// import { config } from "@/config";

export default function SocketContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = useAuth();
  const [game, setGame] = useState<GameInfo | null>(null);

  // Socket connection with error handling
  const {
    socket,
    isConnected,
    error: socketError,
  } = useSocket({
    url: "http://localhost:4444",
    autoConnect: true,
    onConnect: () => {
      console.log("Socket connected");
    },
    onDisconnect: () => {
      console.log("Socket disconnected");
    },
    onError: (error) => {
      console.error("Socket error:", error);
    },
  });

  // Game state management
  const {
    games,
    game: serverGame,
    incorrectPosStrings,
    error: gameError,
  } = useGameState(socket);

  // Sync server game state with local state
  useEffect(() => {
    if (serverGame) {
      setGame(serverGame);
    } else {
      setGame(null);
    }
  }, [serverGame]);

  // Navigation based on game state
  useGameNavigation({ game });

  // Socket actions
  const actions = useMemo(() => new SocketActions(socket), [socket]);

  // Join server when user info is available
  useEffect(() => {
    if (user.name && user.id && isConnected) {
      try {
        actions.joinServer({ id: user.id, name: user.name });
      } catch (error) {
        console.error("Failed to join server:", error);
      }
    }
  }, [user.name, user.id, isConnected, actions]);

  // Context methods
  const createGame = useCallback(() => {
    try {
      return actions.createGame();
    } catch (error) {
      console.error("Failed to create game:", error);
      throw error;
    }
  }, [actions]);

  const joinGame = useCallback(
    (gameId: string) => {
      try {
        actions.joinGame(gameId);
      } catch (error) {
        console.error("Failed to join game:", error);
        throw error;
      }
    },
    [actions]
  );

  const startGame = useCallback(() => {
    try {
      actions.startGame();
    } catch (error) {
      console.error("Failed to start game:", error);
      throw error;
    }
  }, [actions]);

  const addBot = useCallback(() => {
    try {
      actions.addBot();
    } catch (error) {
      console.error("Failed to add bot:", error);
      throw error;
    }
  }, [actions]);

  const removeBot = useCallback(
    (botId: string) => {
      try {
        actions.removeBot(botId);
      } catch (error) {
        console.error("Failed to remove bot:", error);
        throw error;
      }
    },
    [actions]
  );

  const setBotDifficulty = useCallback(
    (id: string, difficulty: BotDifficulty) => {
      try {
        actions.setBotDifficulty(id, difficulty);
      } catch (error) {
        console.error("Failed to set bot difficulty:", error);
        throw error;
      }
    },
    [actions]
  );

  const playTile = useCallback(
    (tileId: string, pos: [number, number]) => {
      if (!game || game.xWord.grid[pos[0]][pos[1]].char !== " ") {
        return;
      }

      const tileIndex = game.tileBar.findIndex((tile) => tile.id === tileId);
      if (tileIndex === -1) {
        return;
      }

      try {
        // Send to server
        actions.playTile(tileId, pos);

        // Optimistic update
        const tile = game.tileBar[tileIndex];
        setGame(
          produce(game, (draft) => {
            draft.xWord.grid[pos[0]][pos[1]] = tile;
            draft.tileBar.splice(tileIndex, 1);
          })
        );
      } catch (error) {
        console.error("Failed to play tile:", error);
        // Note: Server will send correct state via updateGame event
      }
    },
    [game, actions]
  );

  const leaveGame = useCallback(() => {
    try {
      actions.leaveGame();
      setGame(null);
    } catch (error) {
      console.error("Failed to leave game:", error);
      throw error;
    }
  }, [actions]);

  const updateTileBar = useCallback(
    (tileBar: Tile[]) => {
      setGame((prevGame) =>
        prevGame
          ? produce(prevGame, (draft) => {
              draft.tileBar = tileBar;
            })
          : prevGame
      );

      try {
        actions.updateTileBar(tileBar.map((tile) => tile.id));
      } catch (error) {
        console.error("Failed to update tile bar:", error);
      }
    },
    [actions]
  );

  const setReady = useCallback(
    (ready: boolean) => {
      try {
        actions.setReady(ready);
      } catch (error) {
        console.error("Failed to set ready status:", error);
        throw error;
      }
    },
    [actions]
  );

  const contextValue = useMemo(
    () => ({
      setReady,
      createGame,
      playTile,
      updateTileBar,
      joinGame,
      startGame,
      leaveGame,
      games,
      game,
      incorrectPosStrings,
      addBot,
      removeBot,
      setBotDifficulty,
      isConnected,
      error: socketError || gameError,
    }),
    [
      setReady,
      createGame,
      playTile,
      updateTileBar,
      joinGame,
      startGame,
      leaveGame,
      games,
      game,
      incorrectPosStrings,
      addBot,
      removeBot,
      setBotDifficulty,
      isConnected,
      socketError,
      gameError,
    ]
  );

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
}

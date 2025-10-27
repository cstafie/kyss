import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { produce } from "immer";
import { GameContext, type GameInfo } from ".";
import type { Tile, BotDifficulty } from "shared";
import { useUser } from "@/contexts/user";
import { useGameState } from "@/hooks/useGameState";
import { useGameNavigation } from "@/hooks/useGameNavigation";

export default function GameContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { name, isConnected, socketActions, socket, sessionId } = useUser();
  const [game, setGame] = useState<GameInfo | null>(null);

  //
  // Game state management
  const {
    games,
    game: serverGame,
    incorrectPosStrings,
    error: gameError,
  } = useGameState(socket);

  // Sync server game state with local state
  useEffect(() => {
    console.log("Server game state updated:", serverGame);
    if (serverGame) {
      setGame(serverGame);
    } else {
      setGame(null);
    }
  }, [serverGame]);

  // Navigation based on game state
  useGameNavigation({ game });

  // Join server when user info is available
  useEffect(() => {
    if (name && isConnected) {
      try {
        console.log("Joining server with user:", name);
        socketActions.joinServer({ name, sessionId });
      } catch (error) {
        console.error("Failed to join server:", error);
      }
    }
  }, [name, isConnected, sessionId, socketActions]);

  // Context methods
  const createGame = useCallback(() => {
    try {
      return socketActions.createGame();
    } catch (error) {
      console.error("Failed to create game:", error);
      throw error;
    }
  }, [socketActions]);

  const joinGame = useCallback(
    (gameId: string) => {
      try {
        socketActions.joinGame(gameId);
      } catch (error) {
        console.error("Failed to join game:", error);
        throw error;
      }
    },
    [socketActions]
  );

  const startGame = useCallback(() => {
    try {
      socketActions.startGame();
    } catch (error) {
      console.error("Failed to start game:", error);
      throw error;
    }
  }, [socketActions]);

  const addBot = useCallback(() => {
    try {
      socketActions.addBot();
    } catch (error) {
      console.error("Failed to add bot:", error);
      throw error;
    }
  }, [socketActions]);

  const removeBot = useCallback(
    (botId: string) => {
      try {
        socketActions.removeBot(botId);
      } catch (error) {
        console.error("Failed to remove bot:", error);
        throw error;
      }
    },
    [socketActions]
  );

  const setBotDifficulty = useCallback(
    (id: string, difficulty: BotDifficulty) => {
      try {
        socketActions.setBotDifficulty(id, difficulty);
      } catch (error) {
        console.error("Failed to set bot difficulty:", error);
        throw error;
      }
    },
    [socketActions]
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
        socketActions.playTile(tileId, pos);

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
    [game, socketActions]
  );

  const leaveGame = useCallback(() => {
    try {
      socketActions.leaveGame();
      setGame(null);
    } catch (error) {
      console.error("Failed to leave game:", error);
      throw error;
    }
  }, [socketActions]);

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
        socketActions.updateTileBar(tileBar.map((tile) => tile.id));
      } catch (error) {
        console.error("Failed to update tile bar:", error);
      }
    },
    [socketActions]
  );

  const setReady = useCallback(
    (ready: boolean) => {
      try {
        socketActions.setReady(ready);
      } catch (error) {
        console.error("Failed to set ready status:", error);
        throw error;
      }
    },
    [socketActions]
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
      error: gameError,
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
      gameError,
    ]
  );

  return (
    <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>
  );
}

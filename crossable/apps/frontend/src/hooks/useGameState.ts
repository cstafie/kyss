import { useState, useEffect, useCallback, useRef } from "react";
import { produce } from "immer";
import type { Socket } from "socket.io-client";
import type {
  GameMetaData,
  ServerToClientEvents,
  ClientToServerEvents,
  ServerGameUpdate,
} from "shared";
import { makePosString } from "@/utils";
import type { GameInfo } from "@/contexts/socket";

type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface UseGameStateReturn {
  games: GameMetaData[];
  game: GameInfo | null;
  incorrectPosStrings: Set<string>;
  isLoading: boolean;
  error: Error | null;
}

export function useGameState(socket: GameSocket | null): UseGameStateReturn {
  const [games, setGames] = useState<GameMetaData[]>([]);
  const [game, setGame] = useState<GameInfo | null>(null);
  const [incorrectPosStrings, setIncorrectPosStrings] = useState(
    new Set<string>()
  );
  //   const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const incorrectTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Clean up timeouts on unmount
  useEffect(() => {
    const refCurrent = incorrectTimeoutsRef.current;
    return () => {
      refCurrent.forEach((timeout) => clearTimeout(timeout));
      refCurrent.clear();
    };
  }, []);

  const handleUpdateGame = useCallback((gameUpdate: ServerGameUpdate) => {
    try {
      const { serializedPlayersMap, serializedBotsMap, ...rest } = gameUpdate;
      setGame({
        players: new Map(JSON.parse(serializedPlayersMap)),
        bots: new Map(JSON.parse(serializedBotsMap)),
        ...rest,
      });
      setError(null);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to update game");
      setError(error);
      console.error("Error updating game:", error);
    }
  }, []);

  const handleUpdateGamesList = useCallback((gamesList: GameMetaData[]) => {
    try {
      setGames(gamesList);
      setError(null);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to update games list");
      setError(error);
      console.error("Error updating games list:", error);
    }
  }, []);

  const handleIncorrectTilePlayed = useCallback((pos: [number, number]) => {
    const posString = makePosString(pos);

    // Clear existing timeout for this position if any
    const existingTimeout = incorrectTimeoutsRef.current.get(posString);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    setIncorrectPosStrings((prev) =>
      produce(prev, (draft) => {
        draft.add(posString);
      })
    );

    const timeout = setTimeout(() => {
      setIncorrectPosStrings((prev) =>
        produce(prev, (draft) => {
          draft.delete(posString);
        })
      );
      incorrectTimeoutsRef.current.delete(posString);
    }, 750);

    incorrectTimeoutsRef.current.set(posString, timeout);
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("updateGame", handleUpdateGame);
    socket.on("updateGamesList", handleUpdateGamesList);
    socket.on("incorrectTilePlayed", handleIncorrectTilePlayed);

    return () => {
      socket.off("updateGame", handleUpdateGame);
      socket.off("updateGamesList", handleUpdateGamesList);
      socket.off("incorrectTilePlayed", handleIncorrectTilePlayed);
    };
  }, [
    socket,
    handleUpdateGame,
    handleUpdateGamesList,
    handleIncorrectTilePlayed,
  ]);

  return {
    games,
    game,
    incorrectPosStrings,
    isLoading: false,
    error,
  };
}

// Helper hook for optimistic updates
export function useOptimisticTilePlay(
  game: GameInfo | null,
  setGame: (game: GameInfo | null) => void
) {
  const pendingMovesRef = useRef<
    Map<string, { tileId: string; pos: [number, number] }>
  >(new Map());

  const playTileOptimistic = useCallback(
    (tileId: string, pos: [number, number]) => {
      if (!game || game.xWord.grid[pos[0]][pos[1]].char !== " ") {
        return false;
      }

      const tileIndex = game.tileBar.findIndex((tile) => tile.id === tileId);
      if (tileIndex === -1) {
        return false;
      }

      const moveId = `${tileId}-${pos[0]}-${pos[1]}`;
      pendingMovesRef.current.set(moveId, { tileId, pos });

      const tile = game.tileBar[tileIndex];

      setGame(
        produce(game, (draft) => {
          draft.xWord.grid[pos[0]][pos[1]] = tile;
          draft.tileBar.splice(tileIndex, 1);
        })
      );

      return true;
    },
    [game, setGame]
  );

  const rollbackMove = useCallback(
    (tileId: string, pos: [number, number]) => {
      if (!game) return;

      const moveId = `${tileId}-${pos[0]}-${pos[1]}`;
      if (!pendingMovesRef.current.has(moveId)) return;

      pendingMovesRef.current.delete(moveId);

      // Rollback would need server state to restore properly
      // For now, we rely on server sending the correct state
    },
    [game]
  );

  useEffect(() => {
    const refCurrent = pendingMovesRef.current;
    return () => {
      refCurrent.clear();
    };
  }, []);

  return { playTileOptimistic, rollbackMove };
}

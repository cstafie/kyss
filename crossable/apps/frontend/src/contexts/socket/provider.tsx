import { useState, useEffect, useCallback, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { produce } from "immer";
import { SocketContext } from ".";
import type {
  GameMetaData,
  Tile,
  ServerToClientEvents,
  ClientToServerEvents,
  BotDifficulty,
  ServerGameUpdate,
} from "shared";
import { useAuth } from "@/contexts/auth";
import { makePosString } from "@/utils";
import { type GameInfo } from "@/contexts/socket";
import { io, Socket } from "socket.io-client";

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io();

const GAME_NAME_LENGTH = 6;

const createGame = () => {
  const gameName = `game-${crypto.randomUUID().substring(0, GAME_NAME_LENGTH)}`;
  socket.emit("newGame", gameName);
};

const joinGame = (gameId: string) => {
  socket.emit("joinGame", gameId);
};

const startGame = () => {
  socket.emit("startGame");
};

const joinServer = (userInfo: { id: string; name: string }) => {
  socket.emit("joinServer", userInfo);
};

const addBot = () => {
  socket.emit("addBot");
};

const removeBot = (botId: string) => {
  socket.emit("removeBot", botId);
};

const setBotDifficulty = (id: string, difficulty: BotDifficulty) => {
  socket.emit("setBotDifficulty", { id, difficulty });
};

export default function SocketContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useAuth();

  const [games, setGames] = useState<Array<GameMetaData>>([]);
  const [game, setGame] = useState<GameInfo | null>(null);
  const [incorrectPosStrings, setIncorrectPosStrings] = useState(
    new Set<string>()
  );

  useEffect(() => {
    // todo make these paths constants
    if (location.pathname === "/xword" && game === null) {
      navigate("/");
    } else if (location.pathname === "/" && game !== null) {
      navigate("/xword");
    }
  }, [navigate, location, game]);

  useEffect(() => {
    // TODO: should this run on `socket.on('connect', () => {...})`
    if (user.name && user.id) {
      joinServer({ id: user.id, name: user.name });
    }
  }, [user.name, user.id]);

  const handleUpdateGame = useCallback((gameUpdate: ServerGameUpdate) => {
    const { serializedPlayersMap, serializedBotsMap, ...rest } = gameUpdate;
    setGame({
      players: new Map(JSON.parse(serializedPlayersMap)),
      bots: new Map(JSON.parse(serializedBotsMap)),
      ...rest,
    });
  }, []);

  const handleUpdateGamesList = useCallback((games: Array<GameMetaData>) => {
    setGames(games);
  }, []);

  const handleIncorrectTilePlayed = useCallback((pos: [number, number]) => {
    const posString = makePosString(pos);
    setIncorrectPosStrings((incorrectPosStrings) =>
      produce(incorrectPosStrings, (draft) => {
        draft.add(posString);
      })
    );
    setTimeout(() => {
      setIncorrectPosStrings((incorrectPosStrings) =>
        produce(incorrectPosStrings, (draft) => {
          draft.delete(posString);
        })
      );
    }, 750);
  }, []);

  useEffect(() => {
    socket.on("updateGame", handleUpdateGame);
  });

  useEffect(() => {
    socket.on("updateGamesList", handleUpdateGamesList);
  });

  useEffect(() => {
    socket.on("incorrectTilePlayed", handleIncorrectTilePlayed);
  });

  const playTile = useCallback(
    (tileId: string, [row, col]: [number, number]) => {
      if (!game || game.xWord.grid[row][col].char !== " ") {
        return;
      }

      socket.emit("playTile", { id: tileId, pos: [row, col] });

      const tileIndex = game.tileBar.findIndex((tile) => tile.id === tileId);
      if (tileIndex === -1) {
        return;
      }

      const tile = game.tileBar.splice(tileIndex, 1)[0];

      setGame(
        produce(game, (gameDraft) => {
          gameDraft.xWord.grid[row][col] = tile;
        })
      );
    },
    [game]
  );

  const leaveGame = useCallback(() => {
    socket.emit("leaveGame");
    setGame(null);
  }, []);

  const updateTileBar = useCallback((tileBar: Array<Tile>) => {
    setGame((prevGame) =>
      prevGame
        ? {
            ...prevGame,
            tileBar,
          }
        : prevGame
    );

    socket.emit(
      "updateTileBar",
      tileBar.map((tile) => tile.id)
    );
  }, []);

  const setReady = useCallback((ready: boolean) => {
    socket.emit("setReady", ready);
  }, []);

  return (
    <SocketContext.Provider
      value={{
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
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

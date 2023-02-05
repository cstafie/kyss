import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import { useLocation, useNavigate } from 'react-router-dom';
import produce from 'immer';

import {
  GameMetaData,
  PlayerInfo,
  XWord,
  GameState,
  Tile,
  SocketClientToServerEvents,
  ClientToServerEvent,
  SocketServerToClientEvents,
  ClientToGameEvent,
  ServerToClientEvent,
  ServerToClientEvents,
  BotDifficulty,
  BotInfo,
  GameToClientEvent,
  GameToClientEvents,
} from '@nx/api-interfaces';

import { useAuthContext } from './auth';
import { makePosString } from '../utils';

export interface GameInfo {
  xWord: XWord;
  gameState: GameState;
  players: Map<string, PlayerInfo>;
  bots: Map<string, BotInfo>;
  ready: boolean;
  tileBar: Array<Tile>;
  gameCreatorId: string;
}

interface SocketContextI {
  createGame: () => void;
  playTile: (tileId: string, pos: [number, number]) => void;
  updateTileBar: (tileBar: Array<Tile>) => void;
  joinGame: (gameId: string) => void;
  startGame: () => void;
  leaveGame: () => void;
  setReady: (ready: boolean) => void;
  games: Array<GameMetaData>;
  game: GameInfo | null;
  incorrectPosStrings: Set<string>;
  addBot: () => void;
  removeBot: (botId: string) => void;
  setBotDifficulty: (botId: string, difficulty: BotDifficulty) => void;
}

const warning = () => console.error('No matching provider for SocketContext');
const SocketContext = createContext<SocketContextI>({
  createGame: () => warning(),
  playTile: (tileId: string, pos: [number, number]) => warning(),
  joinGame: (gameId: string) => warning(),
  updateTileBar: (tileBar: Array<Tile>) => warning(),
  startGame: () => warning(),
  leaveGame: () => warning(),
  setReady: (ready: boolean) => warning(),
  games: [],
  game: null,
  incorrectPosStrings: new Set(),
  addBot: () => warning(),
  removeBot: (botId: string) => warning(),
  setBotDifficulty: (botId: string, difficulty: BotDifficulty) => warning(),
});

export const useSocketContext = () => useContext(SocketContext);

const socket: Socket<SocketServerToClientEvents, SocketClientToServerEvents> =
  io();

const GAME_NAME_LENGTH = 6;

// TODO: make these event emitters DRY
const createGame = () => {
  const gameName = `game-${uuidv4().substring(0, GAME_NAME_LENGTH)}`;
  const event: ClientToServerEvent<'newGame'> = {
    type: 'newGame',
    data: { name: gameName },
  };
  socket.emit('clientToServerEvent', event);
};

const joinGame = (gameId: string) => {
  const event: ClientToServerEvent<'joinGame'> = {
    type: 'joinGame',
    data: { gameId },
  };
  socket.emit('clientToServerEvent', event);
};

const startGame = () => {
  const event: ClientToGameEvent<'startGame'> = {
    type: 'startGame',
    data: null,
  };
  socket.emit('clientToGameEvent', event);
};

const joinServer = (userId: string, userName: string) => {
  const event: ClientToServerEvent<'joinServer'> = {
    type: 'joinServer',
    data: { id: userId, name: userName },
  };
  socket.emit('clientToServerEvent', event);
};

const addBot = () => {
  const event: ClientToGameEvent<'addBot'> = {
    type: 'addBot',
    data: null,
  };
  socket.emit('clientToGameEvent', event);
};

const removeBot = (botId: string) => {
  const event: ClientToGameEvent<'removeBot'> = {
    type: 'removeBot',
    data: {
      botId,
    },
  };
  socket.emit('clientToGameEvent', event);
};

const setBotDifficulty = (botId: string, difficulty: BotDifficulty) => {
  const event: ClientToGameEvent<'setBotDifficulty'> = {
    type: 'setBotDifficulty',
    data: {
      botId,
      difficulty,
    },
  };
  socket.emit('clientToGameEvent', event);
};

interface Props {
  children: ReactNode;
}

export const SocketContextProvider = ({ children }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useAuthContext();

  const [games, setGames] = useState<Array<GameMetaData>>([]);
  const [game, setGame] = useState<GameInfo | null>(null);
  const [incorrectPosStrings, setIncorrectPosStrings] = useState(
    new Set<string>()
  );

  useEffect(() => {
    // todo make these paths constants
    if (location.pathname === '/xword' && game === null) {
      navigate('/');
    } else if (location.pathname === '/' && game !== null) {
      navigate('/xword');
    }
  }, [navigate, location, game]);

  useEffect(() => {
    // TODO: should this run on `socket.on('connect', () => {...})`
    if (user.name && user.id) {
      joinServer(user.id, user.name);
    }
  }, [user.name, user.id]);

  const handleGameToClientEvent = useCallback(
    (event: GameToClientEvent<keyof GameToClientEvents>) => {
      console.log(event);
      switch (event.type) {
        case 'updateGame': {
          const { gameUpdate } = (event as GameToClientEvent<'updateGame'>)
            .data;
          const { serializedPlayersMap, serializedBotsMap, ...rest } =
            gameUpdate;
          return setGame({
            players: new Map(JSON.parse(serializedPlayersMap)),
            bots: new Map(JSON.parse(serializedBotsMap)),
            ...rest,
          });
        }
        case 'incorrectTilePlayed': {
          const { pos } = (event as GameToClientEvent<'incorrectTilePlayed'>)
            .data;

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
        }
      }
    },
    []
  );

  const handleServerToClientEvent = useCallback(
    (event: ServerToClientEvent<keyof ServerToClientEvents>) => {
      console.log(event);

      switch (event.type) {
        case 'updateGamesList': {
          const { games } = (event as ServerToClientEvent<'updateGamesList'>)
            .data;
          return setGames(games);
        }
      }
    },
    []
  );

  useEffect(() => {
    socket.on('serverToClientEvent', handleServerToClientEvent);
  }, [handleServerToClientEvent]);

  useEffect(() => {
    socket.on('gameToClientEvent', handleGameToClientEvent);
  }, [handleGameToClientEvent]);

  const playTile = useCallback(
    (tileId: string, pos: [number, number]) => {
      const event: ClientToGameEvent<'playTile'> = {
        type: 'playTile',
        data: {
          tileId,
          pos,
        },
      };
      socket.emit('clientToGameEvent', event);

      if (!game) {
        return;
      }

      const tileIndex = game.tileBar.findIndex((tile) => tile.id === tileId);
      if (tileIndex === -1) {
        return;
      }

      const tile = game.tileBar.splice(tileIndex, 1)[0];

      setGame(
        produce(game, (gameDraft) => {
          gameDraft.xWord.grid[pos[0]][pos[1]] = tile;
        })
      );
    },
    [game]
  );

  const leaveGame = useCallback(() => {
    const event: ClientToServerEvent<'leaveGame'> = {
      type: 'leaveGame',
      data: null,
    };
    socket.emit('clientToServerEvent', event);
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

    const event: ClientToGameEvent<'updateTileBar'> = {
      type: 'updateTileBar',
      data: {
        tileIds: tileBar.map((tile) => tile.id),
      },
    };
    socket.emit('clientToGameEvent', event);
  }, []);

  const setReady = useCallback((ready: boolean) => {
    const event: ClientToGameEvent<'setReady'> = {
      type: 'setReady',
      data: { ready },
    };
    socket.emit('clientToGameEvent', event);
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
};

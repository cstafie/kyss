import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { io, Socket } from 'socket.io-client';
import {
  GameMetaData,
  ServerGameUpdate,
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
} from '@nx/api-interfaces';
import { useAuthContext } from './auth';
import { useLocation, useNavigate } from 'react-router-dom';

export interface Game {
  xWord: XWord;
  gameState: GameState;
  players: Map<string, PlayerInfo>;
  ready: boolean;
  tileBar: Array<Tile>;
}

interface SocketContextI {
  createGame: (gameName: string) => void;
  playTile: (tileId: string, pos: [number, number]) => void;
  updateTileBar: (tileBar: Array<Tile>) => void;
  joinGame: (gameId: string) => void;
  startGame: () => void;
  leaveGame: () => void;
  setReady: (ready: boolean) => void;
  games: Array<GameMetaData>;
  game: Game | null;
}

const warning = () => console.error('No matching provider for SocketContext');
const SocketContext = createContext<SocketContextI>({
  createGame: (gameName: string) => warning(),
  playTile: (tileId: string, pos: [number, number]) => warning(),
  joinGame: (gameId: string) => warning(),
  updateTileBar: (tileBar: Array<Tile>) => warning(),
  startGame: () => warning(),
  leaveGame: () => warning(),
  setReady: (ready: boolean) => warning(),
  games: [],
  game: null,
});

export const useSocketContext = () => useContext(SocketContext);

const socket: Socket<SocketServerToClientEvents, SocketClientToServerEvents> =
  io();

const createGame = (gameName: string) => {
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

interface Props {
  children: ReactNode;
}

export const SocketContextProvider = ({ children }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useAuthContext();

  const [games, setGames] = useState<Array<GameMetaData>>([]);
  const [game, setGame] = useState<Game | null>(null);

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

  const handleEvent = useCallback(
    (event: ServerToClientEvent<keyof ServerToClientEvents>) => {
      console.log(event);

      switch (event.type) {
        case 'updateGamesList': {
          const { games } = (event as ServerToClientEvent<'updateGamesList'>)
            .data;
          return setGames(games);
        }
        case 'updateGame': {
          const { gameUpdate } = (event as ServerToClientEvent<'updateGame'>)
            .data;
          const { serializedPlayersMap, ...rest } = gameUpdate;
          return setGame({
            players: new Map(JSON.parse(serializedPlayersMap)),
            ...rest,
          });
        }
      }
    },
    []
  );

  useEffect(() => {
    socket.on('serverToClientEvent', handleEvent);
  }, [handleEvent]);

  const playTile = useCallback((tileId: string, pos: [number, number]) => {
    const event: ClientToGameEvent<'playTile'> = {
      type: 'playTile',
      data: {
        tileId,
        pos,
      },
    };
    socket.emit('clientToGameEvent', event);
  }, []);

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
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

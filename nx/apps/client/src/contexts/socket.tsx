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
  ServerToClientEvents,
  ClientToServerEvents,
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

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io();

const createGame = (gameName: string) => socket.emit('newGame', gameName);
const joinGame = (gameId: string) => socket.emit('joinGame', gameId);
const startGame = () => socket.emit('startGame');

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
      console.log('should navigate to /xword');
      navigate('/xword');
    }
  }, [navigate, location, game]);

  useEffect(() => {
    if (user.name && user.id) {
      socket.emit('joinServer', {
        id: user.id,
        name: user.name,
      });
    }
  }, [user.name, user.id]);

  useEffect(() => {
    // subscribe
    socket.on('updateGamesList', (games) => {
      setGames(games);
    });
    socket.on(
      'updateGame',
      ({ serializedPlayersMap, ...rest }: ServerGameUpdate) => {
        setGame({
          players: new Map(JSON.parse(serializedPlayersMap)),
          ...rest,
        });
      }
    );
  }, []);

  const playTile = useCallback((tileId: string, pos: [number, number]) => {
    // setGame(gameUpdate);

    // const playerGameUpdate: PlayerGameUpdate = {
    //   xWord: gameUpdate.xWord,
    //   ready: gameUpdate.ready,
    //   tileBar: gameUpdate.tileBar,
    // };
    socket.emit('playTile', tileId, pos);
  }, []);

  const leaveGame = useCallback(() => {
    socket.emit('leaveGame');
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
      'updateTileBar',
      tileBar.map((tile) => tile.id)
    );
  }, []);

  const setReady = useCallback(
    (ready: boolean) => socket.emit('setReady', ready),
    []
  );

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

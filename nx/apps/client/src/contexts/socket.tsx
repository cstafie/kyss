import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import io from 'socket.io-client';
import {
  PlayerGameUpdate,
  GameMetaData,
  ServerGameUpdate,
  PlayerInfo,
  XWord,
  GameState,
  Tile,
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

interface Socket {
  createGame: (gameName: string) => void;
  updateGame: (game: Game) => void;
  joinGame: (gameId: string) => void;
  startGame: () => void;
  leaveGame: () => void;
  games: Array<GameMetaData>;
  game: Game | null;
}

const warning = () => console.error('No matching provider for SocketContext');
const SocketContext = createContext<Socket>({
  createGame: (gameName: string) => warning(),
  updateGame: (game: Game) => warning(),
  joinGame: (gameId: string) => warning(),
  startGame: () => warning(),
  leaveGame: () => warning(),
  games: [],
  game: null,
});

export const useSocketContext = () => useContext(SocketContext);

// TODO: socket server url as env variable
const socket = io();

const createGame = (gameName: string) => socket.emit('create-game', gameName);
const joinGame = (gameId: string) => socket.emit('join-game', gameId);
const startGame = () => socket.emit('start-game');

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
    if (user.name && user.id) {
      socket.emit('join-server', {
        id: user.id,
        name: user.name,
      });
    }
  }, [user.name, user.id]);

  useEffect(() => {
    // subscribe
    socket.on('server-update', (games) => {
      setGames(games);
    });
    socket.on(
      'game-update',
      ({ serializedPlayersMap, ...rest }: ServerGameUpdate) => {
        setGame({
          players: new Map(JSON.parse(serializedPlayersMap)),
          ...rest,
        });
      }
    );
  }, []);

  const optimisticUpdate = useCallback((gameUpdate: Game) => {
    setGame(gameUpdate);

    const playerGameUpdate: PlayerGameUpdate = {
      xWord: gameUpdate.xWord,
      tileBar: gameUpdate.tileBar,
      ready: gameUpdate.ready,
    };
    socket.emit('update-game', playerGameUpdate);
  }, []);

  const leaveGame = useCallback(() => {
    socket.emit('leave-game');
    setGame(null);
  }, []);

  return (
    <SocketContext.Provider
      value={{
        createGame,
        updateGame: optimisticUpdate,
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

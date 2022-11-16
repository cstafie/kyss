import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
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
  updateGame: (game: PlayerGameUpdate) => void;
  joinGame: (gameId: string) => void;
  games: Array<GameMetaData>;
  game: Game | null;
}

const SocketContext = createContext<Socket>({
  createGame: (gameName: string) =>
    console.error('No matching provider for SocketContext'),
  updateGame: (game: PlayerGameUpdate) =>
    console.error('No matching provider for SocketContext'),
  joinGame: (gameId: string) =>
    console.error('No matching provider for SocketContext'),
  games: [],
  game: null,
});

export const useSocketContext = () => useContext(SocketContext);

// TODO: socket server url as env variable
const socket = io();

const updateGame = (game: PlayerGameUpdate) => {
  console.log('update-game');
  socket.emit('update-game', game);
};

const createGame = (gameName: string) => socket.emit('create-game', gameName);
const joinGame = (gameId: string) => socket.emit('join-game', gameId);

interface Props {
  children: ReactNode;
}

export const SocketContextProvider = ({ children }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useAuthContext();

  const [games, setGames] = useState<Array<GameMetaData>>([]);
  const [game, setGame] = useState<Game | null>(null);

  console.log(game);

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

  return (
    <SocketContext.Provider
      value={{
        createGame,
        updateGame,
        joinGame,
        games,
        game,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

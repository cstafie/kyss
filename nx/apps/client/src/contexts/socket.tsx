import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import io from 'socket.io-client';
import { Game, GameMetaData } from '@nx/api-interfaces';
import { useAuthContext } from './auth';
import { useNavigate } from 'react-router-dom';

interface Socket {
  createGame: (gameName: string) => void;
  updateGame: (game: Game) => void;
  joinGame: (gameId: string) => void;
  games: Array<GameMetaData>;
  game: Game | null;
}

const SocketContext = createContext<Socket>({
  createGame: (gameName: string) =>
    console.error('No matching provider for SocketContext'),
  updateGame: (game: Game) =>
    console.error('No matching provider for SocketContext'),
  joinGame: (gameId: string) =>
    console.error('No matching provider for SocketContext'),
  games: [],
  game: null,
});

export const useSocketContext = () => useContext(SocketContext);

// TODO: socket server url as env variable
const socket = io();

const updateGame = (game: Game) => socket.emit('update-game', game);
const createGame = (gameName: string) => socket.emit('create-game', gameName);
const joinGame = (gameId: string) => socket.emit('join-game', gameId);

interface Props {
  children: ReactNode;
}

export const SocketContextProvider = ({ children }: Props) => {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const [games, setGames] = useState<Array<GameMetaData>>([]);
  const [game, setGame] = useState<Game | null>(null);

  console.log(game);

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
    socket.on('game-update', (updatedGame: Game) => {
      setGame(updatedGame);
      navigate('/xword');
    });
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

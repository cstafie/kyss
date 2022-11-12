import { Game, GameMetaData, Tile, XWord } from '@nx/api-interfaces';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from 'react';
import { useMatch } from 'react-router-dom';
import io from 'socket.io-client';
import { useAuthContext } from './auth';

interface Socket {
  createGame: (gameName: string) => void;
  updateGame: (game: Game) => void;
  games: Array<GameMetaData>;
  game: Game | null;
}

const SocketContext = createContext<Socket>({
  createGame: (gameName: string) =>
    console.error('No matching provider for SocketContext'),
  updateGame: (game: Game) =>
    console.error('No matching provider for SocketContext'),
  games: [],
  game: null,
});

export const useSocketContext = () => useContext(SocketContext);

// TODO: socket server url as env variable
const socket = io();

const updateGame = (game: Game) => socket.emit('update-game', game);
const createGame = (gameName: string) => socket.emit('create-game', gameName);

interface Props {
  children: ReactNode;
}

export const SocketContextProvider = ({ children }: Props) => {
  const { user } = useAuthContext();

  const [games, setGames] = useState<Array<GameMetaData>>([]);
  const [game, setGame] = useState<Game | null>(null);

  useEffect(() => {
    socket.emit('join-server', {
      id: user.id,
      name: user.name,
    });

    // subscribe
    socket.on('server-update', (games) => {
      setGames(games);
    });
    socket.on('game-update', (updatedGame: Game) => {
      setGame(updatedGame);
    });
  }, []); // TODO: why are we seeing this warning? i feel like i can ignore it

  return (
    <SocketContext.Provider
      value={{
        createGame,
        updateGame,
        games,
        game,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

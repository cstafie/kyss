import { Game, GameUpdate, Tile, XWord } from '@nx/api-interfaces';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import io from 'socket.io-client';
import { useAuthContext } from './auth';

interface Socket {
  createGame: (gameName: string) => void;
  updateGame: (xWord: XWord) => void;
  games: Array<Game>;
  xWord: XWord | null;
  tileBar: Array<Tile>;
}

const SocketContext = createContext<Socket>({
  createGame: (gameName: string) =>
    console.error('No matching provider for SocketContext'),
  updateGame: (xWord: XWord) =>
    console.error('No matching provider for SocketContext'),
  xWord: null,
  games: [],
  tileBar: [],
});

export const useSocketContext = () => useContext(SocketContext);

// TODO: socket server url as env variable
const socket = io();

const updateGame = (xword: XWord) => socket.emit('update-game', xword);
const createGame = (gameName: string) => socket.emit('create-game', gameName);

interface Props {
  children: ReactNode;
}

export const SocketContextProvider = ({ children }: Props) => {
  const { user } = useAuthContext();

  const [games, setGames] = useState<Array<Game>>([]);
  const [xWord, setXWord] = useState<XWord | null>(null);
  const [tileBar, setTileBar] = useState<Array<Tile>>([]);

  useEffect(() => {
    socket.emit('join-server', {
      id: user.id,
      name: user.name,
    });

    socket.on('server-update', ({ games }) => {
      setGames(games);
    });
  });

  useEffect(() => {
    socket.on('update', ({ xWord, tileBar }: GameUpdate) => {
      setXWord(xWord);
      setTileBar(tileBar);
    });
  }, []);

  return (
    <SocketContext.Provider
      value={{
        createGame,
        updateGame,
        games,
        xWord,
        tileBar,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

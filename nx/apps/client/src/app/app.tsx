import XWord from '../screens/xWord';
import io from 'socket.io-client';
import { useCallback, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GameUpdate, Tile, XWord as XWordType } from '@nx/api-interfaces';
import { useAuthContext } from '../contexts/auth';

// TODO: socket server url as env variable
// TODO: we probably need a socket
const socket = io();

export const App = () => {
  // useEffect(() => {
  //   fetch('/api');
  // }, []);

  const { user } = useAuthContext();

  const [games, setGames] = useState([]);

  const [xWord, setXWord] = useState<XWordType | null>(null);
  const [tileBar, setTileBar] = useState<Array<Tile>>([]);

  useEffect(() => {
    socket.emit('join-server', {
      id: user.id,
      name: user.name,
    });

    socket.on('server-update', ({ games }) => {});
  });

  useEffect(() => {
    socket.on('update', ({ xWord, tileBar }: GameUpdate) => {
      setXWord(xWord);
      setTileBar(tileBar);
    });
  }, []);

  const updateGame = useCallback(
    (gameUpdate: GameUpdate) => {
      setTileBar(gameUpdate.tileBar);
      setXWord(gameUpdate.xWord);
      socket.emit('update', {
        gameUpdate,
        user,
      });
    },
    [user]
  );

  // const [playerId, setPlayerId] = reactUseCookie('playerId');

  return (
    <>
      <nav className="flex p-2">
        {} {}
      </nav>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Games games={games} />} />
          {xWord && (
            <Route
              path="/xword"
              element={
                <XWord
                  xWord={xWord}
                  tileBar={tileBar}
                  updateGame={updateGame}
                />
              }
            />
          )}
          {/* <Route path="/xWord" element={<XWord />} /> */}
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;

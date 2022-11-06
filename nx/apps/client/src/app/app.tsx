import XWord from '../components/xWord';
import io from 'socket.io-client';
import { useCallback, useEffect, useState } from 'react';
import reactUseCookie from 'react-use-cookie';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PlayerUpdate, Tile, XWord as XWordType } from '@nx/api-interfaces';

// TODO: socket server url as env variable
const socket = io();

export const App = () => {
  // useEffect(() => {
  //   fetch('/api');
  // }, []);

  const [xWord, setXWord] = useState<XWordType | null>(null);
  const [tileBar, setTileBar] = useState<Array<Tile>>([]);

  useEffect(() => {
    socket.on('update', ({ xWord, tileBar }: PlayerUpdate) => {
      setXWord(xWord);
      setTileBar(tileBar);
    });
  }, []);

  const updateTileBar = useCallback((updatedTileBar: Array<Tile>) => {
    setTileBar(updatedTileBar);
    socket.emit('update-tilebar', updatedTileBar);
  }, []);

  // const [playerId, setPlayerId] = reactUseCookie('playerId');

  return (
    <>
      <nav className="flex p-2">
        {} {}
      </nav>
      <BrowserRouter>
        <Routes>
          {xWord && (
            <Route
              path="/"
              element={
                <XWord
                  xWord={xWord}
                  tileBar={tileBar}
                  setTileBar={updateTileBar}
                  setXWord={() => 'todo: set xword'}
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

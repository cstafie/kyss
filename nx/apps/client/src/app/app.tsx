import XWord from '../components/xWord';
import io from 'socket.io-client';
import { useCallback, useEffect, useState, SetStateAction } from 'react';
import reactUseCookie from 'react-use-cookie';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GameUpdate, Tile, XWord as XWordType } from '@nx/api-interfaces';

// TODO: socket server url as env variable
const socket = io();

// TODO: we probably need a socket and login context

export const App = () => {
  // useEffect(() => {
  //   fetch('/api');
  // }, []);

  const [xWord, setXWord] = useState<XWordType | null>(null);
  const [tileBar, setTileBar] = useState<Array<Tile>>([]);

  useEffect(() => {
    socket.on('update', ({ xWord, tileBar }: GameUpdate) => {
      setXWord(xWord);
      setTileBar(tileBar);
    });
  }, []);

  const updateGame = useCallback((gameUpdate: GameUpdate) => {
    setTileBar(gameUpdate.tileBar);
    setXWord(gameUpdate.xWord);
    socket.emit('update', gameUpdate);
  }, []);

  // const updateTileBar = useCallback((updatedTileBar: Array<Tile>) => {
  //   setTileBar(updatedTileBar);
  //   socket.emit('update-tilebar', updatedTileBar);
  // }, []);

  // const updateXWord = useCallback((updatedXWord: XWordType) => {
  //   setXWord(updatedXWord);
  //   socket.emit('update-xword', updatedXWord);
  // }, []);

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

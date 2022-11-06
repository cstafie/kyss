import XWord from '../components/xword';
import io from 'socket.io-client';
import { useEffect } from 'react';
import reactUseCookie from 'react-use-cookie';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// TODO: socket server url as env variable
const socket = io();

const xword = null;

export const App = () => {
  useEffect(() => {
    fetch('/api');
  });

  const [playerId, setPlayerId] = reactUseCookie('playerId');

  return (
    <>
      <nav className="flex p-2">
        {} {}
      </nav>
      <BrowserRouter>
        <Routes>
          {xword && <Route path="/" element={<XWord xword={xword} />} />}
          {/* <Route path="/xword" element={<XWord />} /> */}
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;

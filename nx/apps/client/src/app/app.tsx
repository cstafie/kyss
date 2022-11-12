import XWord from '../screens/XWord';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useSocketContext } from '../contexts/socket';
import GamesList from '../screens/GamesList';

export const App = () => {
  // useEffect(() => {
  //   fetch('/api');
  // }, []);

  const { games, game, createGame, updateGame } = useSocketContext();

  // const [playerId, setPlayerId] = reactUseCookie('playerId');

  return (
    <>
      <nav className="flex p-2">
        {} {}
      </nav>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<GamesList games={games} createGame={createGame} />}
          />
          {game && (
            <Route
              path="/xword"
              element={<XWord game={game} updateGame={updateGame} />}
            />
          )}
          {/* <Route path="/xWord" element={<XWord />} /> */}
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;

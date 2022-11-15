import XWord from '../screens/Game/XWord';
import { Routes, Route } from 'react-router-dom';
import { useSocketContext } from '../contexts/socket';
import GamesList from '../screens/GamesList';
import { useAuthContext } from '../contexts/auth';
import Game from '../screens/Game';

export const App = () => {
  // useEffect(() => {
  //   fetch('/api');
  // }, []);

  const { user } = useAuthContext();
  const { games, game, createGame, updateGame } = useSocketContext();

  // const [playerId, setPlayerId] = reactUseCookie('playerId');

  return (
    <>
      <nav className="flex justify-between p-2">{user.name}</nav>
      <Routes>
        <Route
          path="/"
          element={<GamesList games={games} createGame={createGame} />}
        />
        {game && (
          <Route
            path="/xword"
            element={<Game game={game} updateGame={updateGame} />}
          />
        )}
        <Route
          path="*"
          element={<GamesList games={games} createGame={createGame} />}
        />
        {/* <Route path="/xWord" element={<XWord />} /> */}
      </Routes>
    </>
  );
};

export default App;

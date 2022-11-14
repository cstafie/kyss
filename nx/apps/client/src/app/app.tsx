import XWord from '../screens/XWord';
import { Routes, Route } from 'react-router-dom';
import { useSocketContext } from '../contexts/socket';
import Games from '../screens/Games';
import { useAuthContext } from '../contexts/auth';

export const App = () => {
  // useEffect(() => {
  //   fetch('/api');
  // }, []);

  const { user } = useAuthContext();
  const { games, game, createGame, updateGame } = useSocketContext();

  // const [playerId, setPlayerId] = reactUseCookie('playerId');

  return (
    <>
      <nav className="flex justify-end p-2">{user.name}</nav>
      <Routes>
        <Route
          path="/"
          element={<Games games={games} createGame={createGame} />}
        />
        {game && (
          <Route
            path="/xword"
            element={<XWord game={game} updateGame={updateGame} />}
          />
        )}
        {/* <Route path="/xWord" element={<XWord />} /> */}
      </Routes>
    </>
  );
};

export default App;

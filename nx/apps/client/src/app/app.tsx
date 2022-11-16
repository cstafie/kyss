import { Routes, Route } from 'react-router-dom';
import GamesList from '../screens/GamesList';
import { useAuthContext } from '../contexts/auth';
import Game from '../screens/Game';

export const App = () => {
  const { user } = useAuthContext();

  return (
    <>
      <nav className="flex justify-between p-2">{user.name}</nav>
      <Routes>
        <Route path="/" element={<GamesList />} />
        <Route path="/xword" element={<Game />} />
        <Route path="*" element={<GamesList />} />
      </Routes>
    </>
  );
};

export default App;

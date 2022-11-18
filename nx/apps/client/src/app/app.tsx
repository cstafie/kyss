import { Routes, Route } from 'react-router-dom';
import GamesList from '../screens/GamesList';
import Game from '../screens/Game';
import UserName from '../screens/user_name';

export const App = () => {
  return (
    <>
      <nav className="flex justify-between p-2 mb-4 bg-neutral-800">
        <ul>
          <li>
            <UserName />
          </li>
        </ul>
      </nav>
      <Routes>
        <Route path="/" element={<GamesList />} />
        <Route path="/xword" element={<Game />} />
        <Route path="*" element={<GamesList />} />
      </Routes>
    </>
  );
};

export default App;

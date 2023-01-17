import { Routes, Route } from 'react-router-dom';
import GamesList from '../screens/GamesList';
import Game from '../screens/Game';
import { NavContextProvider } from '../contexts/nav';

export const App = () => {
  return (
    <NavContextProvider>
      <main className="overflow-auto pt-4 flex-1">
        <Routes>
          <Route path="/" element={<GamesList />} />
          <Route path="/xword" element={<Game />} />
          <Route path="*" element={<GamesList />} />
        </Routes>
      </main>
    </NavContextProvider>
  );
};

export default App;

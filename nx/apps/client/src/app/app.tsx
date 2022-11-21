import { Routes, Route } from 'react-router-dom';
import GamesList from '../screens/GamesList';
import Game from '../screens/Game';
import { NavContextProvider } from '../contexts/nav';

export const App = () => {
  return (
    <NavContextProvider>
      <Routes>
        <Route path="/" element={<GamesList />} />
        <Route path="/xword" element={<Game />} />
        <Route path="*" element={<GamesList />} />
      </Routes>
    </NavContextProvider>
  );
};

export default App;

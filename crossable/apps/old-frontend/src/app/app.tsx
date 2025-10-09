import { Routes, Route } from 'react-router-dom';
import GamesList from '../screens/GamesList';
import Game from '../screens/Game';
import { NavContextProvider } from '../contexts/nav';
import Instructions from '../screens/Instructions';
import Feedback from '../screens/Feedback';
import Coffee from '../screens/Coffee';

export const App = () => {
  return (
    <NavContextProvider>
      <main className="overflow-auto pt-4 flex-1">
        <Routes>
          <Route path="/" element={<GamesList />} />
          <Route path="/xword" element={<Game />} />
          <Route path="/instructions" element={<Instructions />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/coffee" element={<Coffee />} />
          <Route path="*" element={<GamesList />} />
        </Routes>
      </main>
    </NavContextProvider>
  );
};

export default App;

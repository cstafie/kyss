import XWord from '../screens/XWord';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useSocketContext } from '../contexts/socket';

export const App = () => {
  // useEffect(() => {
  //   fetch('/api');
  // }, []);

  const { games, xWord, tileBar, createGame, updateGame } = useSocketContext();

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
            element={<Games games={games} createGame={createGame} />}
          />
          {xWord && (
            <Route
              path="/xword"
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

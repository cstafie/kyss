import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useSocketContext } from '../../contexts/socket';
import GamesTable from './games_table';

const GAME_NAME_LENGTH = 6;

const GamesList = () => {
  const { games, game, createGame } = useSocketContext();
  const navigate = useNavigate();

  if (game !== null) {
    navigate('/xword');
  }

  return (
    <section className="flex flex-col items-center">
      <nav className="flex flex-row justify-between w-1/2 m-4">
        <h2> Games </h2>
        <button
          className="btn btn-blue"
          onClick={() =>
            createGame(`game-${uuidv4().substring(0, GAME_NAME_LENGTH)}`)
          }
        >
          CREATE GAME
        </button>
      </nav>
      {games.length === 0 ? (
        <div> Click "Create Game" to start a new game </div>
      ) : (
        <GamesTable games={games} />
      )}
    </section>
  );
};

export default GamesList;

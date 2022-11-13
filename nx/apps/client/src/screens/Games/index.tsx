import { GameMetaData } from '@nx/api-interfaces';
import { v4 as uuidv4 } from 'uuid';
import GamesTable from './games_table';

interface Props {
  createGame: (gameName: string) => void;
  games: Array<GameMetaData>;
}

const Games = ({ games, createGame }: Props) => {
  return (
    <section className="flex flex-col items-center">
      <nav className="flex flex-row justify-between  w-1/2 m-4">
        <h2> Games </h2>
        <button className="btn btn-blue" onClick={() => createGame(uuidv4())}>
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

export default Games;

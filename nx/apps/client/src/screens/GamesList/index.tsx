import { GameMetaData } from '@nx/api-interfaces';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  createGame: (gameName: string) => void;
  games: Array<GameMetaData>;
}

const GamesList = ({ games, createGame }: Props) => {
  return (
    <section className="flex justify-center">
      <section className="flex flex-col justify-center w-1/2 max-w-2xl">
        <h2> Games </h2>
        <button onClick={() => createGame(uuidv4())}> create game </button>
        <ol>
          {games.map(({ id, name, createdAt, numberOfPlayers }) => (
            <li key={id} className="flex justify-between">
              <div>{name}</div>
              <div>{numberOfPlayers}</div>
              <div>{createdAt.toString()}</div>
            </li>
          ))}
        </ol>
      </section>
    </section>
  );
};

export default GamesList;

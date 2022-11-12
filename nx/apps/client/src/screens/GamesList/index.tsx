import { GameMetaData } from '@nx/api-interfaces';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  createGame: (gameName: string) => void;
  games: Array<GameMetaData>;
}

const GamesList = ({ games, createGame }: Props) => {
  return (
    <section>
      <h2> Games </h2>
      <button onClick={() => createGame(uuidv4())}> create game </button>
      <ol>
        {games.map(({ id, name, createdAt, numberOfPlayers }) => (
          <li key={id}>{name}</li>
        ))}
      </ol>
    </section>
  );
};

export default GamesList;

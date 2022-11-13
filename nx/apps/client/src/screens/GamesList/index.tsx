import { GameMetaData } from '@nx/api-interfaces';
import { v4 as uuidv4 } from 'uuid';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';

TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo('en-US');

interface Props {
  createGame: (gameName: string) => void;
  games: Array<GameMetaData>;
}

const GamesList = ({ games, createGame }: Props) => {
  return (
    <section className="flex flex-col items-center">
      <nav className="flex flex-row justify-between  w-1/2 m-4">
        <h2> Games </h2>
        <button className="btn btn-blue" onClick={() => createGame(uuidv4())}>
          CREATE GAME
        </button>
      </nav>

      <table className="table-auto w-1/2">
        <thead>
          <tr>
            <th className="text-left">Name</th>
            <th className="text-center"># of Players</th>
            <th className="text-right">Created</th>
          </tr>
        </thead>
        <tbody>
          {games.map(({ id, name, createdAt, numberOfPlayers }) => (
            <tr key={id}>
              <td>{name}</td>
              <td className="text-center">{numberOfPlayers}</td>
              <td className="text-right">
                {timeAgo.format(new Date(createdAt))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default GamesList;

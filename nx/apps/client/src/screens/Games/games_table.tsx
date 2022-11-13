import { GameMetaData } from '@nx/api-interfaces';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';

TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo('en-US');

interface Props {
  games: Array<GameMetaData>;
}

const GamesTable = ({ games }: Props) => (
  <table className="table-auto border-separate border border-spacing-4 w-full lg:w-2/3 rounded border-neutral-700">
    <thead className="">
      <tr className="">
        <th></th>
        <th className="text-left">Name</th>
        <th className="text-center"># of Players</th>
        <th className="text-center">Created By</th>
        <th className="text-right">Created</th>
      </tr>
    </thead>
    <tbody className="">
      {games.map(({ id, name, createdAt, numberOfPlayers, createdBy }) => (
        <tr key={id}>
          <td className="text-left table-cell">
            <button className="btn btn-transparent">Join Game</button>
          </td>
          <td>{name}</td>
          <td className="text-center">{numberOfPlayers}</td>
          <td className="text-right">{createdBy}</td>
          <td className="text-right">{timeAgo.format(new Date(createdAt))}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default GamesTable;

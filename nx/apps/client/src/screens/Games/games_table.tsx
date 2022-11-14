import { GameMetaData } from '@nx/api-interfaces';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import { useAuthContext } from '../../contexts/auth';
import { useSocketContext } from '../../contexts/socket';

TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo('en-US');

interface Props {
  games: Array<GameMetaData>;
}

const GamesTable = ({ games }: Props) => {
  const { user } = useAuthContext();
  const { joinGame } = useSocketContext();

  return (
    <table className="table-auto border-separate border border-spacing-4 w-full lg:w-1/2 rounded border-neutral-700">
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
        {games.map(
          ({
            id,
            name,
            createdAt,
            numberOfPlayers,
            creatorId,
            creatorName,
          }) => (
            <tr key={id}>
              <td className="text-left table-cell">
                <button
                  onClick={() => joinGame(id)}
                  className="btn btn-transparent"
                >
                  JOIN GAME
                </button>
              </td>
              <td className="text-left font-mono">{name}</td>
              <td className="text-center">{numberOfPlayers}</td>
              <td className="text-center font-mono">
                {creatorId === user.id ? 'YOU' : creatorName}
              </td>
              <td className="text-right">
                {timeAgo.format(new Date(createdAt))}
              </td>
            </tr>
          )
        )}
      </tbody>
    </table>
  );
};

export default GamesTable;

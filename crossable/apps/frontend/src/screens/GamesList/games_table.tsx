import { type GameMetaData } from "shared";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import { useAuth } from "../../contexts/auth";
import { useSocket } from "../../contexts/socket";

TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo("en-US");

interface Props {
  games: Array<GameMetaData>;
}

const GamesTable = ({ games }: Props) => {
  const { user } = useAuth();
  const { joinGame } = useSocket();

  return (
    <table className="table-auto border-collapse w-full lg:w-1/2 rounded text-sm sm:text-lg">
      <thead className="">
        <tr className="">
          {/* <th></th> */}
          {/* <th className="text-left pb-4">Name</th> */}
          <th className="text-left pb-4">Created By</th>
          <th className="text-center pb-4"># of Players</th>
          <th className="text-right pb-4"></th>
        </tr>
      </thead>
      <tbody className="">
        {games.map(
          ({ id, createdAt, numberOfPlayers, creatorId, creatorName }) => (
            <tr
              key={id}
              onClick={() => joinGame(id)}
              className="hover:bg-purple-900 cursor-pointer active:bg-purple-700"
            >
              {/* <td className="text-left table-cell">
                <button
                  onClick={() => joinGame(id)}
                  className="btn btn-transparent"
                >
                  JOIN GAME
                </button>
              </td> */}
              {/* <td className="text-left font-mono py-2">{name}</td> */}
              <td className="text-left font-mono">
                {creatorId === user.id ? "YOU" : creatorName}
              </td>
              <td className="text-center">{numberOfPlayers}</td>
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

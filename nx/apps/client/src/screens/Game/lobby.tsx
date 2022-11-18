import { useMemo } from 'react';
import { Game } from '../../contexts/socket';

interface Props {
  game: Game;
  updateGame: (gameUpdate: Game) => void;
}

const Lobby = ({ game, updateGame }: Props) => {
  const allPlayersReady = useMemo(() => {
    return Array.from(game.players.values()).every((player) => player.ready);
  }, [game.players]);

  console.log(game.players.values());

  const { ready } = game;

  return (
    <>
      <h2> GAME LOBBY </h2>
      {Array.from(game.players.entries()).map(([id, info]) => (
        <div key={id}>
          {info.name} {info.ready ? '🟢' : '🔴'}
        </div>
      ))}

      <div
        className="flex items-center mb-4"
        onClick={(e) => {
          e.preventDefault();
          updateGame({
            ...game,
            ready: !ready,
          });
        }}
      >
        <input
          id="default-checkbox"
          readOnly
          type="checkbox"
          checked={ready}
          className="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
        />
        <label
          htmlFor="default-checkbox"
          className="ml-2 text-sm font-medium select-none"
        >
          READY
        </label>
      </div>

      <button
        className={`btn btn-blue ${allPlayersReady ? '' : 'btn-disabled'}`}
      >
        START
      </button>
    </>
  );
};

export default Lobby;

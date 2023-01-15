import { useMemo } from 'react';
import { GameInfo, useSocketContext } from '../../../contexts/socket';
import BotList from './bot_list';
import PlayerList from './player_list';

interface Props {
  game: GameInfo;
}

const Lobby = ({ game }: Props) => {
  const { startGame, setReady } = useSocketContext();

  const allPlayersReady = useMemo(() => {
    return Array.from(game.players.values()).every((player) => player.ready);
  }, [game.players]);

  const { ready } = game;

  // const isGameCreator = user.id === gameCreatorId;s

  return (
    <section className="flex flex-col items-center gap-8">
      <h2 className="mb-8"> GAME LOBBY </h2>

      {/* <section className="flex flex-row justify-between gap-24"> */}
      <PlayerList game={game} />
      <BotList game={game} />
      {/* </section> */}

      <section className="flex flex-row gap-12 items-center justify-center">
        <section
          className="flex items-center"
          onClick={(e) => {
            e.preventDefault();
            setReady(!ready);
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
        </section>
        <button
          onClick={startGame}
          className={`btn btn-blue ${allPlayersReady ? '' : 'btn-disabled'}`}
        >
          START
        </button>
      </section>
    </section>
  );
};

export default Lobby;

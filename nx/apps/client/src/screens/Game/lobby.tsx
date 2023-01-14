import { useMemo } from 'react';
import { useAuthContext } from '../../contexts/auth';
import { GameInfo, useSocketContext } from '../../contexts/socket';

interface Props {
  game: GameInfo;
}

const Lobby = ({ game }: Props) => {
  const { user } = useAuthContext();
  const { startGame, setReady, addBot, removeBot } = useSocketContext();

  const allPlayersReady = useMemo(() => {
    return Array.from(game.players.values()).every((player) => player.ready);
  }, [game.players]);

  const { ready, gameCreatorId, botIds } = game;

  const isGameCreator = user.id === gameCreatorId;

  console.log(isGameCreator);

  return (
    <section className="flex flex-col items-center">
      <h2 className="mb-8"> GAME LOBBY </h2>

      <section className="flex flex-row gap-24">
        <section className="text-xl">
          {Array.from(game.players.values()).map(({ id, name, ready }) => (
            <div
              key={id}
              className={`${id === user.id ? 'text-purple-400' : ''}`}
            >
              {ready ? '🟢' : '🔴'} {name}
              {id === gameCreatorId && '👑'}
              {botIds.has(id) && isGameCreator && (
                <button onClick={() => removeBot(id)}> delete </button>
              )}
            </div>
          ))}
        </section>
        {isGameCreator && (
          <section>
            <button onClick={addBot} className="btn btn-blue btn-transparent">
              ADD BOT
            </button>
          </section>
        )}
      </section>

      <section className="flex flex-row gap-12 items-center justify-center mt-16">
        <section
          className="flex items-center text-xl"
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
          className={` btn btn-blue ${allPlayersReady ? '' : 'btn-disabled'}`}
        >
          START
        </button>
      </section>
    </section>
  );
};

export default Lobby;

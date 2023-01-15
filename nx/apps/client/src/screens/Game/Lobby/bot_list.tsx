import { useMemo } from 'react';
import { MdDeleteForever } from 'react-icons/md';
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';

import { useAuthContext } from 'apps/client/src/contexts/auth';
import { GameInfo, useSocketContext } from 'apps/client/src/contexts/socket';
import BotDifficulty from 'apps/client/src/components/bot_difficulty';
import { BotDifficulty as BotDifficultyType } from '@nx/api-interfaces';

interface Props {
  game: GameInfo;
}

function BotList({ game }: Props) {
  const { gameCreatorId, bots } = game;
  const { user } = useAuthContext();
  const { addBot, setBotDifficulty, removeBot } = useSocketContext();

  const isGameCreator = useMemo(
    () => user.id === gameCreatorId,
    [user, gameCreatorId]
  );

  if (bots.size === 0 && !isGameCreator) {
    return null;
  }

  return (
    <section className="text-xl">
      <h3 className="mb-3"> Bots </h3>
      {Array.from(bots.values()).map(({ id, name, difficulty }) => (
        <div key={id} className="flex justify-between items-center gap-3">
          <div> {name}</div>

          {isGameCreator && difficulty !== BotDifficultyType.easy && (
            <button
              onClick={() =>
                setBotDifficulty(id, (difficulty - 1) as BotDifficultyType)
              }
              className="flex items-center btn btn-blue btn-borderless text-sm"
            >
              <BsChevronLeft />
            </button>
          )}

          <BotDifficulty difficulty={difficulty} />

          {isGameCreator && difficulty !== BotDifficultyType.hard && (
            <button
              onClick={() =>
                setBotDifficulty(id, (difficulty + 1) as BotDifficultyType)
              }
              className="flex items-center btn btn-blue btn-borderless text-sm"
            >
              <BsChevronRight />
            </button>
          )}

          {isGameCreator && (
            <button
              onClick={() => removeBot(id)}
              className="flex items-center btn btn-blue btn-borderless text-sm"
            >
              DELETE <MdDeleteForever />
            </button>
          )}
        </div>
      ))}

      {isGameCreator && bots.size < 10 && (
        <button
          onClick={addBot}
          className="btn btn-blue btn-transparent text-sm mt-6"
        >
          + ADD BOT
        </button>
      )}
    </section>
  );
}

export default BotList;

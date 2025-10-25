import { useMemo } from "react";
import { MdDeleteForever } from "react-icons/md";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";

import { useUser } from "@/contexts/user";
import { type GameInfo, useGame } from "@/contexts/game";
import BotDifficulty from "@/components/bot_difficulty";
import { BOTS, type BotDifficulty as BotDifficultyType } from "shared";
import Button from "@/components/button";

interface Props {
  game: GameInfo;
}

function BotList({ game }: Props) {
  const { gameCreatorId, bots } = game;
  const { user } = useUser();
  const { addBot, setBotDifficulty, removeBot } = useGame();

  const isGameCreator = useMemo(
    () => user.id === gameCreatorId,
    [user, gameCreatorId]
  );

  if (bots.size === 0 && !isGameCreator) {
    return null;
  }

  return (
    <section className="text-xl">
      <h3 className="mb-3"> BOTS </h3>

      {Array.from(bots.values()).map(({ id, name, difficulty }) => (
        <div
          key={id}
          className="pt-2 flex flex-col justify-between items-center mb-3 border-2 rounded-xl border-blue-300 sm:flex-row sm:border-none sm:gap-3 sm:pt-0"
        >
          <div> {name}</div>

          <div className="flex justify-between w-64">
            {isGameCreator && (
              <Button
                disabled={difficulty === BOTS.DIFFICULTIES.EASY}
                onClick={() =>
                  setBotDifficulty(id, (difficulty - 1) as BotDifficultyType)
                }
                className={`btn-borderless flex items-center text-sm  ${
                  difficulty === BOTS.DIFFICULTIES.EASY ? "btn-disabled" : ""
                }`}
              >
                <BsChevronLeft />
              </Button>
            )}

            <BotDifficulty difficulty={difficulty} />

            {isGameCreator && (
              <button
                disabled={difficulty === BOTS.DIFFICULTIES.HARD}
                onClick={() =>
                  setBotDifficulty(id, (difficulty + 1) as BotDifficultyType)
                }
                className={`btn btn-borderless flex items-center text-sm ${
                  difficulty === BOTS.DIFFICULTIES.HARD ? "btn-disabled" : ""
                }`}
              >
                <BsChevronRight />
              </button>
            )}
          </div>

          {isGameCreator && (
            <button
              onClick={() => removeBot(id)}
              className="flex btn btn-borderless text-sm items-center gap-1"
            >
              DELETE <MdDeleteForever />
            </button>
          )}
        </div>
      ))}

      {isGameCreator && bots.size < 10 && (
        <button onClick={addBot} className="btn btn-transparent text-sm mt-6">
          + ADD BOT
        </button>
      )}
    </section>
  );
}

export default BotList;

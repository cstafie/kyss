import {
  BOT_DIFFICULTY,
  type BotDifficulty as BotDifficultyType,
} from "shared";

interface Props {
  difficulty: BotDifficultyType;
}

export default function BotDifficulty({ difficulty }: Props) {
  const difficultyToClassMap = {
    [BOT_DIFFICULTY.EASY]: "text-green-400",
    [BOT_DIFFICULTY.MEDIUM]: "text-yellow-400",
    [BOT_DIFFICULTY.HARD]: "text-red-400",
  };

  const difficultyToDisplayMap = {
    [BOT_DIFFICULTY.EASY]: "ROOKIE",
    [BOT_DIFFICULTY.MEDIUM]: "INTERMEDIATE",
    [BOT_DIFFICULTY.HARD]: "EXPERT",
  };

  return (
    <section className={difficultyToClassMap[difficulty]}>
      {difficultyToDisplayMap[difficulty]}
    </section>
  );
}

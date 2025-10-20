import { BOTS, type BotDifficulty as BotDifficultyType } from "shared";

interface Props {
  difficulty: BotDifficultyType;
}

export default function BotDifficulty({ difficulty }: Props) {
  const difficultyToClassMap = {
    [BOTS.DIFFICULTIES.EASY]: "text-green-400",
    [BOTS.DIFFICULTIES.MEDIUM]: "text-yellow-400",
    [BOTS.DIFFICULTIES.HARD]: "text-red-400",
  };

  const difficultyToDisplayMap = {
    [BOTS.DIFFICULTIES.EASY]: "ROOKIE",
    [BOTS.DIFFICULTIES.MEDIUM]: "INTERMEDIATE",
    [BOTS.DIFFICULTIES.HARD]: "EXPERT",
  };

  return (
    <section className={difficultyToClassMap[difficulty]}>
      {difficultyToDisplayMap[difficulty]}
    </section>
  );
}

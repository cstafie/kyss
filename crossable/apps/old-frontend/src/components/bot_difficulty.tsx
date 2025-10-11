import { BotDifficulty as BotDifficultyType } from "shared";

interface Props {
  difficulty: BotDifficultyType;
}

function BotDifficulty({ difficulty }: Props) {
  const difficultyToClassMap = {
    [BotDifficultyType.easy]: "text-green-400",
    [BotDifficultyType.medium]: "text-yellow-400",
    [BotDifficultyType.hard]: "text-red-400",
  };

  const difficultyToDisplayMap = {
    [BotDifficultyType.easy]: "ROOKIE",
    [BotDifficultyType.medium]: "INTERMEDIATE",
    [BotDifficultyType.hard]: "EXPERT",
  };

  return (
    <section className={difficultyToClassMap[difficulty]}>
      {difficultyToDisplayMap[difficulty]}
    </section>
  );
}

export default BotDifficulty;

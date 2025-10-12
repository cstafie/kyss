import { PlayerInfo } from "shared";
import Emoji from "@/components/emoji";
import { useAuth } from "@/contexts/auth";

interface Props {
  players: Array<PlayerInfo>;
  isGameOver: boolean;
}

function computeMedal(spot: number) {
  if (spot === 0) {
    return <Emoji description="First place">🥇</Emoji>;
  } else if (spot === 1) {
    return <Emoji description="Second place">🥈</Emoji>;
  } else if (spot === 2) {
    return <Emoji description="Third place">🥉</Emoji>;
  }

  return <Emoji description="Purple heart">💜</Emoji>;
}

const Players = ({ players, isGameOver }: Props) => {
  const { user } = useAuth();
  players.sort((playerA, playerB) => playerB.score - playerA.score);

  return (
    <ol className="font-mono text-lg">
      {players.map(({ id, name, score }, i) => (
        <li key={id} className={`${id === user.id ? "text-purple-400" : ""}`}>
          {isGameOver && computeMedal(i)} {name}: {score}
        </li>
      ))}
    </ol>
  );
};

export default Players;

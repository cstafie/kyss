import { PlayerInfo } from '@nx/api-interfaces';
import { useAuthContext } from 'apps/client/src/contexts/auth';

interface Props {
  players: Array<PlayerInfo>;
  isGameOver: boolean;
}

function computeMedal(spot: number) {
  if (spot === 0) {
    return '🥇';
  } else if (spot === 1) {
    return '🥈';
  } else if (spot === 2) {
    return '🥉';
  }

  return '💜';
}

const Players = ({ players, isGameOver }: Props) => {
  const { user } = useAuthContext();
  players.sort((playerA, playerB) => playerB.score - playerA.score);

  return (
    <ol className="font-mono text-lg">
      {players.map(({ id, name, score }, i) => (
        <li key={id} className={`${id === user.id ? 'text-purple-400' : ''}`}>
          {isGameOver && computeMedal(i)} {name}: {score}
        </li>
      ))}
    </ol>
  );
};

export default Players;

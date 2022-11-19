import { PlayerInfo } from '@nx/api-interfaces';
import { useAuthContext } from 'apps/client/src/contexts/auth';

interface Props {
  players: Array<PlayerInfo>;
}

const Players = ({ players }: Props) => {
  const { user } = useAuthContext();
  players.sort((playerA, playerB) => playerB.score - playerA.score);

  return (
    <ol>
      {players.map(({ id, name, score }) => (
        <li key={id} className={`${id === user.id ? 'text-purple-400' : ''}`}>
          {name}: {score}
        </li>
      ))}
    </ol>
  );
};

export default Players;

import { PlayerInfo } from '@nx/api-interfaces';

interface Props {
  players: Array<PlayerInfo>;
}

const Players = ({ players }: Props) => {
  players.sort((playerA, playerB) => playerB.score - playerA.score);

  return (
    <ol>
      {players.map(({ name, score }) => (
        <li>
          {name}: {score}
        </li>
      ))}
    </ol>
  );
};

export default Players;

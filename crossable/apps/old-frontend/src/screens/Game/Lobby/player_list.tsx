import Emoji from 'apps/client/src/components/emoji';
import { useAuthContext } from 'apps/client/src/contexts/auth';
import { GameInfo } from 'apps/client/src/contexts/socket';
import { useMemo } from 'react';

interface Props {
  game: GameInfo;
}

function PlayerList({ game }: Props) {
  const { gameCreatorId, bots } = game;
  const { user } = useAuthContext();

  const players = useMemo(() => {
    return Array.from(game.players.values()).filter(
      (player) => !bots.has(player.id)
    );
  }, [bots, game]);

  return (
    <section className="text-xl flex flex-col justify-center">
      <h3 className="mb-3"> PLAYERS </h3>
      {players.map(({ id, name, ready }) => (
        <div key={id} className={`${id === user.id ? 'text-purple-400' : ''}`}>
          {ready ? (
            <Emoji description="Green circle">🟢</Emoji>
          ) : (
            <Emoji description="Red circle">🔴</Emoji>
          )}{' '}
          {name} {id === gameCreatorId && <Emoji description="Crown">👑</Emoji>}
        </div>
      ))}
    </section>
  );
}

export default PlayerList;

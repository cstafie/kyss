import { ServerGameUpdate, PlayerGameUpdate } from '@nx/api-interfaces';

interface Props {
  game: ServerGameUpdate;
  updateGame: (game: PlayerGameUpdate) => void;
}

const Lobby = ({ game, updateGame }: Props) => {
  return (
    <>
      {Array.from(game.players.entries()).map(([id, info]) => (
        <div key={id}> {info.score} </div>
      ))}
    </>
  );
};

export default Lobby;

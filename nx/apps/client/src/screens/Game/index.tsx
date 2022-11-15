import {
  ServerGameUpdate,
  GameState,
  PlayerGameUpdate,
} from '@nx/api-interfaces';
import Lobby from './lobby';

interface Props {
  game: ServerGameUpdate | null;
  updateGame: (game: PlayerGameUpdate) => void;
}

const Game = ({ game, updateGame }: Props) => {
  if (game === null) {
    // TODO: a spinner?
    return <div> Loading... </div>;
  }

  switch (game.gameState) {
    case GameState.waitingToStart:
      return <Lobby game={game} updateGame={updateGame} />;
  }

  return <div> TODO </div>;
};

export default Game;

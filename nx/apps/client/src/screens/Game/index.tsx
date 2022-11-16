import { GameState } from '@nx/api-interfaces';
import { useSocketContext } from '../../contexts/socket';
import Lobby from './lobby';

const Game = () => {
  const { game, updateGame } = useSocketContext();

  if (game === null) {
    return <>...</>;
  }

  switch (game.gameState) {
    case GameState.waitingToStart:
      return <Lobby game={game} updateGame={updateGame} />;
  }

  return <div> TODO </div>;
};

export default Game;

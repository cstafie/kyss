import { GameState } from '@nx/api-interfaces';
import { useSocketContext } from '../../contexts/socket';
import Lobby from './lobby';
import XWord from './XWord';

const Game = () => {
  const { game, updateGame } = useSocketContext();

  if (game === null) {
    return <>...</>;
  }

  // TODO: find some nicer syntax
  const Component = (() => {
    switch (game.gameState) {
      case GameState.waitingToStart:
        return <Lobby game={game} updateGame={updateGame} />;
      case GameState.inProgress:
        return <XWord game={game} updateGame={updateGame} />;
      case GameState.complete:
        return <div> game done </div>;
    }
  })();

  return <section className="flex flex-col items-center">{Component}</section>;
};

export default Game;

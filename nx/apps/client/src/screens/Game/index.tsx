import { GameState } from '@nx/api-interfaces';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavContext } from '../../contexts/nav';
import { useSocketContext } from '../../contexts/socket';
import Lobby from './lobby';
import XWord from './XWord';

const LEFT_ARROW_EMOJI = '⬅️';

const Game = () => {
  const { game, updateGame, startGame, leaveGame } = useSocketContext();

  const { setNavLeft } = useNavContext();

  useEffect(() => {
    setNavLeft(
      <button className="hover:scale-105 active:scale-95">
        <Link to="/" onClick={leaveGame}>
          <span role="img" aria-label="back-arrow">
            {LEFT_ARROW_EMOJI}
          </span>
        </Link>
      </button>
    );
  }, []);

  if (game === null) {
    return <>...</>;
  }

  // TODO: find some nicer syntax
  const Component = (() => {
    switch (game.gameState) {
      case GameState.waitingToStart:
        return (
          <Lobby game={game} updateGame={updateGame} startGame={startGame} />
        );
      case GameState.inProgress:
        return <XWord game={game} updateGame={updateGame} />;
      case GameState.complete:
        return <div> game done </div>;
    }
  })();

  return <section className="flex flex-col items-center">{Component}</section>;
};

export default Game;

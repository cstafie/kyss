import { GameState } from '@nx/api-interfaces';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavContext } from '../../contexts/nav';
import { useSocketContext } from '../../contexts/socket';
import Lobby from './Lobby/lobby';
import XWord from './XWord';

const LEFT_ARROW_EMOJI = '⬅️';

const Game = () => {
  const { game, leaveGame } = useSocketContext();
  const { setNavLeft } = useNavContext();

  useEffect(() => {
    setNavLeft(
      <button className="btn btn-borderless">
        <Link to="/" onClick={leaveGame}>
          <span role="img" aria-label="back-arrow">
            {LEFT_ARROW_EMOJI}
          </span>{' '}
          LEAVE
        </Link>
      </button>
    );
  }, [leaveGame, setNavLeft]);

  if (game === null) {
    return <>...</>;
  }

  const Component = (() => {
    switch (game.gameState) {
      case GameState.waitingToStart:
        return <Lobby game={game} />;

      case GameState.inProgress:
      case GameState.complete:
        return <XWord game={game} />;
    }
  })();

  return Component;
};

export default Game;

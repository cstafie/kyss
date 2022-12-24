import { GameState } from '@nx/api-interfaces';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavContext } from '../../contexts/nav';
import { useSocketContext } from '../../contexts/socket';
import Lobby from './lobby';
import XWord from './XWord';

const LEFT_ARROW_EMOJI = '⬅️';

const Game = () => {
  const { game, updateGame, startGame, leaveGame, updateTileBar } =
    useSocketContext();

  const { setNavLeft } = useNavContext();

  useEffect(() => {
    setNavLeft(
      <button className="hover:scale-105 active:scale-95">
        <Link to="/" onClick={leaveGame}>
          <span role="img" aria-label="back-arrow">
            {LEFT_ARROW_EMOJI}
          </span>
          LEAVE
        </Link>
      </button>
    );
  }, []);

  if (game === null) {
    return <>...</>;
  }

  switch (game.gameState) {
    case GameState.waitingToStart:
      return (
        <Lobby game={game} updateGame={updateGame} startGame={startGame} />
      );

    case GameState.inProgress:
    case GameState.complete:
      return (
        <XWord
          game={game}
          updateGame={updateGame}
          updateTileBar={updateTileBar}
        />
      );
  }
};

export default Game;

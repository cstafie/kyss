import { GameState } from "shared";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import Emoji from "@/components/emoji";
import { useNav } from "@/contexts/nav";
import { useGame } from "@/contexts/game";
import Lobby from "./Lobby/lobby";
import XWord from "./XWord";
import Button from "@/components/button";

const BACK_ARROW_EMOJI = "⬅️";

const Game = () => {
  const { game, leaveGame } = useGame();
  const { setNavLeft } = useNav();

  useEffect(() => {
    setNavLeft(
      <Link to="/" onClick={leaveGame}>
        <Button className="btn-borderless">
          <Emoji description="Back arrow">{BACK_ARROW_EMOJI}</Emoji> LEAVE
        </Button>
      </Link>
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

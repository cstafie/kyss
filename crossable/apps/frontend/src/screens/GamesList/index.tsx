import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useNav } from "@/contexts/nav";
import { useGame } from "@/contexts/game";
import GamesTable from "./games_table";
import Button from "@/components/button";

const GamesList = () => {
  const { games, game, createGame } = useGame();
  const navigate = useNavigate();
  const { resetNavLeft } = useNav();

  useEffect(() => {
    // TODO: navigate should not be used in this way
    if (game !== null) {
      navigate("/xword");
    }
  }, [game, navigate]);

  useEffect(resetNavLeft, [resetNavLeft]);

  return (
    <section className="flex flex-col items-center p-2">
      <div className="flex flex-row justify-between items-center w-full sm:w-1/2 m-4 mb-12">
        <h2> GAMES </h2>
        <Button onClick={createGame} className="btn-blue">
          NEW GAME
        </Button>
      </div>
      {games.length === 0 ? (
        <div> Click "New Game" to create a new game </div>
      ) : (
        <GamesTable games={games} />
      )}
    </section>
  );
};

export default GamesList;

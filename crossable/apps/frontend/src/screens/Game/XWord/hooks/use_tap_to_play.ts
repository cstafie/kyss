import type { Cell } from "shared";
import { useGame } from "@/contexts/game";
import { useCallback } from "react";

function useTapToPlay(currentCell: Cell) {
  const { playTile } = useGame();

  const handleTapTile = useCallback(
    (tileId: string) => {
      playTile(tileId, [currentCell.row, currentCell.col]);
    },
    [currentCell, playTile]
  );

  return handleTapTile;
}

export default useTapToPlay;

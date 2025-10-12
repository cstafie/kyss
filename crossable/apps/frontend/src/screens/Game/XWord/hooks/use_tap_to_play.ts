import { Cell } from "shared";
import { useSocketContext } from "@/contexts/socket";
import { useCallback } from "react";

function useTapToPlay(currentCell: Cell) {
  const { playTile } = useSocketContext();

  const handleTapTile = useCallback(
    (tileId: string) => {
      playTile(tileId, [currentCell.row, currentCell.col]);
    },
    [currentCell, playTile]
  );

  return handleTapTile;
}

export default useTapToPlay;

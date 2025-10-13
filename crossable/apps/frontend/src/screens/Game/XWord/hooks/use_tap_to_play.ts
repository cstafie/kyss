import type { Cell } from "shared";
import { useSocket } from "@/contexts/socket";
import { useCallback } from "react";

function useTapToPlay(currentCell: Cell) {
  const { playTile } = useSocket();

  const handleTapTile = useCallback(
    (tileId: string) => {
      playTile(tileId, [currentCell.row, currentCell.col]);
    },
    [currentCell, playTile]
  );

  return handleTapTile;
}

export default useTapToPlay;

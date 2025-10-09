import { Cell } from '@nx/api-interfaces';
import { useSocketContext } from 'apps/client/src/contexts/socket';
import { useCallback } from 'react';

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

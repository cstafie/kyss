import { useSocketContext } from 'apps/client/src/contexts/socket';
import { useCallback, useState } from 'react';

function useTapToPlay() {
  const { playTile } = useSocketContext();
  const [selectedTileId, setSelectedTileId] = useState('');

  const handleSelectCell = useCallback(
    (pos: [number, number]) => {
      if (selectedTileId) {
        playTile(selectedTileId, pos);
        setSelectedTileId('');
      }
    },
    [selectedTileId, playTile]
  );

  const handleSetSelectedTileId = useCallback(
    (tileId: string) => {
      setSelectedTileId(tileId === selectedTileId ? '' : tileId);
    },
    [selectedTileId]
  );

  return {
    selectedTileId,
    setSelectedTileId: handleSetSelectedTileId,
    handleSelectCell,
  };
}

export default useTapToPlay;

import { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import {
  Direction,
  GameState,
  Cell as CellType,
  XWord,
  XWordEntry,
} from '@nx/api-interfaces';
import Block from './block';
import Cell from './cell';

interface GridContainerProps {
  numCols: number;
  numRows: number;
}

// TODO: look into solving this using tailwind only
const GridContainer = styled.section`
  display: inline-grid;
  padding: 2px;
  gap: 2px;
  ${({ numCols, numRows }: GridContainerProps) => `
  grid-template-columns:  repeat(${numCols}, 48px);
  grid-template-rows:  repeat(${numRows}, 48px);
`}
`;

interface Props {
  xWord: XWord;
  currentEntry: XWordEntry;
  gameState: GameState;
  currentCell: CellType;
  handleSelectCell: (cell: CellType) => void;
}

const Grid = ({
  xWord,
  currentEntry,
  gameState,
  currentCell,
  handleSelectCell,
}: Props) => {
  const numberLookUp = useMemo(() => {
    const numberMap = new Map();
    for (const entry of xWord.entries) {
      for (let i = 0; i < entry.length; i++) {
        numberMap.set(`${entry.cell.row}-${entry.cell.col}`, entry.number);
      }
    }
    return numberMap;
  }, [xWord]);

  const isCellInCurrentEntry = useCallback(
    (row: number, col: number) => {
      switch (currentEntry.direction) {
        case Direction.ACROSS:
          return (
            row === currentEntry.cell.row &&
            col >= currentEntry.cell.col &&
            col < currentEntry.cell.col + currentEntry.length
          );
        case Direction.DOWN:
          return (
            col === currentEntry.cell.col &&
            row >= currentEntry.cell.row &&
            row < currentEntry.cell.row + currentEntry.length
          );
      }
    },
    [currentEntry]
  );

  return (
    <GridContainer
      numCols={xWord.width}
      numRows={xWord.height}
      className="bg-black"
    >
      {xWord.grid.flat().map((tile, i) => {
        const row = Math.floor(i / xWord.width);
        const col = i % xWord.width;
        const cellId = `cell-${row}-${col}`;
        const isHighlighted = isCellInCurrentEntry(row, col);
        const isCurrentCell =
          row === currentCell.row && col === currentCell.col;

        switch (tile.char) {
          case '#':
            return (
              <Block
                key={cellId}
                isGameDone={gameState === GameState.complete}
              />
            );
          default:
            return (
              <Cell
                key={cellId}
                id={cellId}
                tile={tile}
                number={numberLookUp.get(`${row}-${col}`)}
                isHighlighted={isHighlighted}
                isCurrentCell={isCurrentCell}
                onClick={() => handleSelectCell({ row, col })}
              />
            );
        }
      })}
    </GridContainer>
  );
};

export default Grid;

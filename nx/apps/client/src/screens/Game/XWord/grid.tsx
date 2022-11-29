import { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { Direction, GameState, XWord, XWordEntry } from '@nx/api-interfaces';
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
}

const Grid = ({ xWord, currentEntry, gameState }: Props) => {
  const numberLookUp = useMemo(() => {
    const numberMap = new Map();
    for (const entry of xWord.entries) {
      for (let i = 0; i < entry.length; i++) {
        numberMap.set(`${entry.row}-${entry.col}`, entry.number);
      }
    }
    return numberMap;
  }, [xWord]);

  const isCellInCurrentEntry = useCallback(
    (row: number, col: number) => {
      switch (currentEntry.direction) {
        case Direction.ACROSS:
          return (
            row === currentEntry.row &&
            col >= currentEntry.col &&
            col < currentEntry.col + currentEntry.length
          );
        case Direction.DOWN:
          return (
            col === currentEntry.col &&
            row >= currentEntry.row &&
            row < currentEntry.row + currentEntry.length
          );
      }
    },
    [currentEntry]
  );

  return (
    <GridContainer
      numCols={xWord.width}
      numRows={xWord.height}
      className="bg-black  m-6"
    >
      {xWord.grid.flat().map((tile, i) => {
        const row = Math.floor(i / xWord.width);
        const col = i % xWord.width;
        const cellId = `cell-${row}-${col}`;
        const isHighlighted = isCellInCurrentEntry(row, col);

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
              />
            );
        }
      })}
    </GridContainer>
  );
};

export default Grid;

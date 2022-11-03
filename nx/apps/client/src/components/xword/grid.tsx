import { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { Direction, XWord, XWordEntry } from '../../types';
import Block from './block';
import Cell from './cell';

interface GridContainerProps {
  numCols: number;
  numRows: number;
}

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
  xword: XWord;
  currentEntry: XWordEntry;
}

const Grid = ({ xword, currentEntry }: Props) => {
  const numberLookUp = useMemo(() => {
    const numberMap = new Map();
    for (const entry of xword.entries) {
      for (let i = 0; i < entry.length; i++) {
        numberMap.set(`${entry.row}-${entry.col}`, entry.number);
      }
    }
    return numberMap;
  }, [xword]);

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
      numCols={xword.width}
      numRows={xword.height}
      className="bg-black  m-6"
    >
      {xword.grid.flat().map((tile, i) => {
        const row = Math.floor(i / xword.width);
        const col = i % xword.width;
        const cellId = `cell-${row}-${col}`;
        const isHighlighted = isCellInCurrentEntry(row, col);

        switch (tile.char) {
          case '#':
            return <Block key={cellId} />;
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

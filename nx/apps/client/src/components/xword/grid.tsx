import styled from 'styled-components';
import { XWord } from '../../types';
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
}

const Grid = ({ xword }: Props) => {
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

        switch (tile.char) {
          case '#':
            return <Block key={cellId} />;
          default:
            return <Cell key={cellId} id={cellId} tile={tile} />;
        }
      })}
    </GridContainer>
  );
};

export default Grid;

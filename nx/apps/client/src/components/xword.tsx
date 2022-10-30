import { useCallback, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import styled from 'styled-components';
import { charToTile } from '../utils';
import { emptyXword } from '../xword_mock_data';
import Block from './block';
import Cell from './cell';
import Tile from './tile';

interface GridContainerProps {
  numCols: number;
  numRows: number;
}

const GridContainer = styled.section`
  display: inline-grid;
  padding: 2px;
  gap: 2px;
  ${({ numCols, numRows }: GridContainerProps) => `
    grid-template-columns:  repeat(${numCols}, 50px);
    grid-template-rows:  repeat(${numRows}, 50px);
  `}
`;

const XWord = () => {
  const [xword, setXword] = useState(emptyXword);
  const [tileBar, setTileBar] = useState(
    ['A', 'B', 'C', 'D', 'E'].map(charToTile)
  );

  // using useCallback is optional
  const onBeforeCapture = useCallback(() => {
    /*...*/
  }, []);
  const onBeforeDragStart = useCallback(() => {
    /*...*/
  }, []);
  const onDragStart = useCallback(() => {
    /*...*/
  }, []);
  const onDragUpdate = useCallback(() => {
    /*...*/
  }, []);
  const onDragEnd = useCallback((...stuff: any[]) => {
    // the only one that is required

    console.log(stuff);
  }, []);

  return (
    <section className="flex items-center flex-col m-12">
      <DragDropContext
        onBeforeCapture={onBeforeCapture}
        onBeforeDragStart={onBeforeDragStart}
        onDragStart={onDragStart}
        onDragUpdate={onDragUpdate}
        onDragEnd={onDragEnd}
      >
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

        <Droppable droppableId="tile-bar" direction="horizontal">
          {(provided) => (
            <section
              ref={provided.innerRef}
              className="m-6 flex justify-center border-2  border-black"
              {...provided.droppableProps}
            >
              {tileBar.map((tile, i) => (
                <Tile key={tile.id} tile={tile} index={i} />
              ))}
              {provided.placeholder}
            </section>
          )}
        </Droppable>
      </DragDropContext>
    </section>
  );
};

export default XWord;

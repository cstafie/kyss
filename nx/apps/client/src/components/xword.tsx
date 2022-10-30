import { useCallback, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import styled from 'styled-components';
import { emptyXword } from '../xword_mock_data';
import Block from './block';
import Cell from './cell';

interface GridContainerProps {
  numCols: number;
  numRows: number;
}

const GridContainer = styled.section`
  display: inline-grid;
  padding: 2px;
  margin: 12px;
  gap: 2px;
  ${({ numCols, numRows }: GridContainerProps) => `
    grid-template-columns:  repeat(${numCols}, 50px);
    grid-template-rows:  repeat(${numRows}, 50px);
  `}
`;

const XWord = () => {
  const [xword, setXword] = useState(emptyXword);

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
    <section className="flex items-center flex-col m-2">
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
          className="bg-black"
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

        <GridContainer numCols={5} numRows={1} className="bg-black">
          <Droppable droppableId="tile-bar">
            {(provided) => (
              <div
                className="bg-white flex justify-center items-center font-bold"
                {...provided.droppableProps}
              >
                {/* TODO: array of tiles on the tile bar */}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </GridContainer>
      </DragDropContext>
    </section>
  );
};

export default XWord;

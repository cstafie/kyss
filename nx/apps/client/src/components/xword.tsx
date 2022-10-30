import { useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import styled from 'styled-components';
import { emptyXword } from '../xword_mock_data';
import Block from './block';
import Empty from './empty';
import Letter from './letter';

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
          numCols={emptyXword.width}
          numRows={emptyXword.height}
          className="bg-black"
        >
          {emptyXword.grid.flat().map((char, i) => {
            switch (char) {
              case '#':
                return <Block />;
              case ' ':
                return <Empty />;
              default:
                return <Letter char={char} />;
            }
          })}
        </GridContainer>

        <GridContainer numCols={5} numRows={1} className="bg-black">
          <Letter char={'A'} />
          <Letter char={'B'} />
          <Letter char={'C'} />
          <Letter char={'D'} />
          <Letter char={'E'} />
        </GridContainer>
      </DragDropContext>
    </section>
  );
};

export default XWord;

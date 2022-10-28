import { useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import styled from 'styled-components';

interface GridContainerProps {
  numCols: number;
  numRows: number;
}

const GridContainer = styled.section`
  color: red;
  display: grid;
  ${({ numCols, numRows }: GridContainerProps) => `
    grid-template-columns:  repeat(${numCols}, 30px);
    grid-template-rows:  repeat(${numRows}, 30px);
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
    <DragDropContext
      onBeforeCapture={onBeforeCapture}
      onBeforeDragStart={onBeforeDragStart}
      onDragStart={onDragStart}
      onDragUpdate={onDragUpdate}
      onDragEnd={onDragEnd}
    >
      <GridContainer numCols={9} numRows={9}>
        {Array(81)
          .fill(null)
          .map((_, i) => (
            <div key={i}> i </div>
          ))}
      </GridContainer>

      <section className="flex">
        <div> A </div>
        <div> B </div>
        <div> C </div>
        <div> D </div>
        <div> E </div>
      </section>
    </DragDropContext>
  );
};

export default XWord;

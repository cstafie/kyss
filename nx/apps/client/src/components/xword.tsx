import { useCallback, useState } from 'react';
import produce from 'immer';
import {
  DragDropContext,
  Droppable,
  OnDragEndResponder,
} from '@hello-pangea/dnd';
import styled from 'styled-components';
import { charToTile } from '../utils';
import { xword11x11 } from '../mocks/xword_mock_data';
import Block from './block';
import Cell from './cell';
import Tile from './tile';
import { Tile as TyleType } from '../types';

interface GridContainerProps {
  numCols: number;
  numRows: number;
}

const TILE_BAR_ID = 'tile-bar';

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

const XWord = () => {
  const [xword, setXword] = useState(xword11x11);
  const [tileBar, setTileBar] = useState<Array<TyleType>>(
    []
    // ['A', 'B', 'C', 'D', 'E'].map(charToTile)
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
  const onDragEnd: OnDragEndResponder = useCallback(
    (dropResult) => {
      const { destination, source, draggableId } = dropResult;

      // user dropped outside of a droppable
      if (!destination) {
        return;
      }

      const di = destination.index;
      const si = source.index;

      // user dropped the item into the same place where it started
      if (destination.droppableId === source.droppableId && di === si) {
        return;
      }

      // tile bar to tile bar
      if (
        destination.droppableId === source.droppableId &&
        destination.droppableId === TILE_BAR_ID
      ) {
        const newTileBar = [...tileBar];

        newTileBar.splice(si, 1);
        newTileBar.splice(di, 0, tileBar[si]);

        setTileBar(newTileBar);
        return;
      }

      // tile bar to cell
      if (
        source.droppableId === TILE_BAR_ID &&
        destination.droppableId !== TILE_BAR_ID
      ) {
        const newTileBar = [...tileBar];

        // remove value from tile-bar
        newTileBar.splice(si, 1);
        setTileBar(newTileBar);

        const [_, row, col] = destination.droppableId.split('-').map(Number);

        setXword(
          produce(xword, (draft) => {
            draft.grid[row][col] = tileBar[si];
          })
        );
        return;
      }

      // cell to cell
      if (
        source.droppableId !== TILE_BAR_ID &&
        destination.droppableId !== TILE_BAR_ID
      ) {
        const [_d, dRow, dCol] = destination.droppableId.split('-').map(Number);
        const [_s, sRow, sCol] = source.droppableId.split('-').map(Number);

        setXword(
          produce(xword, (draft) => {
            [draft.grid[dRow][dCol], draft.grid[sRow][sCol]] = [
              draft.grid[sRow][sCol],
              draft.grid[dRow][dCol],
            ];
          })
        );

        return;
      }

      // cell to tile bar
      if (
        source.droppableId !== TILE_BAR_ID &&
        destination.droppableId === TILE_BAR_ID
      ) {
        const [_, row, col] = source.droppableId.split('-').map(Number);

        const newTileBar = [...tileBar];
        newTileBar.splice(di, 0, xword.grid[row][col]);
        setTileBar(newTileBar);

        setXword(
          produce(xword, (draft) => {
            draft.grid[row][col] = charToTile(' ');
          })
        );

        return;
      }
    },
    [tileBar, xword]
  );

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

        <Droppable droppableId={TILE_BAR_ID} direction="horizontal">
          {(provided) => (
            <section
              ref={provided.innerRef}
              className="m-6 flex border-2 border-black w-60 h-[52px]"
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

import { Draggable } from "@hello-pangea/dnd";
import type { Tile as TileType } from "shared";
import type { MouseEventHandler } from "react";

interface Props {
  tile: TileType;
  index: number;
  isDragDisabled: boolean;
  isHighlighted: boolean;
  isCurrentCell: boolean;
  onClick?: MouseEventHandler<HTMLDivElement>;
  className?: string;
}

const Tile = ({
  tile,
  index,
  isDragDisabled,
  isHighlighted,
  isCurrentCell,
  onClick,
  className,
}: Props) => {
  return (
    <Draggable
      draggableId={tile.id}
      index={index}
      isDragDisabled={isDragDisabled}
    >
      {(provided) => (
        <div
          ref={provided.innerRef}
          onClick={onClick}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          // className="bg-orange-200 hover:bg-orange-300 active:shadow-lg active:bg-orange-300 w-12 h-12 flex justify-center items-center pt-2 font-bold text-lg"
          className={`${
            isHighlighted
              ? "bg-blue-400 hover:bg-blue-500  active:bg-blue-500"
              : "bg-purple-400 hover:bg-purple-500  active:bg-purple-500"
          } 
          ${
            isCurrentCell
              ? "bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-500"
              : ""
          }
          active:shadow-lg w-12 h-12 flex justify-center items-center pt-2 font-bold text-lg ${className}`}
        >
          {tile.char}
        </div>
      )}
    </Draggable>
  );
};

export default Tile;

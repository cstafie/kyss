import type { XWordEntry } from "shared";

interface Props {
  handleSelect: () => void;
  isHighlighted: boolean;
  entry: XWordEntry;
}

const Clue = ({ handleSelect, isHighlighted, entry }: Props) => {
  return (
    <div
      onClick={handleSelect}
      className={`flex flex-row items-center cursor-pointer  hover:scale-105 active:scale-95 p-2 mx-6 border-2 h-20 border-purple-500 rounded-md sm:mx-0 sm:border-none sm:h-auto sm:rounded-none ${
        isHighlighted ? "bg-blue-500" : ""
      } ${entry.isComplete && !isHighlighted ? "text-gray-500" : ""}`}
    >
      <div className="font-bold mr-2">{entry.number}.</div>
      <div>{entry.clue} </div>
    </div>
  );
};

export default Clue;

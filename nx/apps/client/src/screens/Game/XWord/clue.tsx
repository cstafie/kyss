import { XWordEntry } from '@nx/api-interfaces';

interface Props {
  handleSelect: () => void;
  isHighlighted: boolean;
  entry: XWordEntry;
}

const Clue = ({ handleSelect, isHighlighted, entry }: Props) => {
  return (
    <div
      onClick={handleSelect}
      className={`flex flex-row items-center p-2 cursor-pointer hover:scale-105 active:scale-95 ${
        isHighlighted ? 'bg-blue-500' : ''
      } ${entry.isComplete && !isHighlighted ? 'text-gray-500' : ''}`}
    >
      <div className="font-bold mr-2">{entry.number}.</div>
      <div>{entry.clue} </div>
    </div>
  );
};

export default Clue;

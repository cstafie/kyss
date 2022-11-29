import { XWordEntry } from '@nx/api-interfaces';

interface Props {
  entries: Array<XWordEntry>;
  currentEntry: XWordEntry;
  handleSelect: (entry: XWordEntry) => void;
}

const Clues = ({ entries, currentEntry, handleSelect }: Props) => (
  <ol>
    <li>
      {entries.map((entry, i) => {
        const isHighlighted = entry === currentEntry;

        return (
          <div
            // ok to use the index as key here since this list will (should?) never change size
            key={i}
            onClick={() => handleSelect(entry)}
            className={`flex flex-row items-center p-2 cursor-pointer hover:scale-105 active:scale-95 ${
              isHighlighted ? 'bg-blue-500' : ''
            } ${entry.isComplete && !isHighlighted ? 'text-gray-500' : ''}`}
          >
            <div className="font-bold mr-2">{entry.number}.</div>
            <div>{entry.clue} </div>
          </div>
        );
      })}
    </li>
  </ol>
);

export default Clues;

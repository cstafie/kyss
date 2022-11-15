import { XWordEntry } from '@nx/api-interfaces';

interface Props {
  entries: Array<XWordEntry>;
  currentEntry: XWordEntry;
}

const Clues = ({ entries, currentEntry }: Props) => (
  <ol>
    <li>
      {entries.map((entry, i) => {
        const isHighlighted = entry === currentEntry;

        return (
          <div
            // ok to use the index as key here since this list will (should?) never change size
            key={i}
            className={`flex flex-row items-center p-2 ${
              isHighlighted ? 'bg-blue-500' : ''
            }`}
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

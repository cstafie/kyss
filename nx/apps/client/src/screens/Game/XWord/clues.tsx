import { XWordEntry } from '@nx/api-interfaces';
import Clue from './clue';

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

        // ok to use the index as key here since this list will (should?) never change size
        return (
          <Clue
            key={i}
            handleSelect={() => handleSelect(entry)}
            entry={entry}
            isHighlighted={isHighlighted}
          />
        );
      })}
    </li>
  </ol>
);

export default Clues;

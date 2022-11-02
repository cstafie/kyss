import { XWordEntry } from '../../types';

interface Props {
  entries: Array<XWordEntry>;
}

const Clues = ({ entries }: Props) => (
  <ol>
    <li>
      {entries.map((entry, i) => (
        <div
          // ok to use the index as key here since this list will (should?) never change size
          key={i}
          className="flex flex-row m-1 items-center"
        >
          <div className="font-bold mr-2">{entry.number}.</div>
          <div>{entry.clue} </div>
        </div>
      ))}
    </li>
  </ol>
);

export default Clues;

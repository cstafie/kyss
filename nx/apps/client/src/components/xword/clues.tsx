import { XWordEntry } from '../../types';

interface Props {
  entries: Array<XWordEntry>;
}

const Clues = ({ entries }: Props) => (
  <ol>
    <li>
      {entries.map((entry) => (
        <div key={entry.clue} className="flex flex-row">
          <div className="font-bold">{entry.number}.</div>
          <div>{entry.clue} </div>
        </div>
      ))}
    </li>
  </ol>
);

export default Clues;

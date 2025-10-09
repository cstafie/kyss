import {
  getNRandom,
  mapGrid,
  XWord,
  XWordEntry,
  Direction,
} from '@nx/api-interfaces';
import * as fs from 'fs';

const mapEntries = (entries: any[]): Array<XWordEntry> => {
  return entries.map((entry) => ({
    ...entry,
    cell: {
      row: entry.row,
      col: entry.col,
    },
    isComplete: false,
    direction: entry.direction === 'Across' ? Direction.across : Direction.down,
  }));
};

export const getRandomXWord = (): XWord => {
  const path = __dirname + '/assets/generated_xWords/';
  const filePaths = fs.readdirSync(path);
  const randomFile = getNRandom(filePaths, 1)[0];
  const jsonXWord = JSON.parse(fs.readFileSync(path + randomFile).toString());

  return {
    ...jsonXWord,
    grid: mapGrid(jsonXWord.grid),
    entries: mapEntries(jsonXWord.entries),
  };
};

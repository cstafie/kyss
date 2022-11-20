import { getNRandom, mapEntries, mapGrid, XWord } from '@nx/api-interfaces';
import * as fs from 'fs';

export const getRandomXWord = (): XWord => {
  const path = __dirname + '/generated_xWords/';
  const filePaths = fs.readdirSync(path);
  const randomFile = getNRandom(filePaths, 1)[0];
  const jsonXWord = JSON.parse(fs.readFileSync(path + randomFile).toString());

  return {
    ...jsonXWord,
    grid: mapGrid(jsonXWord.grid),
    entries: mapEntries(jsonXWord.entries),
  };
};

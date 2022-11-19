import { getNRandom, XWord } from '@nx/api-interfaces';
import * as fs from 'fs';

export const getRandomXWord = (): XWord => {
  const filePaths = fs.readdirSync(__dirname + '../../generated_xWords');

  const file = getNRandom(filePaths);
};

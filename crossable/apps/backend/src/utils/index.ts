import { getNRandom, mapGrid, XWord, XWordEntry, Direction } from "shared";
import { join } from "path";
import * as fs from "fs";

const mapEntries = (entries: any[]): Array<XWordEntry> => {
  return entries.map((entry) => ({
    ...entry,
    cell: {
      row: entry.row,
      col: entry.col,
    },
    isComplete: false,
    direction: entry.direction === "Across" ? Direction.across : Direction.down,
  }));
};

// TODO: decouple from fs for better testability
// TODO: decouple from crossword assets from build
export const getRandomXWord = (): XWord => {
  const path = "./dist/assets/generated_xWords/";
  const filePaths = fs.readdirSync(path);
  const randomFile = getNRandom(filePaths, 1)[0];
  const jsonXWord = JSON.parse(
    fs.readFileSync(join(path, randomFile)).toString()
  );

  return {
    ...jsonXWord,
    grid: mapGrid(jsonXWord.grid),
    entries: mapEntries(jsonXWord.entries),
  };
};

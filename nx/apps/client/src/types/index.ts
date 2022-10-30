export interface XWord {
  grid: Array<Array<Tile>>;
  width: number;
  height: number;
}

export interface Tile {
  id: string;
  char: string;
}

import { XWord, Tile, shuffleArray } from '@nx/api-interfaces';
import Entity from '../entity/entity';
import { empty5x5, xWord5x5 } from './mock_xWord';
import { v4 as uuidv4 } from 'uuid';

const TILE_BAR_SIZE = 5;

interface PlayerInfo {
  tileBar: Array<Tile>;
  score: number;
}

export class Game extends Entity {
  name: string;
  xWord: XWord;
  players: Map<string, PlayerInfo>;
  tiles: Set<Tile>;
  log: Array<string>;

  constructor(name = uuidv4()) {
    super();
    this.name = name;
    this.xWord = empty5x5;
    this.players = new Map();
    this.log = [];

    this.initTiles(xWord5x5.grid.flat().filter((tile) => tile.char !== '#'));
  }

  initTiles(tiles: Array<Tile>) {
    shuffleArray<Tile>(tiles);
    this.tiles = new Set(tiles);
  }

  initTileBar() {
    const tileBar = [];

    const tileIterator = this.tiles.values();

    for (let i = 0; i < TILE_BAR_SIZE; i++) {
      const tileIteratorResult = tileIterator.next();

      if (tileIteratorResult.done) {
        break;
      }

      const tile = tileIteratorResult.value;
      tileBar.push(tile);
      this.tiles.delete(tile);
    }

    return tileBar;
  }

  fillTileBar(tileBar) {
    if (tileBar.length >= TILE_BAR_SIZE) {
      return;
    }

    const tileIterator = this.tiles.values();
    const tileIteratorResult = tileIterator.next();

    if (tileIteratorResult.done) {
      return;
    }

    const tile = tileIteratorResult.value;
    tileBar.push(tile);
    this.tiles.delete(tile);
  }

  addPlayer(playerId: string) {
    this.players.set(playerId, {
      tileBar: this.initTileBar(),
      score: 0,
    });
  }

  removePlayer(playerId: string) {
    this.players.delete(playerId);
  }
}

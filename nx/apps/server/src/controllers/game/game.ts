import {
  XWord,
  Tile,
  shuffleArray,
  GameState,
  PlayerInfo,
} from '@nx/api-interfaces';
import Entity from '../entity/entity';
import { empty5x5, xWord5x5 } from './mock_xWord';

const TILE_BAR_SIZE = 5;

export class Game extends Entity {
  name: string;
  creatorName: string;
  creatorId: string;
  xWord: XWord;
  players: Map<string, PlayerInfo>;
  tiles: Set<Tile>;
  log: Array<string>;
  gameState: GameState;

  constructor(name, player) {
    super();
    this.name = name;
    this.xWord = empty5x5;
    this.players = new Map();
    this.log = [];
    this.creatorId = player.id;
    this.creatorName = player.name;
    this.initTiles(xWord5x5.grid.flat().filter((tile) => tile.char !== '#'));
    this.gameState = GameState.waitingToStart;
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
      ready: false,
    });
  }

  removePlayer(playerId: string) {
    this.players.delete(playerId);
  }
}

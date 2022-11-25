import {
  XWord,
  Tile,
  shuffleArray,
  GameState,
  PlayerInfo,
  emptyGrid,
  mapGrid,
} from '@nx/api-interfaces';
import Entity from '../entity/entity';
import Player from '../player/player';

const TILE_BAR_SIZE = 5;

export class Game extends Entity {
  name: string;
  creatorName: string;
  creatorId: string;
  solvedXWord: XWord;
  xWord: XWord;
  players: Map<string, PlayerInfo>;
  tiles: Set<Tile>;
  log: Array<string>;
  gameState: GameState;

  constructor(name, player, xWord) {
    super();

    console.log(xWord.grid);

    const theEmptyGrid = emptyGrid(xWord.grid);

    console.log(theEmptyGrid);

    this.name = name;
    this.solvedXWord = xWord;
    this.xWord = {
      ...xWord,
      grid: emptyGrid(xWord.grid),
    };
    this.players = new Map();
    this.log = [];
    this.creatorId = player.id;
    this.creatorName = player.name;
    this.initTiles(xWord.grid.flat().filter((tile) => tile.char !== '#'));
    this.gameState = GameState.waitingToStart;
  }

  initTiles(tiles: Array<Tile>) {
    shuffleArray<Tile>(tiles);
    this.tiles = new Set(tiles);
  }

  start() {
    const players = Array.from(this.players.values());

    const allPlayersReady = players.every((player) => player.ready);

    if (allPlayersReady) {
      this.gameState = GameState.inProgress;
    }
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

  addPlayer(player: Player) {
    const existingPlayer = this.players.get(player.id);

    if (!existingPlayer) {
      this.players.set(player.id, {
        id: player.id,
        tileBar: this.initTileBar(),
        score: 0,
        ready: false,
        name: player.name,
      });
    }
  }

  removePlayer(playerId: string) {
    this.players.delete(playerId);
  }
}

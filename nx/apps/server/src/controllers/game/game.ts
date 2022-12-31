import {
  XWord,
  GameState,
  PlayerInfo,
  emptyGrid,
  get1Random,
  TILE_BAR_SIZE,
  SCORE_INCREASE,
  SCORE_DECREASE,
  charToTile,
} from '@nx/api-interfaces';
import Entity from '../entity/entity';
import { TileManager } from './tile_manager';

export class Game extends Entity {
  name: string;
  creatorName: string;
  creatorId: string;
  solvedXWord: XWord;
  xWord: XWord;
  players: Map<string, PlayerInfo>;
  tileManager: TileManager;
  // log: Array<string>;
  gameState: GameState;

  constructor(name, player, xWord) {
    super();

    this.name = name;
    this.solvedXWord = xWord;
    this.xWord = {
      ...xWord,
      grid: emptyGrid(xWord.grid),
    };
    this.players = new Map();
    // this.log = [];
    this.creatorId = player.id;
    this.creatorName = player.name;
    this.tileManager = new TileManager(
      xWord.grid.flat().filter((tile) => tile.char !== '#')
    );
    this.gameState = GameState.waitingToStart;
  }

  start() {
    const players = Array.from(this.players.values());

    const allPlayersReady = players.every((player) => player.ready);

    if (allPlayersReady) {
      this.gameState = GameState.inProgress;
    }
  }

  fillPlayerTileBar(playerId: string) {
    const player = this.players.get(playerId);

    if (this.tileManager.fillTileBar(player.tileBar)) {
      return;
    }

    // tile manager ran out of tiles
    // let's take a random tile we don't have from one of the other players

    const otherPlayersTiles = [];

    this.players.forEach((info, id) => {
      if (id === playerId) {
        return;
      }

      otherPlayersTiles.push(...info.tileBar);
    });

    const playeTrileIds = new Set(player.tileBar.map((tile) => tile.id));

    const filteredTiles = otherPlayersTiles.filter(
      (tile) => !playeTrileIds.has(tile.id)
    );

    if (filteredTiles.length === 0 || player.tileBar.length === TILE_BAR_SIZE) {
      return;
    }

    const randomTile = get1Random(filteredTiles);
    // make a new tile with the same char
    player.tileBar.push(charToTile(randomTile.char));
  }

  addPlayer(id: string, name: string, ready = false) {
    const existingPlayer = this.players.get(id);

    if (!existingPlayer) {
      this.players.set(id, {
        id,
        tileBar: [],
        score: 0,
        ready,
        name: name,
      });
      this.fillPlayerTileBar(id);
    }
  }

  removePlayer(playerId: string) {
    const playerInfo = this.players.get(playerId);

    if (!playerInfo) {
      return;
    }

    this.tileManager.emptyTileBar(playerInfo.tileBar);
    this.players.delete(playerId);

    const otherPlayers = Array.from(this.players.values());

    otherPlayers.sort(
      (playerA, playerB) => playerA.tileBar.length - playerB.tileBar.length
    );

    otherPlayers.forEach((player) => this.fillPlayerTileBar(player.id));
  }

  updateTileBar(playerId: string, tileBarIds: Array<string>) {
    const playerInfo = this.players.get(playerId);

    if (!playerInfo || tileBarIds.length !== playerInfo.tileBar.length) {
      return;
    }

    const tileMap = playerInfo.tileBar.reduce(
      (map, tile) => map.set(tile.id, tile),
      new Map()
    );

    const newTileBar = [];

    for (const tileId of tileBarIds) {
      const tile = tileMap.get(tileId);

      if (!tile) {
        return;
      }

      newTileBar.push(tile);
    }

    playerInfo.tileBar = newTileBar;
  }

  playTile({
    playerId,
    tileId,
    pos,
  }: {
    playerId: string;
    tileId: string;
    pos: [number, number];
  }) {
    const [row, col] = pos;

    const playerInfo = this.players.get(playerId);

    if (!playerInfo || this.xWord.grid[row][col].char !== ' ') {
      // TODO: should these log an error?
      return;
    }

    const { tileBar } = playerInfo;
    const tileIndex = tileBar.findIndex((tile) => tile.id === tileId);

    if (tileIndex === -1) {
      return;
    }

    const tile = tileBar[tileIndex];

    if (this.solvedXWord[row][col].char !== tile.char) {
      // incorrect play
      playerInfo.score += SCORE_DECREASE;
      return;
    }

    // correct play
    playerInfo.score += SCORE_INCREASE;
    tileBar.splice(tileIndex, 1);
    this.xWord.grid[row][col] = tile;
  }

  setReady(playerId: string, ready: boolean) {
    const playerInfo = this.players.get(playerId);

    if (!playerInfo) {
      return;
    }

    playerInfo.ready = ready;
  }
}

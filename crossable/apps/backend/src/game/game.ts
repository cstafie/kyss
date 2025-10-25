import {
  XWord,
  GameState,
  PlayerInfo,
  emptyGrid,
  get1Random,
  TILE_BAR,
  SCORING,
  charToTile,
  countEmpty,
  isEntryComplete,
  Tile,
  User,
} from "shared";
import { TileManager } from "./tile_manager";
import { PlayerManager } from "./player_manager";

export class Game {
  id: string = crypto.randomUUID();
  createdAt: Date = new Date();
  name: string;
  creatorName: string;
  creatorId: string;
  solvedXWord: XWord;
  xWord: XWord;
  playerManager: PlayerManager;
  tileManager: TileManager;
  // log: Array<string>;
  gameState: GameState;

  constructor({
    name,
    player,
    xWord,
    playerManager,
  }: {
    name: string;
    player: User;
    xWord: XWord;
    playerManager: PlayerManager;
  }) {
    this.name = name;
    this.solvedXWord = xWord;
    this.xWord = {
      ...xWord,
      grid: emptyGrid(xWord.grid),
    };
    this.playerManager = playerManager;
    // this.log = [];
    this.creatorId = player.id;
    this.creatorName = player.name;
    this.tileManager = new TileManager(
      xWord.grid.flat().filter((tile: Tile) => tile.char !== "#")
    );
    this.gameState = GameState.waitingToStart;
  }

  start() {
    const players = Array.from(this.playerManager.getPlayerValues());

    const allPlayersReady = players.every((player) => player.ready);

    if (!allPlayersReady) {
      throw new Error("Not all players are ready");
    }

    // fill all player tile bars
    players.forEach((player) => this.fillPlayerTileBar(player.id));
    this.gameState = GameState.inProgress;
  }

  fillPlayerTileBar(playerId: string) {
    const player = this.playerManager.getPlayerInfo(playerId);

    // TODO: error management and consistency
    if (!player) throw new Error("Player not found");

    if (this.tileManager.fillTileBar(player.tileBar)) {
      return;
    }

    // tile manager ran out of tiles
    // let's take a random tile we don't have from one of the unplayed tiles

    const unplayedChars = new Set<string>();

    for (let row = 0; row < this.xWord.grid.length; row++) {
      for (let col = 0; col < this.xWord.grid[row].length; col++) {
        if (this.xWord.grid[row][col].char === " ") {
          unplayedChars.add(this.solvedXWord.grid[row][col].char);
        }
      }
    }

    while (player.tileBar.length < TILE_BAR.NUMBER_OF_TILES) {
      const playerTileChars = new Set(player.tileBar.map((tile) => tile.char));
      const filteredChars = Array.from(unplayedChars).filter(
        (char) => !playerTileChars.has(char)
      );

      if (filteredChars.length === 0) {
        return;
      }

      const randomChar = get1Random(filteredChars);
      // make a new tile with the same char
      player.tileBar.push(charToTile(randomChar));
    }
  }

  removePlayer(playerId: string) {
    let playerInfo: PlayerInfo;

    try {
      playerInfo = this.playerManager.getPlayerInfo(playerId);
    } catch (error) {
      throw new Error("Game: removePlayer: " + error);
    }

    this.tileManager.emptyTileBar(playerInfo.tileBar);
    this.playerManager.playerLeaveGame(playerId);

    const otherPlayers = this.playerManager.getPlayerValues();

    otherPlayers.sort(
      (playerA, playerB) => playerA.tileBar.length - playerB.tileBar.length
    );

    otherPlayers.forEach((player) => this.fillPlayerTileBar(player.id));
  }

  updateTileBar({
    playerId,
    tileBarIds,
  }: {
    playerId: string;
    tileBarIds: Array<string>;
  }) {
    const playerInfo = this.playerManager.getPlayerInfo(playerId);

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
  }): boolean {
    const [row, col] = pos;
    const playerInfo = this.playerManager.getPlayerInfo(playerId);

    // this might happen in a race condition
    if (this.xWord.grid[row][col].char !== " ") {
      throw new Error("Tile position already occupied");
    }

    const { tileBar } = playerInfo;
    const tileIndex = tileBar.findIndex((tile) => tile.id === tileId);

    // this should probably never happen
    if (tileIndex === -1) {
      throw new Error("Tile not found in player's tile bar");
    }

    const tile = tileBar[tileIndex];

    // -- incorrect play --
    if (this.solvedXWord.grid[row][col].char !== tile.char) {
      playerInfo.score += SCORING.DECREASE;
      return false;
    }

    // -- correct play --

    // play the tile
    this.xWord.grid[row][col] = tile;

    // update player score
    playerInfo.score += SCORING.INCREASE;

    // update tile bar
    tileBar.splice(tileIndex, 1);
    this.fillPlayerTileBar(playerId);

    // mark entries complete
    this.xWord.entries.forEach((entry) => {
      if (isEntryComplete(this.xWord, entry)) {
        entry.isComplete = true;
      }
    });

    this.checkGameOver();
    // todo: have a better return type
    return true;
  }

  checkGameOver() {
    const numEmptyTiles = countEmpty(this.xWord);
    const isGameOver = numEmptyTiles === 0;

    if (isGameOver) {
      this.gameState = GameState.complete;
    }
  }

  setReady({ playerId, ready }: { playerId: string; ready: boolean }) {
    const playerInfo = this.playerManager.getPlayerInfo(playerId);
    playerInfo.ready = ready;
  }
}

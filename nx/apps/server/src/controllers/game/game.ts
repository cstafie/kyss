import {
  XWord,
  Tile,
  GameState,
  PlayerInfo,
  emptyGrid,
  get1Random,
  TILE_BAR_SIZE,
} from '@nx/api-interfaces';
import Entity from '../entity/entity';
import Player from '../player/player';
import { TileManager } from './tile_manager';

export class Game extends Entity {
  name: string;
  creatorName: string;
  creatorId: string;
  solvedXWord: XWord;
  xWord: XWord;
  players: Map<string, PlayerInfo>;
  tileManager: TileManager;
  log: Array<string>;
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
    this.log = [];
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
    player.tileBar.push(randomTile);
  }

  addPlayer(player: Player) {
    const existingPlayer = this.players.get(player.id);

    if (!existingPlayer) {
      this.players.set(player.id, {
        id: player.id,
        tileBar: [],
        score: 0,
        ready: false,
        name: player.name,
      });
      this.fillPlayerTileBar(player.id);
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
}

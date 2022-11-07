import { XWord, Tile, sameXWord, GameUpdate } from '@nx/api-interfaces';
import { Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { empty7x7, xWord7x7 } from './mock_xWord';

const TILE_BAR_SIZE = 5;

interface PlayerInfo {
  tileBar: Array<Tile>;
  score: number;
}

class Entity {
  id: string;

  constructor() {
    this.id = uuidv4();
  }
}

export class Game extends Entity {
  xWord: XWord;
  players: Map<string, PlayerInfo>;
  tiles: Set<Tile>;

  constructor() {
    super();
    this.xWord = empty7x7;
    this.players = new Map();

    // TODO: shuffle
    this.initTiles(xWord7x7.grid.flat().filter((tile) => tile.char !== '#'));
  }

  initTiles(tiles: Array<Tile>) {
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

export class Player extends Entity {
  name: string;
  socket: Socket;

  constructor(name: string, socket: Socket) {
    super();
    this.name = name;
    this.socket = socket;
  }
}

export class GameManager {
  // games: Map<string, Game>;
  game: Game;
  players: Map<string, Player>;

  constructor() {
    // this.games = new Map();
    this.game = new Game();
    this.players = new Map();
  }

  // newGame(): Game {
  //   const game = new Game();
  //   this.games.set(game.id, game);
  //   return game;
  // }

  newPlayer(name: string, socket: Socket): Player {
    const player = new Player(name, socket);
    this.players.set(player.id, player);
    this.game.addPlayer(player.id);

    this.subscribeSocket(socket, player.id);
    return player;
  }

  subscribeSocket(socket: Socket, playerId: string) {
    socket.on('update', ({ tileBar, xWord }: GameUpdate) => {
      if (!sameXWord(xWord7x7, xWord)) {
        return socket.emit('update', {
          xWord: this.game.xWord,
          tileBar: this.game.players.get(playerId).tileBar,
        });
      }

      this.game.xWord = xWord;
      this.game.players.get(playerId).tileBar = tileBar;
      this.updatePlayers();
    });
  }

  updatePlayers() {
    for (const player of this.players.values()) {
      player.socket.emit('update', {
        xWord: this.game.xWord,
        tileBar: this.game.players.get(player.id).tileBar,
      });
    }
  }
}

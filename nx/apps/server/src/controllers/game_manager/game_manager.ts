import { v4 as uuidv4 } from 'uuid';

import {
  countEmpty,
  GameMetaData,
  GameState,
  isEntryComplete,
  PlayerGameUpdate,
  PlayerInfo,
  sameXWord,
  ServerGameUpdate,
} from '@nx/api-interfaces';
import { getRandomXWord } from '../../utils';
import { Game } from '../game/game';
import Player from '../player/player';

const SCORE_INCREASE = 10;
const SCORE_DECREASE = -5;

export class GameManager {
  games: Map<string, Game>;
  players: Map<string, Player>;
  disconnectedPlayers: Map<string, Player>;

  constructor() {
    this.games = new Map();
    this.players = new Map();
    this.disconnectedPlayers = new Map();
  }

  newGame(gameName: string, player: Player) {
    const randomXWord = getRandomXWord();
    const game = new Game(gameName, player, randomXWord);
    this.games.set(game.id, game);

    // add the creator of the game to their own game
    this.playerJoinGame(game, player);

    console.log(`${player.name} created a new game`);

    this.updateServerMembers();
  }

  playerJoinGame(game: Game, player: Player, wasDisconnected = false) {
    const canJoin =
      wasDisconnected || game.gameState === GameState.waitingToStart;

    if (!canJoin) {
      return;
    }

    game.addPlayer(player);

    this.players.set(player.id, {
      ...player,
      currentGameId: game.id,
    });

    player.socket.on('update-game', (gameUpdate: PlayerGameUpdate) => {
      this.updateGame(player, game, gameUpdate);
    });

    player.socket.on('start-game', () => this.startGame(game));

    player.socket.on('leave-game', () =>
      this.playerLeaveGame(game.id, player.id)
    );

    this.updateGamePlayers(game);
  }

  // TODO: cleanup this large function
  // TODO: ensure this is idempotent
  playerJoin(player: Player) {
    const playerAlreadyJoined = this.players.has(player.id);

    this.players.set(player.id, player);

    const disconnectInfo = this.disconnectedPlayers.get(player.id);

    if (disconnectInfo) {
      this.disconnectedPlayers.delete(player.id);

      this.players.set(player.id, {
        ...player,
        currentGameId: disconnectInfo.currentGameId,
      });

      const game = this.games.get(disconnectInfo.currentGameId);
      console.log(`${player.name} was reconnected to the server`);

      // if that game still exists, let's join them to it
      if (game) {
        this.playerJoinGame(game, player, true);
        console.log(`${player.name} rejoined their game`);
      }
    } else {
      console.log(`${player.name} joined the server`);
    }

    this.updateServerMembers();

    if (playerAlreadyJoined) {
      return;
    }

    player.socket.on('join-game', (gameId) => {
      const game = this.games.get(gameId);

      if (game) {
        this.playerJoinGame(game, player);
      }
    });

    player.socket.on('create-game', (gameName: string) =>
      this.newGame(gameName, player)
    );
  }

  makeServerGameUpdate(playerInfo: PlayerInfo, game: Game): ServerGameUpdate {
    const { tileBar, score, ready } = playerInfo;

    const gameUpdate: ServerGameUpdate = {
      xWord: game.xWord,
      gameState: game.gameState,
      serializedPlayersMap: JSON.stringify(Array.from(game.players.entries())),
      ready,
      score,
      tileBar,
    };

    return gameUpdate;
  }

  updateGamePlayers(game: Game) {
    Array.from(game.players.entries()).forEach(([playerId, playerInfo]) => {
      const player = this.players.get(playerId);

      if (!player) {
        return;
      }

      player.socket.emit(
        'game-update',
        this.makeServerGameUpdate(playerInfo, game)
      );
    });
  }

  // TODO: split this into playTile and setReady
  updateGame(player: Player, game: Game, gameUpdate: PlayerGameUpdate) {
    const { ready, xWord, tileBar } = gameUpdate;
    const playerInfo = game.players.get(player.id);

    if (!playerInfo) {
      return;
    }

    const oldEmptyCount = countEmpty(game.xWord);
    const newEmptyCount = countEmpty(xWord);

    if (!sameXWord(game.solvedXWord, xWord)) {
      playerInfo.score += SCORE_DECREASE;
      this.updateGamePlayers(game);
      return;
    }

    const tileCountDiff = oldEmptyCount - newEmptyCount;

    // we can only have no change, or at most 1
    if (!(tileCountDiff === 0 || tileCountDiff === 1)) {
      this.updateGamePlayers(game);
      return;
    }

    // if they played a letter
    if (tileCountDiff === 1) {
      playerInfo.score += SCORE_INCREASE;

      game.xWord = xWord;

      // tilebar should only get filled if we played a letter
      playerInfo.tileBar = tileBar;
      game.fillPlayerTileBar(playerInfo.id);

      // mark entries as complete
      game.xWord.entries.forEach((entry) => {
        if (!entry.isComplete) {
          entry.isComplete = isEntryComplete(game.xWord, entry);
        }
      });

      // TODO: fix this ugly hack
      // we give each tile a new id, so that duplicate ids don't mess up drag and drop
      game.xWord.grid.flat().forEach((tile) => (tile.id = uuidv4()));
    }

    game.players.set(player.id, {
      ...playerInfo,
      ready,
    });

    const isGameOver = newEmptyCount === 0;

    if (isGameOver) {
      game.gameState = GameState.complete;
    }

    this.updateGamePlayers(game);

    // delete the game if it's over
    if (isGameOver) {
      // TODO: any other cleanup?
      this.games.delete(game.id);
      this.updateServerMembers();
    }
  }

  startGame(game: Game) {
    game.start();
    this.updateServerMembers();
    this.updateGamePlayers(game);
  }

  // TODO: ensure this is idempotent
  playerDisconnect(playerId: string) {
    const playerInfo = this.players.get(playerId);
    if (!playerInfo) {
      return;
    }

    this.disconnectedPlayers.set(playerId, playerInfo);
    this.players.delete(playerId);

    console.log(`${playerInfo.name} disconnected from the server`);
  }

  playerLeaveGame(gameId: string, playerId: string) {
    const game = this.games.get(gameId);
    const player = this.players.get(playerId);

    if (player) {
      this.players.set(playerId, {
        ...player,
        currentGameId: '',
      });
    }

    if (game) {
      game.removePlayer(player.id);

      if (game.players.size === 0) {
        this.games.delete(game.id);
      } else {
        this.updateGamePlayers(game);
      }
    }

    this.updateServerMembers();
  }

  updateServerMembers() {
    const gameValues = Array.from(this.games.values());

    const games: Array<GameMetaData> = gameValues.map((game) => ({
      id: game.id,
      name: game.name,
      createdAt: game.createdAt,
      numberOfPlayers: game.players.size,
      creatorId: game.creatorId,
      creatorName: game.creatorName,
      gameState: game.gameState,
    }));

    games.sort((gameA, gameB) => {
      return gameB.createdAt.getTime() - gameA.createdAt.getTime();
    });

    for (const player of this.players.values()) {
      player.socket.emit(
        'server-update',
        games.filter((game) => game.gameState === GameState.waitingToStart)
      );
    }
  }
}

export default GameManager;

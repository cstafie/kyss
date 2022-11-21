import {
  countEmpty,
  GameMetaData,
  PlayerGameUpdate,
  PlayerInfo,
  sameXWord,
  ServerGameUpdate,
} from '@nx/api-interfaces';
import { getRandomXWord } from '../../utils';
import { Game } from '../game/game';
import Player from '../player/player';

/*
player actions
- join-server (happens implicitly)
- leave server (due to disconnect or any other reason)
- create-game 
- join-game
- update-game
- leave game 
*/

/* 
server events
- game-update
- server-update
*/

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

    this.updateServerMembers();
  }

  playerJoinGame(game: Game, player: Player) {
    game.addPlayer(player);

    player.socket.on('update-game', (gameUpdate: PlayerGameUpdate) => {
      this.updateGame(player, game, gameUpdate);
    });

    player.socket.on('start-game', () => this.startGame(game));

    this.updateGamePlayers(game);
  }

  // TODO: ensure this is idempotent
  playerJoin(player: Player) {
    const playerAlreadyJoined = this.players.has(player.id);

    this.players.set(player.id, player);

    if (this.disconnectedPlayers.has(player.id)) {
      console.log(`${player.name} rejoined the server`);
    } else {
      console.log(`${player.name} joined the server`);
    }

    // TODO: check if they were disconnected
    // - remove them from disconnect map
    // - if they have an ongoing game then reconnect them to that game

    this.updateServerMembers();

    if (playerAlreadyJoined) {
      return;
    }

    player.socket.on('join-game', (gameId) => {
      const game = this.games.get(gameId);

      if (game) {
        this.playerJoinGame(game, player);
        this.updateServerMembers();
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
      this.players
        .get(playerId)
        .socket.emit(
          'game-update',
          this.makeServerGameUpdate(playerInfo, game)
        );
    });
  }

  updateGame(player: Player, game: Game, gameUpdate: PlayerGameUpdate) {
    const { ready, xWord, tileBar } = gameUpdate;
    const playerInfo = game.players.get(player.id);

    if (!playerInfo) {
      return;
    }

    const oldEmptyCount = countEmpty(game.xWord);
    const newEmptyCount = countEmpty(xWord);

    if (!sameXWord(game.solvedXWord, xWord)) {
      playerInfo.score -= oldEmptyCount;
      this.updateGamePlayers(game);
      return;
    }

    // TODO: check if game is over

    if (oldEmptyCount > newEmptyCount) {
      playerInfo.score += oldEmptyCount;
    }

    game.fillTileBar(tileBar);

    game.players.set(player.id, {
      ...playerInfo,
      ready,
      tileBar,
    });
    game.xWord = xWord;

    this.updateGamePlayers(game);
  }

  startGame(game: Game) {
    game.start();
    this.updateGamePlayers(game);
  }

  // TODO: ensure this is idempotent
  playerLeave(player: Player) {
    console.log(`${player.name} left the server`);

    this.disconnectedPlayers.set(player.id, player);
    this.players.delete(player.id);
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
      player.socket.emit('server-update', games);
    }
  }
}

export default GameManager;

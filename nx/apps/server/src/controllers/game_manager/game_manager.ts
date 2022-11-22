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

    this.players.set(player.id, {
      ...player,
      currentGameId: game.id,
    });

    player.socket.on('update-game', (gameUpdate: PlayerGameUpdate) => {
      this.updateGame(player, game, gameUpdate);
    });

    player.socket.on('start-game', () => this.startGame(game));

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
        this.playerJoinGame(game, player);
        this.updateGamePlayers(game);
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

    // check if game is over
    if (newEmptyCount === 0) {
      this.games.delete(game.id);
      this.updateServerMembers();
    }
  }

  startGame(game: Game) {
    game.start();
    this.updateGamePlayers(game);
  }

  // TODO: ensure this is idempotent
  playerLeave(playerId: string) {
    const playerInfo = this.players.get(playerId);
    if (!playerInfo) {
      return;
    }

    this.disconnectedPlayers.set(playerId, playerInfo);
    this.players.delete(playerId);

    console.log(`${playerInfo.name} left the server`);
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

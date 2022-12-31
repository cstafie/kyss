import { v4 as uuidv4 } from 'uuid';

import {
  BotDifficulty,
  ClientToGameEvent,
  ClientToGameEvents,
  countEmpty,
  GameMetaData,
  GameState,
  PlayerGameUpdate,
  PlayerInfo,
  sameXWord,
  SCORE_DECREASE,
  SCORE_INCREASE,
  ServerGameUpdate,
  Tile,
} from '@nx/api-interfaces';
import { getRandomXWord } from '../../utils';
import { Game } from '../game/game';
import User from '../user/user';
import Bot from '../bot/bot';
import Entity from '../entity/entity';
import { Socket } from 'socket.io';

export class GameManager extends Entity {
  bots: Map<string, Bot> = new Map();
  game: Game;

  constructor(gameName: string, player: User) {
    super();
    const randomXWord = getRandomXWord();
    this.game = new Game(gameName, player, randomXWord);

    // add the creator of the game to their own game
    this.userJoinGame(player);

    // if (withBot) {
    //   const bot = new Bot('x-🤖', BotDifficulty.medium);
    //   this.botJoinGame(game, bot);
    // }

    console.log(`${player.name} created a new game`);

    // this.updateGamePlayers(game);
    // this.updateServerMembers();
  }

  botJoinGame(game: Game, bot: Bot) {
    game.addPlayer(bot.id, bot.name, true);
    this.bots.set(bot.id, bot);
    bot.currentGameId = game.id;
  }

  handleEvent(
    userId: string,
    event: ClientToGameEvent<keyof ClientToGameEvents>
  ) {
    switch (event.type) {
      case 'playTile':
        return this.game.playTile({
          playerId: userId,
          ...(event as ClientToGameEvent<'playTile'>).data,
        });
      case 'updateTileBar':
        return event.data;
    }

    // user.socket.on('playTile', (tileId: string, pos: [number, number]) => {
    //   this.game.playTile(user.id, tileId, pos);
    //   // this.updateGame(user.id, game, gameUpdate);
    // });
    // user.socket.on('updateTileBar', (tileIds: Array<string>) => {
    //   this.game.updateTileBar(user.id, tileIds);
    // });
    // user.socket.on('setReady', (ready: boolean) => {
    //   this.game.setReady(user.id, ready);
    // });
    // user.socket.on('startGame', () => this.startGame());
    // user.socket.on('leaveGame', () => this.playerLeaveGame(user.id));
  }

  userJoinGame(user: User, wasDisconnected = false) {
    const canJoin =
      wasDisconnected || this.game.gameState === GameState.waitingToStart;

    if (!canJoin) {
      return;
    }

    this.game.addPlayer(user.id, user.name);

    user.socket.on(
      'clientToGameEvent',
      (event: ClientToGameEvent<keyof ClientToGameEvents>) =>
        this.handleEvent(user.id, event)
    );

    // this.updateGamePlayers(game);
  }

  // makeServerGameUpdate(playerInfo: PlayerInfo, game: Game): ServerGameUpdate {
  //   const { tileBar, score, ready } = playerInfo;

  //   const gameUpdate: ServerGameUpdate = {
  //     xWord: game.xWord,
  //     gameState: game.gameState,
  //     serializedPlayersMap: JSON.stringify(Array.from(game.players.entries())),
  //     ready,
  //     score,
  //     tileBar,
  //   };

  //   return gameUpdate;
  // }

  // updateGamePlayers(game: Game) {
  //   Array.from(game.players.entries()).forEach(([playerId, playerInfo]) => {
  //     const player = this.players.get(playerId);

  //     if (!player) {
  //       return;
  //     }

  //     player.socket.emit(
  //       'game-update',
  //       this.makeServerGameUpdate(playerInfo, game)
  //     );
  //   });
  // }

  // TODO: split this into playTile and setReady
  updateGame(playerId: string, game: Game, gameUpdate: PlayerGameUpdate) {
    const { ready, xWord, tileBar } = gameUpdate;
    const playerInfo = game.players.get(playerId);

    if (!playerInfo) {
      return;
    }

    const oldEmptyCount = countEmpty(game.xWord);
    const newEmptyCount = countEmpty(xWord);

    if (!sameXWord(game.solvedXWord, xWord)) {
      playerInfo.score += SCORE_DECREASE;
      // this.updateGamePlayers(game);
      return;
    }

    const tileCountDiff = oldEmptyCount - newEmptyCount;

    // we can only have no change, or at most 1
    if (!(tileCountDiff === 0 || tileCountDiff === 1)) {
      // this.updateGamePlayers(game);
      return;
    }

    // if they played a letter
    if (tileCountDiff === 1) {
      playerInfo.score += SCORE_INCREASE;

      game.xWord = xWord;

      // tilebar should only get filled if we played a letter
      playerInfo.tileBar = tileBar;
      game.fillPlayerTileBar(playerInfo.id);
      Array;
      // we give each tile a new id, so that duplicate ids don't mess up drag and drop
      game.xWord.grid.flat().forEach((tile) => (tile.id = uuidv4()));
    }

    game.players.set(playerId, {
      ...playerInfo,
      ready,
    });

    const isGameOver = newEmptyCount === 0;

    if (isGameOver) {
      game.gameState = GameState.complete;
    }

    // this.updateGamePlayers(game);

    // delete the game if it's over
    // if (isGameOver) {
    //   // TODO: any other cleanup?
    //   this.games.delete(game.id);
    //   this.updateServerMembers();
    // }
  }

  startGame() {
    this.game.start();
    // this.updateServerMembers();
    // this.updateGamePlayers(game);

    if (this.game.gameState === GameState.inProgress) {
      for (const playerId of this.game.players.keys()) {
        const bot = this.bots.get(playerId);

        bot?.start(this.game, this);
      }
    }
  }

  playerLeaveGame(playerId: string) {
    this.game.removePlayer(playerId);

    if (this.game.players.size === 0) {
      // this.games.delete(game.id);
    } else {
      // this.updateGamePlayers(game);
    }

    // this.updateServerMembers();
  }

  getMetaData() {
    const { id, name, createdAt, players, creatorId, creatorName, gameState } =
      this.game;

    return {
      id: id,
      name: name,
      createdAt: createdAt,
      numberOfPlayers: players.size,
      creatorId: creatorId,
      creatorName: creatorName,
      gameState: gameState,
    };
  }

  // updateServerMembers() {
  //   const gameValues = Array.from(this.games.values());

  //   const games: Array<GameMetaData> = gameValues.map((game) => ({
  //     id: game.id,
  //     name: game.name,
  //     createdAt: game.createdAt,
  //     numberOfPlayers: game.players.size,
  //     creatorId: game.creatorId,
  //     creatorName: game.creatorName,
  //     gameState: game.gameState,
  //   }));

  //   games.sort((gameA, gameB) => {
  //     return gameB.createdAt.getTime() - gameA.createdAt.getTime();
  //   });

  //   for (const player of this.players.values()) {
  //     player.socket.emit(
  //       'server-update',
  //       games.filter((game) => game.gameState === GameState.waitingToStart)
  //     );
  //   }
  // }
}

export default GameManager;

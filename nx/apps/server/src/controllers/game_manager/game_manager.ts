import {
  BotDifficulty,
  BotInfo,
  ClientToGameEvent,
  ClientToGameEvents,
  GameState,
  PlayerInfo,
  ServerGameUpdate,
} from '@nx/api-interfaces';
import { getRandomXWord } from '../../utils';
import { Game } from '../game/game';
import User from '../user/user';
import Bot from '../bot/bot';
import Entity from '../entity/entity';

export class GameManager extends Entity {
  bots: Map<string, Bot> = new Map();
  game: Game;
  updatePlayer: (id, update) => void;

  constructor(
    gameName: string,
    player: User,
    updatePlayer: (id, update) => void
  ) {
    super();
    const randomXWord = getRandomXWord();
    this.game = new Game(gameName, player, randomXWord);
    this.updatePlayer = updatePlayer;

    // add the creator of the game to their own game
    // this.userJoinGame(player);

    this.updateGamePlayers();

    console.log(`${player.name} created a new game`);
  }

  addBot() {
    const bot = new Bot(this.updateGamePlayers.bind(this));
    this.game.addPlayer(bot.id, bot.name, true);
    this.bots.set(bot.id, bot);
  }

  removeBot(botId: string) {
    this.game.removePlayer(botId);
    this.bots.delete(botId);
  }

  setBotDifficulty(botId: string, difficulty: BotDifficulty) {
    const bot = this.bots.get(botId);

    if (!bot) {
      return;
    }

    bot.difficulty = difficulty;
  }

  handleEvent(
    userId: string,
    event: ClientToGameEvent<keyof ClientToGameEvents>
  ) {
    const eventToHandlerMap = {
      playTile: () => {
        this.game.playTile({
          playerId: userId,
          ...(event as ClientToGameEvent<'playTile'>).data,
        });
      },
      updateTileBar: () => {
        const { tileIds } = (event as ClientToGameEvent<'updateTileBar'>).data;
        this.game.updateTileBar(userId, tileIds);
      },
      setReady: () => {
        const { ready } = (event as ClientToGameEvent<'setReady'>).data;
        this.game.setReady(userId, ready);
      },
      startGame: this.startGame.bind(this),
      addBot: this.addBot.bind(this),
      removeBot: () => {
        const { botId } = (event as ClientToGameEvent<'removeBot'>).data;
        this.removeBot(botId);
      },
      setBotDifficulty: () => {
        const { botId, difficulty } = (
          event as ClientToGameEvent<'setBotDifficulty'>
        ).data;
        this.setBotDifficulty(botId, difficulty);
      },
    };

    if (Object.prototype.hasOwnProperty.call(eventToHandlerMap, event.type)) {
      eventToHandlerMap[event.type]();
      this.updateGamePlayers();
    }
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
      (event: ClientToGameEvent<keyof ClientToGameEvents>) => {
        console.log('game manager: ', event.type);
        this.handleEvent(user.id, event);
      }
    );

    this.updateGamePlayers();
  }

  makeServerGameUpdate(playerInfo: PlayerInfo, game: Game): ServerGameUpdate {
    const { tileBar, score, ready } = playerInfo;

    const botInfos: Map<string, BotInfo> = new Map();
    for (const bot of this.bots.values()) {
      botInfos.set(bot.id, {
        id: bot.id,
        name: bot.name,
        difficulty: bot.difficulty,
      });
    }

    const gameUpdate: ServerGameUpdate = {
      xWord: game.xWord,
      gameState: game.gameState,
      serializedPlayersMap: JSON.stringify(Array.from(game.players.entries())),
      serializedBotsMap: JSON.stringify(Array.from(botInfos.entries())),
      ready,
      score,
      tileBar,
      gameCreatorId: game.creatorId,
    };

    return gameUpdate;
  }

  updateGamePlayers() {
    console.log(this.game.players);

    Array.from(this.game.players.entries()).forEach(
      ([playerId, playerInfo]) => {
        this.updatePlayer(
          playerId,
          this.makeServerGameUpdate(playerInfo, this.game)
        );
      }
    );
  }

  startGame() {
    // can only start games that are not started
    if (this.game.gameState !== GameState.waitingToStart) {
      return;
    }

    // return true if started successfully
    if (this.game.start()) {
      for (const bot of this.bots.values()) {
        console.log('starting bot');
        bot.start(this.game);
      }
    }
  }

  playerLeaveGame(playerId: string) {
    console.log('player leave game');

    this.game.removePlayer(playerId);

    if (this.game.players.size === 0) {
      // this.games.delete(game.id);
    } else {
      this.updateGamePlayers();
    }
  }

  getMetaData() {
    const { name, createdAt, players, creatorId, creatorName, gameState } =
      this.game;

    return {
      id: this.id,
      name: name,
      createdAt: createdAt,
      numberOfPlayers: players.size,
      creatorId: creatorId,
      creatorName: creatorName,
      gameState: gameState,
    };
  }

  onDestroy() {
    // destroy game bots
  }
}

export default GameManager;

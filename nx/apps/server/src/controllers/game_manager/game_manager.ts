import {
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
    this.userJoinGame(player);

    // if (withBot) {
    //   const bot = new Bot('x-🤖', BotDifficulty.medium);
    //   this.botJoinGame(game, bot);
    // }

    console.log(`${player.name} created a new game`);
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

  updateGamePlayers() {
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
    this.game.start();

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
}

export default GameManager;

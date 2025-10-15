import {
  BotDifficulty,
  BotInfo,
  GameState,
  PlayerInfo,
  ServerGameUpdate,
} from "shared";
import { getRandomXWord } from "../../utils";
import { Game } from "../game/game";
import User from "../user/user";
import Bot from "../bot/bot";
import Entity from "../entity/entity";

export class GameManager extends Entity {
  bots: Map<string, Bot> = new Map();
  game: Game;
  userUnsubscribes: Map<string, () => void> = new Map();
  userUpdates: Map<string, () => void> = new Map();

  constructor(gameName: string, user: User) {
    super();
    const randomXWord = getRandomXWord();
    this.game = new Game(gameName, user, randomXWord);

    // add the creator of the game to their own game
    this.userJoinGame(user);

    console.log(`${user.name} created a new game`);
  }

  private addBot() {
    const bot = new Bot(this.updateGameForAllPlayers.bind(this));
    this.game.addPlayer(bot.id, bot.name, true);
    this.bots.set(bot.id, bot);

    this.updateGameForAllPlayers();
  }

  private removeBot(botId: string) {
    this.game.removePlayer(botId);
    this.bots.delete(botId);

    this.updateGameForAllPlayers();
  }

  private setBotDifficulty(botInfo: { id: string; difficulty: BotDifficulty }) {
    const bot = this.bots.get(botInfo.id);

    if (!bot) {
      return;
    }

    bot.difficulty = botInfo.difficulty;
    this.updateGameForAllPlayers();
  }

  private playerSetup(user: User) {
    // setup socket listeners for the player
    const addBot = () => this.addBot();
    const removeBot = this.removeBot.bind(this);
    const setBotDifficulty = this.setBotDifficulty.bind(this);
    const startGame = this.startGame.bind(this);

    user.socket.on("addBot", addBot);
    user.socket.on("removeBot", removeBot);
    user.socket.on("setBotDifficulty", setBotDifficulty);
    user.socket.on("startGame", startGame);

    const playerUnsubscribe = () => {
      user.socket.off("addBot", addBot);
      user.socket.off("removeBot", removeBot);
      user.socket.off("setBotDifficulty", setBotDifficulty);
      user.socket.off("startGame", startGame);
    };
    this.userUnsubscribes.set(user.id, playerUnsubscribe);

    // setup game update emitter for the player
    this.userUpdates.set(user.id, () => {
      const playerInfo = this.game.players.get(user.id);
      if (!playerInfo) {
        return;
      }

      user.socket.emit(
        "updateGame",
        this.makeServerGameUpdate(playerInfo, this.game)
      );
    });
  }

  userJoinGame(user: User, wasDisconnected = false) {
    const canJoin =
      wasDisconnected || this.game.gameState === GameState.waitingToStart;

    if (!canJoin) {
      return;
    }

    this.game.addPlayer(user.id, user.name);
    this.playerSetup(user);

    this.updateGameForAllPlayers();
  }

  private makeServerGameUpdate(
    playerInfo: PlayerInfo,
    game: Game
  ): ServerGameUpdate {
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
      id: this.id,
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

  updateGameForAllPlayers() {
    const playerIds = Array.from(this.game.players.keys());

    playerIds.forEach((playerId) => {
      const updateFn = this.userUpdates.get(playerId);
      updateFn?.();
    });
  }

  private startGame() {
    // can only start games that are not started
    if (this.game.gameState !== GameState.waitingToStart) {
      return;
    }

    try {
      this.game.start();
    } catch (e) {
      console.error("game manager: failed to start game: ", e);
      return;
    }

    for (const bot of this.bots.values()) {
      bot.start(this.game);
    }

    this.updateGameForAllPlayers();
  }

  playerLeaveGame(playerId: string) {
    console.log("game manager: player leave game");

    const playerUnsubscribe = this.userUnsubscribes.get(playerId);

    if (playerUnsubscribe) {
      playerUnsubscribe();
      this.userUnsubscribes.delete(playerId);
    }

    this.game.removePlayer(playerId);

    this.updateGameForAllPlayers();
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
    Array.from(this.bots.values()).forEach((bot) => bot.onDestroy());
    this.bots.clear();
  }
}

export default GameManager;

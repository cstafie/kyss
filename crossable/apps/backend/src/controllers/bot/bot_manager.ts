import { BOT_DIFFICULTY, BotDifficulty } from "shared";
import { Game } from "../game/game";
import GameManager from "../game/game_manager";
import Bot from "./bot";

export class BotManager {
  public bots: Map<string, Bot> = new Map();
  gameManager: GameManager;

  constructor(gameManager: GameManager) {
    this.gameManager = gameManager;
  }

  public addBot() {
    const bot = new Bot({
      gameManager: this.gameManager,
    });
    this.bots.set(bot.id, bot);

    this.gameManager.updateGameForAllPlayers();
  }

  public removeBot(botId: string) {
    this.gameManager.playerLeaveGame(botId);
    this.bots.delete(botId);

    this.gameManager.updateGameForAllPlayers();
  }

  public setBotDifficulty(botInfo: {
    botId: string;
    difficulty: BotDifficulty;
  }) {
    const bot = this.bots.get(botInfo.botId);

    if (!bot) {
      return;
    }

    bot.difficulty = botInfo.difficulty;
    this.gameManager.updateGameForAllPlayers();
  }
}

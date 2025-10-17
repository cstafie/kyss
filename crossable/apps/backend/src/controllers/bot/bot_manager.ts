import { BotDifficulty, PlayerInfo } from "shared";
import GameManager from "../game/game_manager";
import Bot from "./bot";

export class BotManager {
  public bots: Map<string, Bot> = new Map();
  gameManager: GameManager;

  constructor(gameManager: GameManager) {
    this.gameManager = gameManager;
  }

  public getBotEntries(): Array<[string, Bot]> {
    return Array.from(this.bots.entries());
  }

  public addBot() {
    const bot = new Bot({
      gameManager: this.gameManager,
    });
    this.bots.set(bot.id, bot);

    this.gameManager.updateAllPlayers();
  }

  public removeBot(botId: string) {
    this.bots.delete(botId);
    this.gameManager.updateAllPlayers();
  }

  public setBotDifficulty(botInfo: {
    botId: string;
    difficulty: BotDifficulty;
  }) {
    const bot = this.bots.get(botInfo.botId);

    if (!bot) {
      throw new Error(
        "No bot found with the given ID to set the difficulty for."
      );
    }

    bot.difficulty = botInfo.difficulty;
    this.gameManager.updateAllPlayers();
  }

  public startTheBots() {
    for (const bot of this.bots.values()) {
      bot.start(this.gameManager.game);
    }
  }

  private killTheBots() {
    for (const bot of this.bots.values()) {
      bot.onDestroy();
    }

    this.bots.clear();
  }

  onDestroy() {
    this.killTheBots();
  }
}

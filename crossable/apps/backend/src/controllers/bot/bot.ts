import {
  BOT_DIFFICULTY,
  BotDifficulty,
  countEmpty,
  GameState,
  random,
  randomInRange,
} from "shared";

import Entity from "../entity/entity";
import { Game } from "../game/game";
import { type BotManager } from "./bot_manager";

class Bot extends Entity {
  name: string;
  difficulty: BotDifficulty;
  game?: Game;
  timeout?: NodeJS.Timeout;
  botManager: BotManager;

  constructor({
    botManager,
    botDifficulty = BOT_DIFFICULTY.MEDIUM,
  }: {
    botManager: BotManager;
    botDifficulty?: BotDifficulty;
  }) {
    super();
    this.name = `🤖-${crypto.randomUUID().substring(0, 4)}`;
    this.difficulty = botDifficulty;
    this.botManager = botManager;
  }

  start(game: Game) {
    this.game = game;
    this.playGame();
  }

  playGame() {
    if (!this.game) return;

    const difficultyTimeoutMap = {
      [BOT_DIFFICULTY.EASY]: 15,
      [BOT_DIFFICULTY.MEDIUM]: 10,
      [BOT_DIFFICULTY.HARD]: 5,
    };

    const difficultyErrorFrequencyMap = {
      [BOT_DIFFICULTY.EASY]: 3,
      [BOT_DIFFICULTY.MEDIUM]: 6,
      [BOT_DIFFICULTY.HARD]: 10,
    };

    const emptyCount = countEmpty(this.game.xWord);
    const timeoutTime =
      randomInRange(700, 1300) * difficultyTimeoutMap[this.difficulty] +
      emptyCount * 25; // the more empty tiles the slower we play

    // TODO: this is a hack because i have a bug with cleartimeout,
    // once that's fixed this if statement should not be necessary
    if (this.game.gameState === GameState.complete) {
      return;
    }

    this.timeout = setTimeout(() => {
      if (random(difficultyErrorFrequencyMap[this.difficulty]) === 0) {
        this.makeDumbMove();
      } else {
        this.makeMove();
      }

      this.botManager.updateAllPlayers();
      this.playGame();
    }, timeoutTime);
  }

  onDestroy() {
    clearTimeout(this.timeout);
  }

  // TODO: make these move functions dry
  makeDumbMove() {
    if (!this.game) return;

    const playerInfo = this.botManager.getPlayerInfo(this.id);

    if (!playerInfo) return;

    const { tileBar } = playerInfo;

    for (let i = 0; i < tileBar.length; i++) {
      const tile = tileBar[i];

      for (let row = 0; row < this.game.xWord.grid.length; row++) {
        for (let col = 0; col < this.game.xWord.grid[row].length; col++) {
          const played = this.game.xWord.grid[row][col];

          if (played.char === " ") {
            this.game.playTile({
              playerId: this.id,
              tileId: tile.id,
              pos: [row, col],
            });
            return;
          }
        }
      }
    }
  }

  makeMove() {
    if (!this.game) return;

    const playerInfo = this.botManager.getPlayerInfo(this.id);

    if (!playerInfo) return;

    const { tileBar } = playerInfo;

    for (let i = 0; i < tileBar.length; i++) {
      const tile = tileBar[i];

      for (let row = 0; row < this.game.xWord.grid.length; row++) {
        for (let col = 0; col < this.game.xWord.grid[row].length; col++) {
          const solved = this.game.solvedXWord.grid[row][col];
          const played = this.game.xWord.grid[row][col];

          if (solved.char === tile.char && played.char === " ") {
            this.game.playTile({
              playerId: this.id,
              tileId: tile.id,
              pos: [row, col],
            });
            return;
          }
        }
      }
    }
  }

  public toJSON(): { id: string; name: string; difficulty: BotDifficulty } {
    return {
      id: this.id,
      name: this.name,
      difficulty: this.difficulty,
    };
  }
}

export default Bot;

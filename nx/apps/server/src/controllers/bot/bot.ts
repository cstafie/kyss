import { v4 as uuidv4 } from 'uuid';

import {
  BotDifficulty,
  countEmpty,
  random,
  randomInRange,
} from '@nx/api-interfaces';

import Entity from '../entity/entity';
import { Game } from '../game/game';

class Bot extends Entity {
  name: string;
  difficulty: BotDifficulty;
  game?: Game;
  timeout: NodeJS.Timeout;
  updateGamePlayers: () => void;

  constructor(
    updateGamePlayers: () => void,
    difficulty: BotDifficulty = BotDifficulty.medium
  ) {
    super();
    this.name = `🤖-${uuidv4().substring(0, 4)}`;
    this.difficulty = difficulty;
    this.updateGamePlayers = updateGamePlayers;
  }

  start(game: Game) {
    this.game = game;
    this.playGame();
  }

  playGame() {
    const difficultyTimeoutMap = {
      [BotDifficulty.easy]: 15,
      [BotDifficulty.medium]: 10,
      [BotDifficulty.hard]: 5,
    };

    const difficultyErrorFrequencyMap = {
      [BotDifficulty.easy]: 3,
      [BotDifficulty.medium]: 6,
      [BotDifficulty.hard]: 10,
    };

    const emptyCount = countEmpty(this.game.xWord);
    const timeoutTime =
      randomInRange(700, 1300) * difficultyTimeoutMap[this.difficulty] +
      emptyCount * 25; // the more empty tiles the slower we play

    this.timeout = setTimeout(() => {
      if (random(difficultyErrorFrequencyMap[this.difficulty]) === 0) {
        this.makeDumbMove();
      } else {
        this.makeMove();
      }

      this.updateGamePlayers();
      this.playGame();
    }, timeoutTime);
  }

  onDestroy() {
    clearTimeout(this.timeout);
  }

  // TODO: make these move functions dry
  makeDumbMove() {
    const { tileBar } = this.game.players.get(this.id);

    for (let i = 0; i < tileBar.length; i++) {
      const tile = tileBar[i];

      for (let row = 0; row < this.game.xWord.grid.length; row++) {
        for (let col = 0; col < this.game.xWord.grid[row].length; col++) {
          const played = this.game.xWord.grid[row][col];

          if (played.char === ' ') {
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
    const { tileBar } = this.game.players.get(this.id);

    for (let i = 0; i < tileBar.length; i++) {
      const tile = tileBar[i];

      for (let row = 0; row < this.game.xWord.grid.length; row++) {
        for (let col = 0; col < this.game.xWord.grid[row].length; col++) {
          const solved = this.game.solvedXWord.grid[row][col];
          const played = this.game.xWord.grid[row][col];

          if (solved.char === tile.char && played.char === ' ') {
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
}

export default Bot;

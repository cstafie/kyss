import { BotDifficulty, random } from '@nx/api-interfaces';

import Entity from '../entity/entity';
import { Game } from '../game/game';
import GameManager from '../game_manager/game_manager';

import { cloneDeep } from 'lodash';

class Bot extends Entity {
  name: string;
  currentGameId: string;
  difficulty: BotDifficulty;
  game?: Game;
  gameManager: GameManager;

  constructor(name: string, difficulty: BotDifficulty, id?: string) {
    super(id);
    this.name = name;
    this.currentGameId = '';
    this.difficulty = difficulty;
  }

  start(game: Game, gameManager: GameManager) {
    this.game = game;
    this.gameManager = gameManager;

    // TODO: cleanup
    setInterval(() => {
      if (random(2) === 0) {
        this.makeMove();
      } else {
        this.makeDumbMove();
      }
    }, 5000);
  }

  makeDumbMove() {
    const { tileBar } = this.game.players.get(this.id);

    for (let i = 0; i < tileBar.length; i++) {
      const tile = tileBar[i];

      for (let row = 0; row < this.game.xWord.grid.length; row++) {
        for (let col = 0; col < this.game.xWord.grid[row].length; col++) {
          const played = this.game.xWord.grid[row][col];

          if (played.char === ' ') {
            const updatedXword = cloneDeep(this.game.xWord);

            updatedXword.grid[row][col] = tile;

            const updatedTileBar = cloneDeep(tileBar);
            updatedTileBar.splice(i, 1);

            this.gameManager.updateGame(this.id, this.game, {
              xWord: updatedXword,
              ready: true,
              tileBar: updatedTileBar,
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
            const updatedXword = cloneDeep(this.game.xWord);

            updatedXword.grid[row][col] = tile;

            const updatedTileBar = cloneDeep(tileBar);
            updatedTileBar.splice(i, 1);

            this.gameManager.updateGame(this.id, this.game, {
              xWord: updatedXword,
              ready: true,
              tileBar: updatedTileBar,
            });
            return;
          }
        }
      }
    }
  }
}

export default Bot;

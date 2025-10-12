"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const shared_1 = require("shared");
const entity_1 = __importDefault(require("../entity/entity"));
class Bot extends entity_1.default {
    constructor(updateGamePlayers, difficulty = shared_1.BOT_DIFFICULTY.MEDIUM) {
        super();
        this.name = `🤖-${crypto.randomUUID().substring(0, 4)}`;
        this.difficulty = difficulty;
        this.updateGamePlayers = updateGamePlayers;
    }
    start(game) {
        this.game = game;
        this.playGame();
    }
    playGame() {
        if (!this.game)
            return;
        const difficultyTimeoutMap = {
            [shared_1.BOT_DIFFICULTY.EASY]: 15,
            [shared_1.BOT_DIFFICULTY.MEDIUM]: 10,
            [shared_1.BOT_DIFFICULTY.HARD]: 5,
        };
        const difficultyErrorFrequencyMap = {
            [shared_1.BOT_DIFFICULTY.EASY]: 3,
            [shared_1.BOT_DIFFICULTY.MEDIUM]: 6,
            [shared_1.BOT_DIFFICULTY.HARD]: 10,
        };
        const emptyCount = (0, shared_1.countEmpty)(this.game.xWord);
        const timeoutTime = (0, shared_1.randomInRange)(700, 1300) * difficultyTimeoutMap[this.difficulty] +
            emptyCount * 25; // the more empty tiles the slower we play
        // TODO: this is a hack because i have a bug with cleartimeout,
        // once that's fixed this if statement should not be necessary
        if (this.game.gameState === shared_1.GameState.complete) {
            return;
        }
        this.timeout = setTimeout(() => {
            if ((0, shared_1.random)(difficultyErrorFrequencyMap[this.difficulty]) === 0) {
                this.makeDumbMove();
            }
            else {
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
        if (!this.game)
            return;
        const playerInfo = this.game.players.get(this.id);
        if (!playerInfo)
            return;
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
        if (!this.game)
            return;
        const playerInfo = this.game.players.get(this.id);
        if (!playerInfo)
            return;
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
}
exports.default = Bot;

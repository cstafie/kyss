"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const api_interfaces_1 = require("@nx/api-interfaces");
const entity_1 = __importDefault(require("../entity/entity"));
class Bot extends entity_1.default {
    constructor(updateGamePlayers, difficulty = api_interfaces_1.BotDifficulty.medium) {
        super();
        this.name = `🤖-${(0, uuid_1.v4)().substring(0, 4)}`;
        this.difficulty = difficulty;
        this.updateGamePlayers = updateGamePlayers;
    }
    start(game) {
        this.game = game;
        this.playGame();
    }
    playGame() {
        const difficultyTimeoutMap = {
            [api_interfaces_1.BotDifficulty.easy]: 15,
            [api_interfaces_1.BotDifficulty.medium]: 10,
            [api_interfaces_1.BotDifficulty.hard]: 5,
        };
        const difficultyErrorFrequencyMap = {
            [api_interfaces_1.BotDifficulty.easy]: 3,
            [api_interfaces_1.BotDifficulty.medium]: 6,
            [api_interfaces_1.BotDifficulty.hard]: 10,
        };
        const emptyCount = (0, api_interfaces_1.countEmpty)(this.game.xWord);
        const timeoutTime = (0, api_interfaces_1.randomInRange)(700, 1300) * difficultyTimeoutMap[this.difficulty] +
            emptyCount * 25; // the more empty tiles the slower we play
        // TODO: this is a hack because i have a bug with cleartimeout,
        // once that's fixed this if statement should not be necessary
        if (this.game.gameState === api_interfaces_1.GameState.complete) {
            return;
        }
        this.timeout = setTimeout(() => {
            if ((0, api_interfaces_1.random)(difficultyErrorFrequencyMap[this.difficulty]) === 0) {
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
exports.default = Bot;

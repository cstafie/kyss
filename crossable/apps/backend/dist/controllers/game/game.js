"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const api_interfaces_1 = require("@nx/api-interfaces");
const entity_1 = __importDefault(require("../entity/entity"));
const tile_manager_1 = require("./tile_manager");
class Game extends entity_1.default {
    constructor(name, player, xWord) {
        super();
        this.name = name;
        this.solvedXWord = xWord;
        this.xWord = {
            ...xWord,
            grid: (0, api_interfaces_1.emptyGrid)(xWord.grid),
        };
        this.players = new Map();
        // this.log = [];
        this.creatorId = player.id;
        this.creatorName = player.name;
        this.tileManager = new tile_manager_1.TileManager(xWord.grid.flat().filter((tile) => tile.char !== '#'));
        this.gameState = api_interfaces_1.GameState.waitingToStart;
    }
    start() {
        const players = Array.from(this.players.values());
        const allPlayersReady = players.every((player) => player.ready);
        if (allPlayersReady) {
            this.gameState = api_interfaces_1.GameState.inProgress;
            return true;
        }
        return false;
    }
    fillPlayerTileBar(playerId) {
        const player = this.players.get(playerId);
        if (this.tileManager.fillTileBar(player.tileBar)) {
            return;
        }
        // tile manager ran out of tiles
        // let's take a random tile we don't have from one of the unplayed tiles
        const unplayedChars = new Set();
        for (let row = 0; row < this.xWord.grid.length; row++) {
            for (let col = 0; col < this.xWord.grid[row].length; col++) {
                if (this.xWord.grid[row][col].char === ' ') {
                    unplayedChars.add(this.solvedXWord.grid[row][col].char);
                }
            }
        }
        while (player.tileBar.length < api_interfaces_1.TILE_BAR_SIZE) {
            const playerTileChars = new Set(player.tileBar.map((tile) => tile.char));
            const filteredChars = Array.from(unplayedChars).filter((char) => !playerTileChars.has(char));
            if (filteredChars.length === 0) {
                return;
            }
            const randomChar = (0, api_interfaces_1.get1Random)(filteredChars);
            // make a new tile with the same char
            player.tileBar.push((0, api_interfaces_1.charToTile)(randomChar));
        }
    }
    addPlayer(id, name, ready = false) {
        const existingPlayer = this.players.get(id);
        if (!existingPlayer) {
            this.players.set(id, {
                id,
                tileBar: [],
                score: 0,
                ready,
                name,
            });
            this.fillPlayerTileBar(id);
        }
    }
    removePlayer(playerId) {
        const playerInfo = this.players.get(playerId);
        if (!playerInfo) {
            return;
        }
        this.tileManager.emptyTileBar(playerInfo.tileBar);
        this.players.delete(playerId);
        const otherPlayers = Array.from(this.players.values());
        otherPlayers.sort((playerA, playerB) => playerA.tileBar.length - playerB.tileBar.length);
        otherPlayers.forEach((player) => this.fillPlayerTileBar(player.id));
    }
    updateTileBar(playerId, tileBarIds) {
        const playerInfo = this.players.get(playerId);
        if (!playerInfo || tileBarIds.length !== playerInfo.tileBar.length) {
            return;
        }
        const tileMap = playerInfo.tileBar.reduce((map, tile) => map.set(tile.id, tile), new Map());
        const newTileBar = [];
        for (const tileId of tileBarIds) {
            const tile = tileMap.get(tileId);
            if (!tile) {
                return;
            }
            newTileBar.push(tile);
        }
        playerInfo.tileBar = newTileBar;
    }
    playTile({ playerId, tileId, pos, }) {
        const [row, col] = pos;
        const playerInfo = this.players.get(playerId);
        // this might happen in a race condition
        if (!playerInfo || this.xWord.grid[row][col].char !== ' ') {
            return true;
        }
        const { tileBar } = playerInfo;
        const tileIndex = tileBar.findIndex((tile) => tile.id === tileId);
        // this should probably never happen
        if (tileIndex === -1) {
            return true;
        }
        const tile = tileBar[tileIndex];
        // -- incorrect play --
        if (this.solvedXWord.grid[row][col].char !== tile.char) {
            playerInfo.score += api_interfaces_1.SCORE_DECREASE;
            return false;
        }
        // -- correct play --
        // play the tile
        this.xWord.grid[row][col] = tile;
        // update player score
        playerInfo.score += api_interfaces_1.SCORE_INCREASE;
        // update tile bar
        tileBar.splice(tileIndex, 1);
        this.fillPlayerTileBar(playerId);
        // mark entries complete
        this.xWord.entries.forEach((entry) => {
            if ((0, api_interfaces_1.isEntryComplete)(this.xWord, entry)) {
                entry.isComplete = true;
            }
        });
        this.checkGameOver();
        return true;
    }
    checkGameOver() {
        const numEmptyTiles = (0, api_interfaces_1.countEmpty)(this.xWord);
        const isGameOver = numEmptyTiles === 0;
        if (isGameOver) {
            this.gameState = api_interfaces_1.GameState.complete;
        }
    }
    setReady(playerId, ready) {
        const playerInfo = this.players.get(playerId);
        if (!playerInfo) {
            return;
        }
        playerInfo.ready = ready;
    }
}
exports.Game = Game;

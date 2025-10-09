"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TileManager = void 0;
const lodash_1 = require("lodash");
const api_interfaces_1 = require("@nx/api-interfaces");
class TileManager {
    constructor(tiles) {
        this.originalTiles = tiles;
        this.tiles = (0, lodash_1.cloneDeep)(tiles);
    }
    fillTileBar(tileBar) {
        while (tileBar.length < api_interfaces_1.TILE_BAR_SIZE) {
            if (!this.addTile(tileBar)) {
                return false;
            }
        }
        return true;
    }
    addTile(tileBar) {
        const charSet = new Set(tileBar.map((tile) => tile.char));
        const filteredTiles = this.tiles.filter((tile) => !charSet.has(tile.char));
        // if there are no filtered tiles we use this.tiles
        const tileArray = filteredTiles.length ? filteredTiles : this.tiles;
        if (tileArray.length === 0) {
            return false;
        }
        const randomTile = (0, api_interfaces_1.get1Random)(tileArray);
        const tileIndex = this.tiles.findIndex((tile) => tile === randomTile);
        this.tiles.splice(tileIndex, 1);
        tileBar.push(randomTile);
        return true;
    }
    emptyTileBar(tileBar) {
        while (tileBar.length > 0) {
            this.tiles.push(tileBar.pop());
        }
    }
}
exports.TileManager = TileManager;

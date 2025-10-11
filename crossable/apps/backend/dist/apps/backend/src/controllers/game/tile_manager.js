"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TileManager = void 0;
const lodash_1 = require("lodash");
const shared_1 = require("shared");
class TileManager {
    constructor(tiles) {
        this.originalTiles = tiles;
        this.tiles = (0, lodash_1.cloneDeep)(tiles);
    }
    // TODO: look at this boolean passed throughout the call chain, it's ugly,
    // maybe throw instead and catch at a higher level
    fillTileBar(tileBar) {
        while (tileBar.length < shared_1.TILE_BAR_SIZE) {
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
        const randomTile = (0, shared_1.get1Random)(tileArray);
        const tileIndex = this.tiles.findIndex((tile) => tile === randomTile);
        this.tiles.splice(tileIndex, 1);
        tileBar.push(randomTile);
        return true;
    }
    emptyTileBar(tileBar) {
        this.tiles.push(...tileBar);
        tileBar.length = 0;
    }
}
exports.TileManager = TileManager;

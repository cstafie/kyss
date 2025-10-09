import { cloneDeep } from 'lodash';

import { get1Random, Tile, TILE_BAR_SIZE } from '@nx/api-interfaces';

export class TileManager {
  originalTiles: Array<Tile>;
  tiles: Array<Tile>;

  constructor(tiles: Array<Tile>) {
    this.originalTiles = tiles;
    this.tiles = cloneDeep(tiles);
  }

  fillTileBar(tileBar: Array<Tile>): boolean {
    while (tileBar.length < TILE_BAR_SIZE) {
      if (!this.addTile(tileBar)) {
        return false;
      }
    }

    return true;
  }

  addTile(tileBar: Array<Tile>): boolean {
    const charSet = new Set(tileBar.map((tile) => tile.char));

    const filteredTiles = this.tiles.filter((tile) => !charSet.has(tile.char));

    // if there are no filtered tiles we use this.tiles
    const tileArray = filteredTiles.length ? filteredTiles : this.tiles;

    if (tileArray.length === 0) {
      return false;
    }

    const randomTile = get1Random(tileArray);
    const tileIndex = this.tiles.findIndex((tile) => tile === randomTile);
    this.tiles.splice(tileIndex, 1);

    tileBar.push(randomTile);

    return true;
  }

  emptyTileBar(tileBar: Array<Tile>) {
    while (tileBar.length > 0) {
      this.tiles.push(tileBar.pop());
    }
  }
}

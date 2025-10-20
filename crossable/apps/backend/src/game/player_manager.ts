import { PlayerInfo } from "shared";
import GameManager from "./game_manager";

type GamePlayer = PlayerInfo & {
  unsubscribe: () => void;
  update: () => void;
};

export class PlayerManager {
  private players: Map<string, GamePlayer> = new Map();
  private gameManager: GameManager;

  constructor(gameManager: GameManager) {
    this.gameManager = gameManager;
  }

  // used by both us and the game manager
  public updateAllPlayers() {
    this.players.forEach(({ name, update, ready }) => {
      console.log("player manager: updating player:", name, ready);
      update?.();
    });
  }

  public getPlayerEntries(): Array<[string, PlayerInfo]> {
    return Array.from(this.players.entries());
  }

  public getPlayerValues(): Array<PlayerInfo> {
    return Array.from(this.players.values());
  }

  public addPlayer(playerInfo: PlayerInfo) {
    this.players.set(playerInfo.id, {
      ...playerInfo,
      unsubscribe: () => console.log("no unsubscribe set"),
      update: () => console.log("no update set"),
    });
  }

  public updatePlayer({
    playerId,
    playerInfo,
  }: {
    playerId: string;
    playerInfo: PlayerInfo;
  }) {
    const gamePlayer = this.players.get(playerId);

    if (gamePlayer) {
      this.players.set(playerId, {
        ...gamePlayer,
        ...playerInfo,
      });
    }
  }

  public getPlayerInfo(playerId: string): PlayerInfo {
    const player = this.players.get(playerId);

    if (!player) {
      throw new Error("Player not found");
    }
    return player;
  }

  public setUnsubscribe(playerId: string, unsubscribe: () => void) {
    const player = this.players.get(playerId);
    if (player) {
      player.unsubscribe = unsubscribe;
    }
  }

  public setUpdate(playerId: string, update: () => void) {
    const player = this.players.get(playerId);
    if (player) {
      player.update = update;
    }
  }

  public setReady({ playerId, ready }: { playerId: string; ready: boolean }) {
    const playerInfo = this.getPlayerInfo(playerId);
    playerInfo.ready = ready;
    this.updateAllPlayers();
  }

  public updateTileBar({
    playerId,
    tileIds,
  }: {
    playerId: string;
    tileIds: Array<string>;
  }) {
    this.gameManager.game.updateTileBar({
      playerId: playerId,
      tileBarIds: tileIds,
    });
    this.updateAllPlayers();
  }

  public playTile(params: {
    playerId: string;
    tileId: string;
    pos: [number, number];
  }) {
    this.gameManager.game.playTile(params);
    this.updateAllPlayers();
  }

  public playerLeaveGame(playerId: string) {
    console.log("game manager: player leave game");

    const playerUnsubscribe = this.players.get(playerId)?.unsubscribe;

    if (playerUnsubscribe) {
      playerUnsubscribe();
    }

    this.gameManager.game.removePlayer(playerId);
    this.players.delete(playerId);

    this.updateAllPlayers();
  }

  public deletePlayer(playerId: string) {
    this.players.delete(playerId);
  }

  public getPlayerCount(): number {
    return this.players.size;
  }

  public onDestroy() {
    console.log("player manager: on destroy called");
    this.players.forEach(({ unsubscribe }) => {
      unsubscribe();
    });
    this.players.clear();
  }

  public toJSON(): Array<[string, PlayerInfo]> {
    return this.getPlayerEntries();
  }
}

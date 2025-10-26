import { PlayerInfo } from "shared";
import GameManager from "./game_manager";

type GamePlayer = PlayerInfo & {
  unsubscribe: null | (() => void);
  update: null | (() => void);
};

export class PlayerManager {
  private players: Map<string, GamePlayer> = new Map();
  private gameManager: GameManager;

  constructor(gameManager: GameManager) {
    this.gameManager = gameManager;
  }

  // used by both us and the game manager
  public updateAllPlayers() {
    this.players.forEach(({ update }) => {
      update?.();
    });
  }

  public getPlayerEntries(): Array<[string, PlayerInfo]> {
    return Array.from(this.players.entries());
  }

  public getPlayerValues(): Array<PlayerInfo> {
    return Array.from(this.players.values());
  }

  public addPlayer(playerInfo: Partial<GamePlayer>) {
    if (!playerInfo.id || !playerInfo.name) {
      throw new Error("Player ID and name are required to add a player.");
    }

    this.players.set(playerInfo.id, {
      id: playerInfo.id,
      name: playerInfo.name,
      tileBar: [],
      score: 0,
      ready: false,
      unsubscribe: null,
      update: null,
      ...playerInfo,
    });
  }

  public updatePlayer({
    playerId,
    gamePlayer,
  }: {
    playerId: string;
    gamePlayer: GamePlayer;
  }) {
    const existingPlayer = this.getPlayerInfo(playerId);

    if (gamePlayer) {
      this.players.set(playerId, {
        ...existingPlayer,
        ...gamePlayer,
      });
    }
  }

  public getPlayerInfo(playerId: string): GamePlayer {
    const player = this.players.get(playerId);

    if (!player) {
      throw new Error("Player not found");
    }

    return player;
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
    this.gameManager.updateTileBar({
      playerId,
      tileBarIds: tileIds,
    });
    this.updateAllPlayers();
  }

  public playTile(params: {
    playerId: string;
    tileId: string;
    pos: [number, number];
  }) {
    this.gameManager.playTile(params);
    this.updateAllPlayers();
  }

  public playerLeaveGame(playerId: string) {
    try {
      this.getPlayerInfo(playerId).unsubscribe?.();
      this.players.delete(playerId);
    } catch (error) {
      console.error("player manager: error leaving game:", error);
    }

    this.updateAllPlayers();
  }

  public deletePlayer(playerId: string) {
    this.players.delete(playerId);
  }

  public getPlayerCount(): number {
    return this.players.size;
  }

  public onDestroy() {
    this.players.forEach(({ unsubscribe }) => {
      unsubscribe?.();
    });
    this.players.clear();
  }

  public toJSON(): Array<[string, PlayerInfo]> {
    return this.getPlayerEntries();
  }
}

import { PlayerInfo } from "shared";
import Entity from "../entity/entity";
import GameManager from "./game_manager";

type GamePlayer = PlayerInfo & {
  unsubscribe: () => void;
  update: () => void;
};

export class PlayerManager extends Entity {
  public players: Map<string, GamePlayer> = new Map();
  private gameManager: GameManager;

  constructor(gameManager: GameManager) {
    super();
    this.gameManager = gameManager;
  }

  // used by both us and the game manager
  public updateAllPlayers() {
    this.players.forEach(({ update }) => update?.());
  }

  public setReady({ userId, ready }: { userId: string; ready: boolean }) {
    const playerInfo = this.players.get(userId);
    if (!playerInfo) {
      return;
    }

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

    this.updateAllPlayers();
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
}

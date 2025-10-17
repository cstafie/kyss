import { PlayerInfo, GameState, InGameClientToServerEvents } from "shared";
import Entity from "../entity/entity";
import User from "../user/user";
import GameManager from "./game_manager";

type GamePlayer = PlayerInfo & {
  unsubscribe: () => void;
  update: () => void;
};

export class PlayerManager extends Entity {
  players: Map<string, GamePlayer> = new Map();
  gameManager: GameManager;

  constructor(gameManager: GameManager) {
    super();
    this.gameManager = gameManager;
  }

  private setReady({ userId, ready }: { userId: string; ready: boolean }) {
    const playerInfo = this.players.get(userId);
    if (!playerInfo) {
      return;
    }

    playerInfo.ready = ready;
    this.gameManager.updateGameForAllPlayers();
  }

  public userJoinGame(user: User, wasDisconnected = false) {
    const canJoin =
      wasDisconnected || this.game.gameState === GameState.waitingToStart;

    if (!canJoin) {
      return;
    }

    this.game.addPlayer({ id: user.id, name: user.name });
    this.playerSetup(user);

    this.updateGameForAllPlayers();
  }

  private playerSetup(user: User) {
    console.log("game manager: setting up player:", user.name);

    type SocketHandlers = {
      [K in keyof InGameClientToServerEvents]: (
        ...args: Parameters<InGameClientToServerEvents[K]>
      ) => void;
    };

    // Define all handlers and userId when needed
    const handlers: SocketHandlers = {
      playTile: (tileInfo: { tileId: string; pos: [number, number] }) =>
        this.gameManager.playTile({ playerId: user.id, ...tileInfo }),
      updateTileBar: (tileIds: Array<string>) =>
        this.updateTileBar({ playerId: user.id, tileIds }),
      setReady: (ready: boolean) => this.setReady({ userId: user.id, ready }),
      addBot: () => this.botManager.addBot(),
      removeBot: () => this.botManager.removeBot(user.id),
      setBotDifficulty: (params) => this.botManager.setBotDifficulty(params),
      startGame: () => this.startGame(),
      leaveGame: () => {
        this.playerLeaveGame(user.id);
      },
    };

    const eventNames = Object.keys(handlers) as Array<
      keyof InGameClientToServerEvents
    >;

    // Register all handlers
    eventNames.forEach((event) => {
      user.socket.on(event, handlers[event]);
    });

    const playerUnsubscribe = () => {
      eventNames.forEach((event) => {
        user.socket.off(event, handlers[event]);
      });
    };

    this.userUnsubscribes.set(user.id, playerUnsubscribe);

    // setup game update emitter for the player
    this.userUpdates.set(user.id, () => {
      const playerInfo = this.game.players.get(user.id);
      if (!playerInfo) {
        return;
      }

      user.socket.emit(
        "updateGame",
        this.makeServerGameUpdate(playerInfo, this.game)
      );
    });
  }

  public updateAllPlayers() {
    this.players.forEach(({ update }) => update?.());
  }
}

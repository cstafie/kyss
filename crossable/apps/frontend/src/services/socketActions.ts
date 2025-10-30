import type { Socket } from "socket.io-client";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  BotDifficulty,
} from "shared";

type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

const GAME_NAME_LENGTH = 6;

export class SocketActions {
  private socket: GameSocket | null;
  constructor(socket: GameSocket | null) {
    this.socket = socket;
  }

  private ensureConnected(): GameSocket {
    if (!this.socket) {
      throw new Error("Socket not connected");
    }
    return this.socket;
  }

  createGame(): string {
    const socket = this.ensureConnected();
    const gameName = `game-${crypto
      .randomUUID()
      .substring(0, GAME_NAME_LENGTH)}`;
    socket.emit("newGame", gameName);
    return gameName;
  }

  joinGame(gameId: string): void {
    if (!gameId?.trim()) {
      throw new Error("Invalid game ID");
    }
    const socket = this.ensureConnected();
    socket.emit("joinGame", gameId);
  }

  startGame(): void {
    const socket = this.ensureConnected();
    socket.emit("startGame");
  }

  joinServer(userInfo: { name: string }): void {
    const socket = this.ensureConnected();
    socket.emit("joinServer", userInfo);
  }

  addBot(): void {
    const socket = this.ensureConnected();
    socket.emit("addBot");
  }

  removeBot(botId: string): void {
    if (!botId) {
      throw new Error("Invalid bot ID");
    }
    const socket = this.ensureConnected();
    socket.emit("removeBot", botId);
  }

  setBotDifficulty(botId: string, difficulty: BotDifficulty): void {
    if (!botId) {
      throw new Error("Invalid bot ID");
    }
    const socket = this.ensureConnected();
    socket.emit("setBotDifficulty", { botId, difficulty });
  }

  playTile(tileId: string, pos: [number, number]): void {
    if (!tileId) {
      throw new Error("Invalid tile ID");
    }
    const socket = this.ensureConnected();
    socket.emit("playTile", { tileId, pos });
  }

  leaveGame(): void {
    const socket = this.ensureConnected();
    socket.emit("leaveGame");
  }

  updateTileBar(tileIds: string[]): void {
    const socket = this.ensureConnected();
    socket.emit("updateTileBar", tileIds);
  }

  setReady(ready: boolean): void {
    const socket = this.ensureConnected();
    socket.emit("setReady", ready);
  }
}

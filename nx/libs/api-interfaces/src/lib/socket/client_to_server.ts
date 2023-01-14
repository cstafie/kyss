import { BotDifficulty } from '../api-interfaces';

export interface SocketClientToServerEvents {
  clientToServerEvent: (
    event: ClientToServerEvent<keyof ClientToServerEvents>
  ) => void;
  clientToGameEvent: (
    event: ClientToGameEvent<keyof ClientToGameEvents>
  ) => void;
}

export interface ClientToServerEvent<T extends keyof ClientToServerEvents> {
  type: T;
  data: ClientToServerEvents[T];
}

export interface ClientToGameEvent<T extends keyof ClientToGameEvents> {
  type: T;
  data: ClientToGameEvents[T];
}

export interface ClientToServerEvents {
  newGame: { name: string };
  joinServer: { id: string; name: string };
  joinGame: { gameId: string };
  leaveGame: null;
}

export interface ClientToGameEvents {
  startGame: null;
  playTile: { tileId: string; pos: [number, number] };
  updateTileBar: { tileIds: Array<string> };
  setReady: { ready: boolean };
  addBot: null;
  removeBot: { botId: string };
  setBotDifficulty: { botId: string; difficulty: BotDifficulty };
}

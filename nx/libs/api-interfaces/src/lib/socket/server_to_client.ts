import { GameMetaData, ServerGameUpdate } from '../api-interfaces';

export interface SocketServerToClientEvents {
  serverToClientEvent: (
    event: ServerToClientEvent<keyof ServerToClientEvents>
  ) => void;
}

export interface ServerToClientEvent<T extends keyof ServerToClientEvents> {
  type: T;
  data: ServerToClientEvents[T];
}

export interface ServerToClientEvents {
  updateGame: { gameUpdate: ServerGameUpdate };
  updateGamesList: { games: Array<GameMetaData> };

  //   noArg: () => void;
  //   basicEmit: (a: number, b: string, c: Buffer) => void;
  //   withAck: (d: string, callback: (e: number) => void) => void;
}

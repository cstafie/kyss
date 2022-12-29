import { GameMetaData, ServerGameUpdate, Tile } from '../api-interfaces';

export interface ServerToClientEvents {
  updateGame: (gameUpdate: ServerGameUpdate) => void;
  updateGamesList: (games: Array<GameMetaData>) => void;

  //   noArg: () => void;
  //   basicEmit: (a: number, b: string, c: Buffer) => void;
  //   withAck: (d: string, callback: (e: number) => void) => void;
}

// TODO: separate these event types
// use keyof etc

export interface ClientToServerEvents {
  // server manager
  newGame: (name: string) => void;
  joinServer: ({ id, name }: { id: string; name: string }) => void;
  joinGame: (gameId: string) => void;
  leaveGame: () => void;

  // game manager
  startGame: () => void;
  playTile: (tileId: string, pos: [number, number]) => void;
  updateTileBar: (tileIds: Array<string>) => void;
  setReady: (ready: boolean) => void;
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// export interface SocketServerToClientEvents {
//   serverToClientEvent: (
//     event: ServerToClientEvent<keyof ServerToClientEvents>
//   ) => void;
//   gameToClientEvent: (
//     event: GameToClientEvent<keyof GameToClientEvents>
//   ) => void;
// }
// export interface GameToClientEvent<T extends keyof GameToClientEvents> {
//   type: T;
//   data: GameToClientEvents[T];
// }
// export interface GameToClientEvents {
//   incorrectTilePlayed: {
//     pos: [number, number];
//   };
//   updateGame: { gameUpdate: ServerGameUpdate };
// }
// export interface ServerToClientEvent<T extends keyof ServerToClientEvents> {
//   type: T;
//   data: ServerToClientEvents[T];
// }
// export interface ServerToClientEvents {
//   updateGamesList: { games: Array<GameMetaData> };
//   //   noArg: () => void;
//   //   basicEmit: (a: number, b: string, c: Buffer) => void;
//   //   withAck: (d: string, callback: (e: number) => void) => void;
// }

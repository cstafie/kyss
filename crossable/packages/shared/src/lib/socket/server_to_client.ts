import { GameMetaData, ServerGameUpdate } from "../api-interfaces";

export interface ServerToClientEvents {
  updateGamesList: (games: Array<GameMetaData>) => void;
  incorrectTilePlayed: (pos: [number, number]) => void;
  updateGame: (gameUpdate: ServerGameUpdate) => void;
  updateUser: (userInfo: { id: string; name: string }) => void;
}

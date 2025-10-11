import { BotDifficulty } from "../api-interfaces";
export interface ClientToServerEvents {
    newGame: (name: string) => void;
    joinServer: (id: string, name: string) => void;
    joinGame: (gameId: string) => void;
    leaveGame: () => void;
    startGame: () => void;
    playTile: (tileId: string, pos: [number, number]) => void;
    updateTileBar: (tileIds: Array<string>) => void;
    setReady: (ready: boolean) => void;
    addBot: () => void;
    removeBot: (botId: string) => void;
    setBotDifficulty: (botId: string, difficulty: BotDifficulty) => void;
}

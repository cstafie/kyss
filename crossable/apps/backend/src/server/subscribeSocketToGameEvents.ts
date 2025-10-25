import { InGameClientToServerEvents } from "shared";
import GameManager from "../game/game_manager";
import { PlayerManager } from "../game/player_manager";
import { BotManager } from "../bot/bot_manager";
import User from "../user/user";

// Subscribe a user's socket to game events and return update and unsubscribe functions

export function subscribeUserToGameEvents(
  user: User,
  gameManager: GameManager,
  playerManager: PlayerManager,
  botManager: BotManager
): [updatePlayer: () => void, unsubscribePlayer: () => void] {
  type SocketHandlers = {
    [K in keyof InGameClientToServerEvents]: (
      ...args: Parameters<InGameClientToServerEvents[K]>
    ) => void;
  };

  // Define all handlers and userId when needed
  const handlers: SocketHandlers = {
    playTile: (tileInfo: { tileId: string; pos: [number, number] }) =>
      playerManager.playTile({ playerId: user.id, ...tileInfo }),
    updateTileBar: (tileIds: Array<string>) =>
      playerManager.updateTileBar({ playerId: user.id, tileIds }),
    setReady: (ready: boolean) =>
      playerManager.setReady({ playerId: user.id, ready }),
    addBot: () => botManager.addBot(),
    removeBot: (botId: string) => botManager.removeBot(botId),
    setBotDifficulty: (params) => botManager.setBotDifficulty(params),
    startGame: () => gameManager.startGame(),
    leaveGame: () => playerManager.playerLeaveGame(user.id),
  };

  const eventNames = Object.keys(handlers) as Array<
    keyof InGameClientToServerEvents
  >;

  // Register all handlers
  eventNames.forEach((event) => {
    user.socket.on(event, handlers[event]);
  });

  const unsubscribePlayer = () => {
    eventNames.forEach((event) => {
      user.socket.off(event, handlers[event]);
    });
  };

  // setup game update emitter for the player
  const updatePlayer = () => {
    user.socket.emit("updateGame", gameManager.makeServerGameUpdate(user.id));
  };

  return [updatePlayer, unsubscribePlayer];
}

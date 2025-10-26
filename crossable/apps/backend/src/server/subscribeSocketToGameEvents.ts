import { InGameClientToServerEvents } from "shared";
import GameManager from "../game/game_manager";
import { PlayerManager } from "../game/player_manager";
import { BotManager } from "../bot/bot_manager";
import { ServerSocket } from "../types";

export default function subscribeSocketToGameEvents(
  socket: ServerSocket,
  gameManager: GameManager,
  playerManager: PlayerManager,
  botManager: BotManager
): [updatePlayer: () => void, unsubscribePlayer: () => void] {
  type SocketHandlers = {
    [K in keyof InGameClientToServerEvents]: (
      ...args: Parameters<InGameClientToServerEvents[K]>
    ) => void;
  };

  const handlers: SocketHandlers = {
    playTile: (tileInfo: { tileId: string; pos: [number, number] }) => {
      try {
        playerManager.playTile({ playerId: socket.id, ...tileInfo });
      } catch (error) {
        console.error(
          `failed to play tile for user ${socket.id} because: ${error}`
        );
      }
    },
    updateTileBar: (tileIds: Array<string>) => {
      try {
        playerManager.updateTileBar({ playerId: socket.id, tileIds });
      } catch (error) {
        console.error(
          `failed to update tile bar for user ${socket.id} because: ${error}`
        );
      }
    },
    setReady: (ready: boolean) => {
      try {
        playerManager.setReady({ playerId: socket.id, ready });
      } catch (error) {
        console.error(
          `failed to set ready state for user ${socket.id} because: ${error}`
        );
      }
    },
    addBot: () => {
      try {
        botManager.addBot();
      } catch (error) {
        console.error(`failed to add bot because: ${error}`);
      }
    },
    removeBot: (botId: string) => {
      try {
        botManager.removeBot(botId);
      } catch (error) {
        console.error(`failed to remove bot because: ${error}`);
      }
    },
    setBotDifficulty: (params) => {
      try {
        botManager.setBotDifficulty(params);
      } catch (error) {
        console.error(`failed to set bot difficulty because: ${error}`);
      }
    },
    startGame: () => {
      try {
        gameManager.startGame();
      } catch (error) {
        console.error(`failed to start game because: ${error}`);
      }
    },
  };

  const eventNames = Object.keys(handlers) as Array<
    keyof InGameClientToServerEvents
  >;

  const unsubscribeSocket = () => {
    eventNames.forEach((event) => {
      socket.off(event, handlers[event]);
    });
  };

  // Register all handlers
  eventNames.forEach((event) => {
    socket.on(event, handlers[event]);
  });

  // setup game update emitter for the player
  const updatePlayer = () => {
    socket.emit("updateGame", gameManager.makeServerGameUpdate(socket.id));
  };

  return [updatePlayer, unsubscribeSocket];
}

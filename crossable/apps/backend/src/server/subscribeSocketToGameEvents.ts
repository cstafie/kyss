import { InGameClientToServerEvents } from "shared";
import GameManager from "../game/game_manager";
import { PlayerManager } from "../game/player_manager";
import { BotManager } from "../bot/bot_manager";
import { ServerUser } from "../types";

interface SubscribeSocketToGameEventsReturn {
  updatePlayer: () => void;
  unsubscribeSocket: () => void;
  incorrectTilePlayed: (tilePos: [number, number]) => void;
}

export default function subscribeSocketToGameEvents(
  user: ServerUser,
  gameManager: GameManager,
  playerManager: PlayerManager,
  botManager: BotManager
): SubscribeSocketToGameEventsReturn {
  type SocketHandlers = {
    [K in keyof InGameClientToServerEvents]: (
      ...args: Parameters<InGameClientToServerEvents[K]>
    ) => void;
  };

  const handlers: SocketHandlers = {
    playTile: (tileInfo: { tileId: string; pos: [number, number] }) => {
      try {
        playerManager.playTile({ playerId: user.sessionId, ...tileInfo });
      } catch (error) {
        console.error(
          `failed to play tile for user ${user.sessionId} because: ${error}`
        );
      }
    },
    updateTileBar: (tileIds: Array<string>) => {
      try {
        playerManager.updateTileBar({ playerId: user.sessionId, tileIds });
      } catch (error) {
        console.error(
          `failed to update tile bar for user ${user.sessionId} because: ${error}`
        );
      }
    },
    setReady: (ready: boolean) => {
      try {
        playerManager.setReady({ playerId: user.sessionId, ready });
      } catch (error) {
        console.error(
          `failed to set ready state for user ${user.sessionId} because: ${error}`
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
      user.socket.off(event, handlers[event]);
    });
  };

  // Register all handlers
  eventNames.forEach((event) => {
    user.socket.on(event, handlers[event]);
  });

  // setup game update emitter for the player
  const updatePlayer = () => {
    user.socket.emit(
      "updateGame",
      gameManager.makeServerGameUpdate(user.sessionId)
    );
  };

  const incorrectTilePlayed = (tilePos: [number, number]) => {
    user.socket.emit("incorrectTilePlayed", tilePos);
  };

  return {
    updatePlayer,
    unsubscribeSocket,
    incorrectTilePlayed,
  };
}

import {
  BotDifficulty,
  BotInfo,
  ClientToServerEvents,
  GameState,
  PlayerInfo,
  ServerGameUpdate,
} from "shared";
import { getRandomXWord } from "../../utils";
import { Game } from "../game/game";
import User from "../user/user";
import Bot from "../bot/bot";
import Entity from "../entity/entity";
import { InGameClientToServerEvents } from "shared";

export class GameManager extends Entity {
  bots: Map<string, Bot> = new Map();
  game: Game;
  userUnsubscribes: Map<string, () => void> = new Map();
  userUpdates: Map<string, () => void> = new Map();

  constructor(gameName: string, user: User) {
    super();
    const randomXWord = getRandomXWord();
    this.game = new Game({ name: gameName, player: user, xWord: randomXWord });

    // add the creator of the game to their own game
    this.userJoinGame(user);

    console.log(`${user.name} created a new game`);
  }

  private addBot() {
    const bot = new Bot(this.updateGameForAllPlayers.bind(this));
    this.game.addPlayer({ id: bot.id, name: bot.name });
    this.bots.set(bot.id, bot);

    this.updateGameForAllPlayers();
  }

  private removeBot(botId: string) {
    this.game.removePlayer(botId);
    this.bots.delete(botId);

    this.updateGameForAllPlayers();
  }

  private setBotDifficulty(botInfo: {
    botId: string;
    difficulty: BotDifficulty;
  }) {
    const bot = this.bots.get(botInfo.botId);

    if (!bot) {
      return;
    }

    bot.difficulty = botInfo.difficulty;
    this.updateGameForAllPlayers();
  }

  private setReady({ userId, ready }: { userId: string; ready: boolean }) {
    const playerInfo = this.game.players.get(userId);
    if (!playerInfo) {
      return;
    }

    playerInfo.ready = ready;
    this.updateGameForAllPlayers();
  }

  private playTile(params: {
    playerId: string;
    tileId: string;
    pos: [number, number];
  }) {
    this.game.playTile(params);
    this.updateGameForAllPlayers();
  }

  private updateTileBar({
    playerId,
    tileIds,
  }: {
    playerId: string;
    tileIds: Array<string>;
  }) {
    this.game.updateTileBar({ playerId: playerId, tileBarIds: tileIds });
    this.updateGameForAllPlayers();
  }

  private playerSetup(user: User) {
    console.log("game manager: setting up player:", user.name);

    type SocketHandlers = {
      [K in keyof InGameClientToServerEvents]: (
        ...args: Parameters<InGameClientToServerEvents[K]>
      ) => void;
    };

    // Define all handlers and userId when needed
    const handlers: SocketHandlers = {
      playTile: (tileInfo: { tileId: string; pos: [number, number] }) =>
        this.playTile({ playerId: user.id, ...tileInfo }),
      updateTileBar: (tileIds: Array<string>) =>
        this.updateTileBar({ playerId: user.id, tileIds }),
      setReady: (ready: boolean) => this.setReady({ userId: user.id, ready }),
      addBot: () => this.addBot(),
      removeBot: this.removeBot.bind(this),
      setBotDifficulty: (params) => this.setBotDifficulty(params),
      startGame: () => this.startGame(),
      leaveGame: () => {
        this.playerLeaveGame(user.id);
      },
    };

    const eventNames = Object.keys(handlers) as Array<
      keyof InGameClientToServerEvents
    >;

    // Register all handlers
    eventNames.forEach((event) => {
      user.socket.on(event, handlers[event]);
    });

    const playerUnsubscribe = () => {
      eventNames.forEach((event) => {
        user.socket.off(event, handlers[event]);
      });
    };

    this.userUnsubscribes.set(user.id, playerUnsubscribe);

    // setup game update emitter for the player
    this.userUpdates.set(user.id, () => {
      const playerInfo = this.game.players.get(user.id);
      if (!playerInfo) {
        return;
      }

      user.socket.emit(
        "updateGame",
        this.makeServerGameUpdate(playerInfo, this.game)
      );
    });
  }

  userJoinGame(user: User, wasDisconnected = false) {
    const canJoin =
      wasDisconnected || this.game.gameState === GameState.waitingToStart;

    if (!canJoin) {
      return;
    }

    this.game.addPlayer({ id: user.id, name: user.name });
    this.playerSetup(user);

    this.updateGameForAllPlayers();
  }

  private makeServerGameUpdate(
    playerInfo: PlayerInfo,
    game: Game
  ): ServerGameUpdate {
    const { tileBar, score, ready } = playerInfo;

    const botInfos: Map<string, BotInfo> = new Map();
    for (const bot of this.bots.values()) {
      botInfos.set(bot.id, {
        id: bot.id,
        name: bot.name,
        difficulty: bot.difficulty,
      });
    }

    const gameUpdate: ServerGameUpdate = {
      id: this.id,
      xWord: game.xWord,
      gameState: game.gameState,
      serializedPlayersMap: JSON.stringify(Array.from(game.players.entries())),
      serializedBotsMap: JSON.stringify(Array.from(botInfos.entries())),
      ready,
      score,
      tileBar,
      gameCreatorId: game.creatorId,
    };

    return gameUpdate;
  }

  updateGameForAllPlayers() {
    const playerIds = Array.from(this.game.players.keys());

    playerIds.forEach((playerId) => {
      const updateFn = this.userUpdates.get(playerId);
      updateFn?.();
    });
  }

  private startGame() {
    // can only start games that are not started
    if (this.game.gameState !== GameState.waitingToStart) {
      return;
    }

    try {
      this.game.start();
    } catch (e) {
      console.error("game manager: failed to start game: ", e);
      return;
    }

    for (const bot of this.bots.values()) {
      bot.start(this.game);
    }

    this.updateGameForAllPlayers();
  }

  playerLeaveGame(playerId: string) {
    console.log("game manager: player leave game");

    const playerUnsubscribe = this.userUnsubscribes.get(playerId);

    if (playerUnsubscribe) {
      playerUnsubscribe();
      this.userUnsubscribes.delete(playerId);
    }

    this.game.removePlayer(playerId);

    this.updateGameForAllPlayers();
  }

  getMetaData() {
    const { name, createdAt, players, creatorId, creatorName, gameState } =
      this.game;

    return {
      id: this.id,
      name: name,
      createdAt: createdAt,
      numberOfPlayers: players.size,
      creatorId: creatorId,
      creatorName: creatorName,
      gameState: gameState,
    };
  }

  onDestroy() {
    Array.from(this.bots.values()).forEach((bot) => bot.onDestroy());
    this.bots.clear();
  }
}

export default GameManager;

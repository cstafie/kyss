import {
  BotInfo,
  GameState,
  PlayerInfo,
  ServerGameUpdate,
  InGameClientToServerEvents,
} from "shared";
import { getRandomXWord } from "../../utils";
import { Game } from "../game/game";
import User from "../user/user";
import Entity from "../entity/entity";
import { BotManager } from "../bot/bot_manager";
import { PlayerManager } from "./player_manager";

export class GameManager extends Entity {
  private botManager: BotManager;
  public game: Game;
  private playerManager: PlayerManager;

  constructor(gameName: string, user: User) {
    super();

    const randomXWord = getRandomXWord();
    this.playerManager = new PlayerManager(this);
    this.botManager = new BotManager(this);

    this.game = new Game({
      name: gameName,
      player: user,
      xWord: randomXWord,
      playerManager: this.playerManager,
    });

    this.userJoinGame(user);

    console.log(`${user.name} created a new game`);
  }

  public userJoinGame(user: User, wasDisconnected = false) {
    const inProgress = this.game.gameState === GameState.inProgress;

    if (inProgress && !wasDisconnected) {
      throw new Error("Cannot join a game in progress");
    }

    // Have the game creator join the game
    this.game.addPlayer({ id: user.id, name: user.name });
    this.setupPlayerSocketHandlers(user);
    this.updateAllPlayers();
  }

  public setupPlayerSocketHandlers(user: User) {
    console.log("game manager: setting up player:", user.name);

    type SocketHandlers = {
      [K in keyof InGameClientToServerEvents]: (
        ...args: Parameters<InGameClientToServerEvents[K]>
      ) => void;
    };

    // Define all handlers and userId when needed
    const handlers: SocketHandlers = {
      playTile: (tileInfo: { tileId: string; pos: [number, number] }) =>
        this.playerManager.playTile({ playerId: user.id, ...tileInfo }),
      updateTileBar: (tileIds: Array<string>) =>
        this.playerManager.updateTileBar({ playerId: user.id, tileIds }),
      setReady: (ready: boolean) =>
        this.playerManager.setReady({ playerId: user.id, ready }),
      addBot: () => this.botManager.addBot(),
      removeBot: () => this.botManager.removeBot(user.id),
      setBotDifficulty: (params) => this.botManager.setBotDifficulty(params),
      startGame: () => this.startGame(),
      // leaveGame: () => this.playerManager.playerLeaveGame(user.id),
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
      const playerInfo = this.playerManager.getPlayerInfo(user.id);
      if (!playerInfo) {
        return;
      }

      user.socket.emit(
        "updateGame",
        this.makeServerGameUpdate(playerInfo, this.game)
      );
    };

    this.playerManager.setUnsubscribe(user.id, unsubscribePlayer);
    this.playerManager.setUpdate(user.id, updatePlayer);
  }

  public startGame() {
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

    this.botManager.startTheBots();
    this.updateAllPlayers();
  }

  public makeServerGameUpdate(
    playerInfo: PlayerInfo,
    game: Game
  ): ServerGameUpdate {
    const { tileBar, score, ready } = playerInfo;

    const botInfos: Map<string, BotInfo> = new Map();

    for (const bot of this.botManager.bots.values()) {
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
      serializedPlayersMap: JSON.stringify(this.playerManager.toJSON()),
      serializedBotsMap: JSON.stringify(this.botManager.toJSON()),
      ready,
      score,
      tileBar,
      gameCreatorId: game.creatorId,
    };

    return gameUpdate;
  }

  getMetaData() {
    const { name, createdAt, creatorId, creatorName, gameState } = this.game;

    return {
      id: this.id,
      name: name,
      createdAt: createdAt,
      numberOfPlayers: this.playerManager.getPlayerCount(),
      creatorId: creatorId,
      creatorName: creatorName,
      gameState: gameState,
    };
  }

  // NOTE:
  // These last functions are just delegates to other managers.
  // The idea is for the player_manager, bot_manager and server_manager
  // not to know about each other,
  // but only about the game manager, which coordinates between them.

  public updateAllPlayers() {
    this.playerManager.updateAllPlayers();
  }

  public playerLeaveGame(playerId: string) {
    this.playerManager.playerLeaveGame(playerId);
  }

  public getPlayerInfo(playerId: string): PlayerInfo {
    return this.playerManager.getPlayerInfo(playerId);
  }

  public getPlayerCount(): number {
    return this.playerManager.getPlayerCount();
  }

  public getPlayerValues(): Array<PlayerInfo> {
    return this.playerManager.getPlayerValues();
  }

  public addPlayer(playerInfo: { id: string; name: string; ready?: boolean }) {
    this.game.addPlayer(playerInfo);
  }

  onDestroy() {
    this.botManager.onDestroy();
    this.playerManager.onDestroy();
  }
}

export default GameManager;

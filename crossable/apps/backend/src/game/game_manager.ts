import { BotInfo, GameState, PlayerInfo, ServerGameUpdate } from "shared";
import { getRandomXWord } from "../utils";
import { Game } from "../game/game";
import User from "../user/user";
import { BotManager } from "../bot/bot_manager";
import { PlayerManager } from "./player_manager";
import { subscribeUserToGameEvents } from "../server/subscribeSocketToGameEvents";

interface GameManagerParams {
  gameName: string;
  creator: User;
  destroyTimeoutCallback: NodeJS.Timeout;
}

export class GameManager {
  public id = crypto.randomUUID();
  public game: Game;
  private botManager: BotManager;
  private playerManager: PlayerManager;
  private destroyTimeoutCallback: NodeJS.Timeout;

  constructor({
    gameName,
    creator,
    destroyTimeoutCallback,
  }: GameManagerParams) {
    const randomXWord = getRandomXWord();
    this.playerManager = new PlayerManager(this);
    this.botManager = new BotManager(this);
    this.destroyTimeoutCallback = destroyTimeoutCallback;

    this.game = new Game({
      name: gameName,
      player: creator,
      xWord: randomXWord,
      playerManager: this.playerManager,
    });

    this.userJoinGame(creator);

    console.log(`${creator.name} created a new game`);
  }

  public userJoinGame(user: User, wasDisconnected = false) {
    const inProgress = this.game.gameState === GameState.inProgress;

    if (inProgress && !wasDisconnected) {
      throw new Error("Cannot join a game in progress");
    }

    // Have the game creator join the game
    this.game.addPlayer({ id: user.id, name: user.name });
    this.setupPlayer(user);
    this.updateAllPlayers();
  }

  private setupPlayer(user: User) {
    console.log("game manager: setting up player:", user.name);

    const [updatePlayer, unsubscribePlayer] = subscribeUserToGameEvents(
      user,
      this,
      this.playerManager,
      this.botManager
    );

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

  public makeServerGameUpdate(userId: string): ServerGameUpdate {
    const playerInfo = this.playerManager.getPlayerInfo(userId);

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
      xWord: this.game.xWord,
      gameState: this.game.gameState,
      serializedPlayersMap: JSON.stringify(this.playerManager.toJSON()),
      serializedBotsMap: JSON.stringify(this.botManager.toJSON()),
      ready,
      score,
      tileBar,
      gameCreatorId: this.game.creatorId,
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
    clearTimeout(this.destroyTimeoutCallback);
    this.botManager.onDestroy();
    this.playerManager.onDestroy();
  }
}

export default GameManager;

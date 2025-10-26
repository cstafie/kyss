import { BotInfo, GameState, PlayerInfo, ServerGameUpdate } from "shared";
import { getRandomXWord } from "../utils";
import { Game } from "../game/game";
import { BotManager } from "../bot/bot_manager";
import { PlayerManager } from "./player_manager";
import subscribeSocketToGameEvents from "../server/subscribeSocketToGameEvents";
import { ServerUser } from "../types";

interface GameManagerParams {
  gameName: string;
  creator: ServerUser;
  destroyGame: (gameId: string) => void;
}

export class GameManager {
  public id = crypto.randomUUID();
  private game: Game;
  private botManager: BotManager;
  private playerManager: PlayerManager;
  private destroyTimeoutCallback: NodeJS.Timeout | null = null;

  constructor({ gameName, creator, destroyGame }: GameManagerParams) {
    const randomXWord = getRandomXWord();
    this.playerManager = new PlayerManager(this);
    this.botManager = new BotManager(this);

    // let the server manager destroy the game after 30min
    this.destroyTimeoutCallback = setTimeout(() => {
      destroyGame(this.id);
    }, 30 * 60 * 1000);

    this.game = new Game({
      name: gameName,
      player: creator,
      xWord: randomXWord,
      playerManager: this.playerManager,
    });
  }

  public getGame(): Game {
    return this.game;
  }

  public userJoinGame(user: ServerUser, wasDisconnected = false) {
    const inProgress = this.game.gameState === GameState.inProgress;

    if (inProgress && !wasDisconnected) {
      throw new Error("Cannot join a game in progress");
    }

    this.addPlayerFromUser(user);
    this.updateAllPlayers();
  }

  public addPlayerFromUser(user: ServerUser) {
    const [updatePlayer, unsubscribeSocket] = subscribeSocketToGameEvents(
      user.socket,
      this,
      this.playerManager,
      this.botManager
    );

    this.playerManager.addPlayer({
      id: user.socket.id,
      name: user.name,
      ready: false,
      update: updatePlayer,
      unsubscribe: unsubscribeSocket,
    });
  }

  public addPlayerFromBot(bot: BotInfo) {
    this.playerManager.addPlayer({
      id: bot.id,
      name: bot.name,
      ready: true,
    });
  }

  public updateTileBar({
    playerId,
    tileBarIds,
  }: {
    playerId: string;
    tileBarIds: Array<string>;
  }) {
    this.game.updateTileBar({
      playerId,
      tileBarIds,
    });
  }

  public playTile(params: {
    playerId: string;
    tileId: string;
    pos: [number, number];
  }) {
    this.game.playTile(params);
  }

  public startGame() {
    // can only start games that are not started
    if (this.game.gameState !== GameState.waitingToStart) {
      throw new Error("Game already started");
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

    // const botInfos: Map<string, BotInfo> = new Map();

    // for (const bot of this.botManager.bots.values()) {
    //   botInfos.set(bot.id, {
    //     id: bot.id,
    //     name: bot.name,
    //     difficulty: bot.difficulty,
    //   });
    // }

    return {
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

  public playerLeaveGame(playerId: string) {
    this.game.removePlayer(playerId);
  }

  public updateAllPlayers() {
    this.playerManager.updateAllPlayers();
  }

  public getPlayerInfo(playerId: string): PlayerInfo {
    return this.playerManager.getPlayerInfo(playerId);
  }

  public getPlayerCount(): number {
    return this.playerManager.getPlayerCount() - this.botManager.getBotCount();
  }

  public getPlayerValues(): Array<PlayerInfo> {
    return this.playerManager.getPlayerValues();
  }

  public getGameState(): GameState {
    return this.game.gameState;
  }

  onDestroy() {
    this.destroyTimeoutCallback && clearTimeout(this.destroyTimeoutCallback);
    this.botManager.onDestroy();
    this.playerManager.onDestroy();
  }
}

export default GameManager;

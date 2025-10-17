import { BotInfo, GameState, PlayerInfo, ServerGameUpdate } from "shared";
import { getRandomXWord } from "../../utils";
import { Game } from "../game/game";
import User from "../user/user";
import Entity from "../entity/entity";
import { BotManager } from "../bot/bot_manager";
import { PlayerManager } from "./player_manager";

export class GameManager extends Entity {
  botManager: BotManager;
  game: Game;
  playerManager: PlayerManager;

  constructor(gameName: string, user: User) {
    super();

    const randomXWord = getRandomXWord();
    this.game = new Game({ name: gameName, player: user, xWord: randomXWord });
    this.botManager = new BotManager(this);
    this.playerManager = new PlayerManager(this);

    // Have the game creator join the game
    this.playerManager.userJoinGame(user);

    console.log(`${user.name} created a new game`);
  }

  public playTile(params: {
    playerId: string;
    tileId: string;
    pos: [number, number];
  }) {
    this.game.playTile(params);
    this.updateGameForAllPlayers();
  }

  public updateTileBar({
    playerId,
    tileIds,
  }: {
    playerId: string;
    tileIds: Array<string>;
  }) {
    this.game.updateTileBar({ playerId: playerId, tileBarIds: tileIds });
    this.updateGameForAllPlayers();
  }

  private makeServerGameUpdate(
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
    this.userUpdates.forEach((updateFn) => updateFn?.());
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

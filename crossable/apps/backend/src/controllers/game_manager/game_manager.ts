import {
  BotDifficulty,
  BotInfo,
  GameState,
  PlayerInfo,
  ServerGameUpdate,
} from "shared";
import { getRandomXWord } from "../../utils";
import { Game } from "../game/game";
import User from "../user/user";
import Bot from "../bot/bot";
import Entity from "../entity/entity";

export class GameManager extends Entity {
  bots: Map<string, Bot> = new Map();
  game: Game;
  userUnsubscribes: Map<string, () => void> = new Map();
  userUpdates: Map<string, () => void> = new Map();

  constructor(
    gameName: string,
    user: User
    // updatePlayer: (id: string) => void
  ) {
    super();
    const randomXWord = getRandomXWord();
    this.game = new Game(gameName, user, randomXWord);
    // this.updatePlayer = updatePlayer;

    // add the creator of the game to their own game
    this.userJoinGame(user);

    this.updateGameForAllPlayers();

    console.log(`${user.name} created a new game`);
  }

  addBot() {
    const bot = new Bot(this.updateGameForAllPlayers.bind(this));
    this.game.addPlayer(bot.id, bot.name, true);
    this.bots.set(bot.id, bot);
  }

  removeBot(botId: string) {
    this.game.removePlayer(botId);
    this.bots.delete(botId);
  }

  setBotDifficulty(botId: string, difficulty: BotDifficulty) {
    const bot = this.bots.get(botId);

    if (!bot) {
      return;
    }

    bot.difficulty = difficulty;
  }

  // handleEvent(
  //   userId: string,
  //   event: ClientToGameEvent<keyof ClientToGameEvents>
  // ) {
  //   const eventToHandlerMap = {
  //     playTile: () => {
  //       const eventData = (event as ClientToGameEvent<"playTile">).data;
  //       const playTileSuccess = this.game.playTile({
  //         playerId: userId,
  //         ...eventData,
  //       });

  //       if (playTileSuccess) {
  //         return;
  //       }

  //       this.updatePlayer(userId, {
  //         type: "incorrectTilePlayed",
  //         data: {
  //           pos: eventData.pos,
  //         },
  //       });
  //     },
  //     updateTileBar: () => {
  //       const { tileIds } = (event as ClientToGameEvent<"updateTileBar">).data;
  //       this.game.updateTileBar(userId, tileIds);
  //     },
  //     setReady: () => {
  //       const { ready } = (event as ClientToGameEvent<"setReady">).data;
  //       this.game.setReady(userId, ready);
  //     },
  //     startGame: this.startGame.bind(this),
  //     addBot: this.addBot.bind(this),
  //     removeBot: () => {
  //       const { botId } = (event as ClientToGameEvent<"removeBot">).data;
  //       this.removeBot(botId);
  //     },
  //     setBotDifficulty: () => {
  //       const { botId, difficulty } = (
  //         event as ClientToGameEvent<"setBotDifficulty">
  //       ).data;
  //       this.setBotDifficulty(botId, difficulty);
  //     },
  //   };

  //   if (Object.prototype.hasOwnProperty.call(eventToHandlerMap, event.type)) {
  //     eventToHandlerMap[event.type]();
  //     this.updateGameForAllPlayers();
  //   }
  // }

  private subscribeToPlayerEvents(user: User) {
    const addBot = this.addBot.bind(this);
    const removeBot = this.removeBot.bind(this);
    const setBotDifficulty = this.setBotDifficulty.bind(this);
    const startGame = this.startGame.bind(this);

    user.socket.on("addBot", addBot);
    user.socket.on("removeBot", removeBot);
    user.socket.on("setBotDifficulty", setBotDifficulty);
    user.socket.on("startGame", startGame);

    const playerUnsubscribe = () => {
      user.socket.off("addBot", addBot);
      user.socket.off("removeBot", removeBot);
      user.socket.off("setBotDifficulty", setBotDifficulty);
      user.socket.off("startGame", startGame);
    };
    this.userUnsubscribes.set(user.id, playerUnsubscribe);
  }

  private subscribePlayerToGameUpdates(playerId: string, user: User) {


  userJoinGame(user: User, wasDisconnected = false) {
    const canJoin =
      wasDisconnected || this.game.gameState === GameState.waitingToStart;

    if (!canJoin) {
      return;
    }

    this.game.addPlayer(user.id, user.name);
    this.subscribeToPlayerEvents(user);
    this.subscribePlayerToGameUpdates(user.id, user);

    // const eventHandler = (
    //   event: ClientToGameEvent<keyof ClientToGameEvents>
    // ) => {
    //   console.log("game manager: ", event.type);
    //   this.handleEvent(user.id, event);
    // };

    // user.socket.off("clientToGameEvent", eventHandler);
    // user.socket.on("clientToGameEvent", eventHandler);

    this.updateGameForAllPlayers();
  }

  makeServerGameUpdate(playerInfo: PlayerInfo, game: Game): ServerGameUpdate {
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
    Array.from(this.game.players.entries()).forEach(
      ([playerId, playerInfo]) => {
        console.log("game manager: updating: ", playerInfo.name);



        this.updatePlayer(playerId, {
          type: "updateGame",
          data: {
            gameUpdate: this.makeServerGameUpdate(playerInfo, this.game),
          },
        });
      }
    );
  }

  startGame() {
    // can only start games that are not started
    if (this.game.gameState !== GameState.waitingToStart) {
      return;
    }

    // game.start returns true if started successfully
    if (this.game.start()) {
      for (const bot of this.bots.values()) {
        bot.start(this.game);
      }
    }
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

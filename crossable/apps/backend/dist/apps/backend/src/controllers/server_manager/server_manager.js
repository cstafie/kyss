"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const shared_1 = require("shared");
const game_manager_1 = __importDefault(require("../game_manager/game_manager"));
const user_1 = __importDefault(require("../user/user"));
class ServerManager {
    constructor() {
        this.users = new Map();
        this.games = new Map();
    }
    tryGetUserGame(user) {
        if (user.currentGameId) {
            const game = this.games.get(user.currentGameId);
            if (game) {
                return game;
            }
            // if the game corresponding to user.currentGameId doesn't exist
            // the user's currentGameId is invalid and should be cleared
            user.currentGameId = "";
        }
        console.log("server manager: user has no current game id");
    }
    tryRejoinGame(user) {
        const game = this.tryGetUserGame(user);
        game?.userJoinGame(user, true);
    }
    newGame(gameName, creator) {
        // the Game Manager will automatically add the creator to the game
        const game = new game_manager_1.default(gameName, creator);
        this.games.set(game.id, game);
        creator.currentGameId = game.id;
        // games get destroyed after 30min
        const gameId = game.id;
        setTimeout(() => {
            this.destroyGame(gameId);
        }, 30 * 60 * 1000);
    }
    joinGame(gameId, user) {
        const game = this.games.get(gameId);
        if (game) {
            game.userJoinGame(user);
            user.currentGameId = gameId;
        }
    }
    leaveGame(user) {
        const game = this.tryGetUserGame(user);
        if (!game) {
            console.log("server manager: could not find game to leave");
            return;
        }
        game.playerLeaveGame(user.id);
        this.resetAndRejoinUser(user);
        // destroy the game if it has no players left
        if (game.game.players.size - game.bots.size === 0) {
            this.destroyGame(game.id);
        }
    }
    disconnect(user) {
        console.log("server manager: disconnect: ", user.name);
        // TODO: handle game disconnect nicely?
        // should maybe clean up the socket listeners here
        // const game = this.tryGetUserGame(user);
        // game?.playerDisconnect(user.id);
    }
    joinServer({ id, name, socket }) {
        const user = this.users.get(id) || new user_1.default({ id, name, socket });
        user.name = name;
        user.socket = socket;
        // TODO: if we store users by socket.id instead we could potentially treat joinServer event
        // as we do all other events
        this.users.set(user.id, user);
        // hard socket reset as we are about to resubscribe to all relevant events
        socket.removeAllListeners();
        this.tryRejoinGame(user);
        this.updateGamesList();
        socket.on("newGame", (name) => {
            this.newGame(name, user);
            this.updateGamesList();
        });
        socket.on("joinGame", (gameId) => {
            this.joinGame(gameId, user);
            this.updateGamesList();
        });
        socket.on("leaveGame", () => {
            this.leaveGame(user);
            this.updateGamesList();
        });
        const disconnectHandler = () => {
            this.disconnect(user);
            this.updateGamesList();
        };
        socket.on("disconnect", disconnectHandler);
        console.log(`${name} joined server`);
    }
    updateGamesList() {
        const gamesList = [];
        for (const game of this.games.values()) {
            const gameMetaData = game.getMetaData();
            if (gameMetaData.gameState === shared_1.GameState.waitingToStart) {
                gamesList.push(gameMetaData);
            }
        }
        gamesList.sort((gameA, gameB) => {
            return gameB.createdAt.getTime() - gameA.createdAt.getTime();
        });
        const event = {
            type: "updateGamesList",
            data: {
                games: gamesList,
            },
        };
        // TODO: this is a bit inefficient, maybe we should have a set of connected user ids
        for (const user of this.users.values()) {
            if (user.socket.connected) {
                user.socket.emit("serverToClientEvent", event);
            }
        }
    }
    destroyGame(gameId) {
        const game = this.games.get(gameId);
        if (!game) {
            console.log("could not find game to destroy");
            return;
        }
        Array.from(game.game.players.values()).forEach((player) => {
            const user = this.users.get(player.id);
            if (!user) {
                return;
            }
            this.resetAndRejoinUser(user);
        });
        game.onDestroy();
        this.games.delete(gameId);
        this.updateGamesList();
    }
    resetAndRejoinUser(user) {
        user.currentGameId = "";
        user.socket.offAny();
        this.joinServer(user);
    }
    onSocketConnect(socket) {
        console.log(`user connected with socket id: ${socket.id}`);
        socket.on("joinServer", (id, name) => {
            this.joinServer({ id, name, socket });
        });
    }
}
const serverManager = new ServerManager();
exports.default = serverManager;

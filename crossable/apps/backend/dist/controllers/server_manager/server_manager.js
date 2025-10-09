"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_interfaces_1 = require("@nx/api-interfaces");
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
            user.currentGameId = '';
        }
        console.log('server manager: user has no current game id');
    }
    tryRejoinGame(user) {
        const game = this.tryGetUserGame(user);
        game?.userJoinGame(user, true);
    }
    newGame(gameName, creator) {
        // the Game Manager will automatically add the creator to the game
        const game = new game_manager_1.default(gameName, creator, this.emitGameToClientEvent.bind(this));
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
            console.log('server manager: could not find game to leave');
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
        console.log('server manager: disconnect: ', user.name);
        // TODO: handle game disconnect nicely?
        // should maybe clean up the socket listeners here
        // const game = this.tryGetUserGame(user);
        // game?.playerDisconnect(user.id);
    }
    handleEvent(user, event) {
        // TODO: this almost looks like we could do `this[event.type](user, event);`
        const eventToHandlerMap = {
            newGame: () => {
                const { name } = event.data;
                this.newGame(name, user);
            },
            joinGame: () => {
                const { gameId } = event.data;
                this.joinGame(gameId, user);
            },
            leaveGame: () => {
                this.leaveGame(user);
            },
        };
        if (Object.prototype.hasOwnProperty.call(eventToHandlerMap, event.type)) {
            eventToHandlerMap[event.type]();
            this.updateGamesList();
        }
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
        socket.on('clientToServerEvent', (event) => {
            console.log('server manager: ', event.type);
            this.handleEvent(user, event);
        });
        const disconnectHandler = () => {
            this.disconnect(user);
            this.updateGamesList();
        };
        socket.on('disconnect', disconnectHandler);
        console.log(`${name} joined server`);
    }
    updateGamesList() {
        const gamesList = [];
        for (const game of this.games.values()) {
            const gameMetaData = game.getMetaData();
            if (gameMetaData.gameState === api_interfaces_1.GameState.waitingToStart) {
                gamesList.push(gameMetaData);
            }
        }
        gamesList.sort((gameA, gameB) => {
            return gameB.createdAt.getTime() - gameA.createdAt.getTime();
        });
        const event = {
            type: 'updateGamesList',
            data: {
                games: gamesList,
            },
        };
        // TODO: this is a bit inefficient, maybe we should have a set of connected user ids
        for (const user of this.users.values()) {
            if (user.socket.connected) {
                user.socket.emit('serverToClientEvent', event);
            }
        }
    }
    emitGameToClientEvent(userId, event) {
        const user = this.users.get(userId);
        if (!user || !user.socket.connected) {
            return;
        }
        user.socket.emit('gameToClientEvent', event);
        // destroy game if it's over
        // TODO: this should be done explicitly instead of checking every event
        if (event.type === 'updateGame') {
            const { gameUpdate } = event.data;
            if (gameUpdate.gameState === api_interfaces_1.GameState.complete) {
                this.destroyGame(gameUpdate.id);
            }
        }
    }
    destroyGame(gameId) {
        const game = this.games.get(gameId);
        if (!game) {
            console.log('could not find game to destroy');
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
        user.currentGameId = '';
        user.socket.offAny();
        this.joinServer(user);
    }
    onSocketConnect(socket) {
        console.log(`user connected with socket id: ${socket.id}`);
        socket.on('clientToServerEvent', (event) => {
            // the join server event is special as it gives us all the users info
            // all other events require this info and are handled by `handleEvent`
            if (event.type === 'joinServer') {
                const { id, name } = event
                    .data;
                this.joinServer({ id, name, socket });
            }
        });
    }
}
const serverManager = new ServerManager();
exports.default = serverManager;

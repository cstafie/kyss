import { GameMetaData } from '@nx/api-interfaces';
import { Game } from '../game/game';
import Player from '../player/player';

/*
player actions
- join-server (happens implicitly)
- leave server (due to disconnect or any other reason)
- create-game 
- join-game
- update-game
- leave game 
*/

/* 
server events
- game-update
- server-update
*/

export class GameManager {
  games: Map<string, Game>;
  players: Map<string, Player>;
  disconnectedPlayers: Map<string, Player>;

  constructor() {
    this.games = new Map();
    this.players = new Map();
    this.disconnectedPlayers = new Map();
  }

  newGame(gameName: string, playerName: string) {
    const game = new Game(gameName, playerName);
    this.games.set(game.id, game);
    this.updatePlayers();
  }

  // TODO: ensure this is idempotent
  playerJoin(player: Player) {
    this.players.set(player.id, player);

    if (this.disconnectedPlayers.has(player.id)) {
      console.log(`${player.name} rejoined the server`);
    } else {
      console.log(`${player.name} joined the server`);
    }

    // TODO: check if they were disconnected
    // - remove them from disconnect map
    // - if they have an ongoing game then reconnect them to that game

    player.socket.on('join-game', (gameId) => {
      const game = this.games.get(gameId);

      if (game) {
        game.addPlayer(player.id);
        player.socket.emit('join-game', () => 'TODO: join-game');
      }
    });

    player.socket.on('create-game', (gameName: string) =>
      this.newGame(gameName, player.name)
    );

    this.updatePlayers();
  }

  // TODO: ensure this is idempotent
  playerLeave(player: Player) {
    console.log(`${player.name} left the server`);

    this.disconnectedPlayers.set(player.id, player);
    this.players.delete(player.id);
  }

  // subscribeSocket(socket: Socket, playerId: string) {
  //   socket.on(
  //     'update',
  //     ({ user, gameUpdate }: { user: User; gameUpdate: GameUpdate }) => {
  //       const { tileBar, xWord } = gameUpdate;

  //       console.log(user);

  //       if (!sameXWord(xWord5x5, xWord)) {
  //         return socket.emit('update', {
  //           xWord: this.game.xWord,
  //           tileBar: this.game.players.get(playerId).tileBar,
  //         });
  //       }

  //       this.game.xWord = xWord;

  //       this.game.fillTileBar(tileBar);

  //       this.game.players.get(playerId).tileBar = tileBar;
  //       this.updatePlayers();
  //     }
  //   );
  // }

  updatePlayers() {
    const gameValues = Array.from(this.games.values());
    const games = gameValues.map(
      (game) =>
        ({
          id: game.id,
          name: game.name,
          createdAt: game.createdAt,
          numberOfPlayers: game.players.size,
          createdBy: game.createdBy,
        } as GameMetaData)
    );
    games.sort((gameA, gameB) => {
      return gameB.createdAt.getTime() - gameA.createdAt.getTime();
    });

    for (const player of this.players.values()) {
      player.socket.emit('server-update', games);
    }
  }
}

export default GameManager;

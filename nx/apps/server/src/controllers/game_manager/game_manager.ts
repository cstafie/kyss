import { Game } from '../game/game';
import Player from '../player/player';

export class GameManager {
  games: Map<string, Game>;
  players: Map<string, Player>;

  constructor() {
    this.games = new Map();
    this.players = new Map();
  }

  newGame(): Game {
    const game = new Game();
    this.games.set(game.id, game);
    return game;
  }

  playerJoin(player: Player) {
    this.players.set(player.id, player);

    player.socket.on('join-game', (gameId) => {
      const game = this.games.get(gameId);

      if (game) {
        game.addPlayer(player.id);
        player.socket.emit('join-game', () => 'TODO: join-game');
      }
    });
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

  // updatePlayers() {
  //   for (const player of this.players.values()) {
  //     player.socket.emit('update', {
  //       xWord: this.game.xWord,
  //       tileBar: this.game.players.get(player.id).tileBar,
  //     });
  //   }
  // }
}

export default GameManager;

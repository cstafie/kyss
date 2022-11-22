import * as express from 'express';
import { Server, Socket } from 'socket.io';
import * as http from 'http';
import * as cookieParser from 'cookie-parser';

import Player from './controllers/player/player';
import GameManager from './controllers/game_manager/game_manager';

// TODO: should i separate express and socket servers into separate apps?
const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer);
io.listen(4444);

app.use(cookieParser());

const gameManager = new GameManager();

app.get('/api/login', (req, res) => {
  console.log('api');

  // who is it?
  // if known player then connect then to their in progress games
  // else give unkown player their id

  res.send('TODO');
});

io.on('connection', (socket: Socket) => {
  console.log(`user connected with socket id: ${socket.id}`);

  socket.on('join-server', ({ id, name }) => {
    const player = new Player(name, socket, id);
    gameManager.playerJoin(player);

    socket.on('disconnect', () => {
      gameManager.playerLeave(player.id);
    });
  });
});

const port = process.env.port || 3333;
const server = app.listen(port, () => {
  console.log('Listening at http://localhost:' + port + '/api');
});
server.on('error', console.error);

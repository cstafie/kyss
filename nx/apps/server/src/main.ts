import * as express from 'express';
import { Server } from 'socket.io';
import * as http from 'http';
import * as cookieParser from 'cookie-parser';

import {
  SocketClientToServerEvents,
  SocketServerToClientEvents,
} from '@nx/api-interfaces';

import serverManager from './controllers/server_manager/server_manager';

// TODO: should i separate express and socket servers into separate apps?
const app = express();

const httpServer = http.createServer(app);
const io = new Server<SocketClientToServerEvents, SocketServerToClientEvents>(
  httpServer
);
io.listen(4444);

app.use(cookieParser());

// https://github.com/nodejs/help/issues/705#issuecomment-757578500
httpServer.on('clientError', console.error);
httpServer.on('error', console.error);

app.get('/api/login', (req, res) => {
  console.log('api');

  // who is it?
  // if known player then connect them to their in progress games
  // else give unknown player their id

  res.send('TODO');
});

io.on('connection', serverManager.onSocketConnect.bind(serverManager));

const port = process.env.port || 3333;
const server = app.listen(port, () => {
  console.log('Listening at http://localhost:' + port + '/api');
});

server.on('error', console.error);
server.on('clientError', console.error);

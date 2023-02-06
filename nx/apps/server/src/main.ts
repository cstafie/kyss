import * as express from 'express';
import { Server } from 'socket.io';
import * as http from 'http';
import * as cookieParser from 'cookie-parser';

import {
  FeedbackInfo,
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
app.use(express.json());

// https://github.com/nodejs/help/issues/705#issuecomment-757578500
httpServer.on('clientError', console.error);
httpServer.on('error', console.error);

app.post('/api/feedback', (req, res) => {
  const { email, content } = req.body as FeedbackInfo;
  const { id, name } = req.cookies;

  console.log(email, content);
  console.log(id, name);

  res.send('Success!');
});

io.on('connection', serverManager.onSocketConnect.bind(serverManager));

const port = process.env.port || 3333;
const server = app.listen(port, () => {
  console.log('Listening at http://localhost:' + port + '/api');
});

server.on('error', console.error);
server.on('clientError', console.error);

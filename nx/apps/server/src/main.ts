import * as express from 'express';
import { Server } from 'socket.io';
import * as http from 'http';

// TODO: should i separate express and socket servers into separate apps?
const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer);

io.listen(3000);

app.get('/api', (req, res) => {
  console.log('api');
  res.send('TODO');
});

app.get('/socket.io', (req, res) => {
  console.log('socket');
  res.send('WTF');
});

io.on('connection', (socket) => {
  console.log('a user connected');
});

const port = process.env.port || 3333;
const server = app.listen(port, () => {
  console.log('Listening at http://localhost:' + port + '/api');
});
server.on('error', console.error);

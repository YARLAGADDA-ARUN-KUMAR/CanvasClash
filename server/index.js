import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import registerSocketEvents from './socket.js';

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: false,
  }),
);

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  transports: ['polling', 'websocket'],
});

registerSocketEvents(io);

app.get('/health', (req, res) => res.send('Server is up'));

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port: ${PORT}`);
});

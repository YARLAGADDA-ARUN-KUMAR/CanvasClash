import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

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

io.on('connection', (socket) => {
  console.log('User Connected:', socket.id);

  socket.on('message', (data) => {
    console.log('Message received:', data);
    io.emit('message', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.get('/health', (req, res) => res.send('Server is up'));

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port: ${PORT}`);
});

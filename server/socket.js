import * as roomManager from './roommanager.js';

function registerSocketEvents(io) {
  io.on('connect', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('create-room', ({ playerName, settings }) => {
      const result = roomManager.createRoom(socket.id, playerName, settings);

      socket.join(result.roomId);
      socket.emit('room-created', { roomId: result.roomId });

      console.log(`Room ${result.roomId} created by ${playerName}`);
    });

    socket.on('join-room', ({ roomId, playerName }) => {
      const result = roomManager.joinRoom(socket.id, roomId, playerName);

      if (!result.success) {
        socket.emit('join_error', { message: result.message });
        return;
      }
      socket.join(roomId);
      socket.emit('join_success', { roomId });

      const room = roomManager.getRoom(roomId);
      io.to(roomId).emit('room_update', {
        players: room.players,
        settings: room.settings,
      });

      console.log(`${playerName} joined room ${roomId}`);
    });

    socket.on('get-room', ({ roomId }) => {
      const room = roomManager.getRoom(roomId);

      if (!room) return;

      socket.emit('room_update', {
        players: room.players,
        settings: room.settings,
      });
    });

    socket.on('leave-room', ({ roomId }) => {
      handleLeave(socket, roomId, io);
    });

    socket.on('start_game', ({ roomId }) => {
      const result = roomManager.startGame(socket.id, roomId);
      if (!result.success) return;

      io.to(roomId).emit('game_start', { roomId });
      console.log(`Game started in room ${roomId}`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);

      const roomId = roomManager.findRoomBySocket(socket.id);
      if (roomId) handleLeave(socket, roomId, io);
    });
  });
}

function handleLeave(socket, roomId, io) {
  const result = roomManager.leaveRoom(socket.id, roomId);
  if (!result) return;

  socket.leave(roomId);
  console.log(`${result.leavingPlayer.name} left room ${roomId}`);

  if (result.roomDeleted) {
    console.log(`Room ${roomId} deleted (empty)`);
    return;
  }

  io.to(roomId).emit('room_update', {
    players: result.room.players,
    settings: result.room.settings,
  });
}

export default registerSocketEvents;

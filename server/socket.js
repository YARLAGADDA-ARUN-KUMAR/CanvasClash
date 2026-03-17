import * as roomManager from './roommanager.js';

const timers = {};

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

      roomManager.initGame(roomId);
      io.to(roomId).emit('game_start', { roomId });

      console.log(`Game started in room ${roomId}`);
    });

    socket.on('player_ready', ({ roomId }) => {
      const result = roomManager.markPlayerReady(roomId, socket.id);

      if (result.allReady) {
        startTurn(roomId, io);
      }
    });

    socket.on('choose_word', ({ roomId, word }) => {
      roomManager.clearWordChoiceTimer(roomId);

      roomManager.setCurrentWord(roomId, word);
      const room = roomManager.getRoom(roomId);

      io.to(roomId).emit('word_length', {
        length: word.length,
      });

      socket.emit('your_word', { word });
      startTimer(roomId, io);
    });

    socket.on('guess', ({ roomId, guess, timeLeft }) => {
      const room = roomManager.getRoom(roomId);
      if (!room) return;

      const drawer = room.players[room.currentDrawerIndex];
      if (socket.id === drawer.id) return;

      const result = roomManager.checkGuess(roomId, socket.id, guess, timeLeft);
      const guesser = room.players.find((p) => p.id === socket.id);

      if (result.correct) {
        drawer.score += 50;

        if (timers[roomId]) {
          clearInterval(timers[roomId]);
          delete timers[roomId];
        }

        io.to(roomId).emit('correct_guess', {
          playerName: guesser.name,
          players: room.players,
        });

        room.turnEnding = true;

        setTimeout(() => endTurn(roomId, io), 3000);
      } else {
        io.to(roomId).emit('chat_message', {
          playerName: guesser.name,
          message: guess,
        });
      }
    });

    socket.on('draw', (data) => {
      socket.to(data.roomId).emit('draw', data);
    });

    socket.on('clear_canvas', ({ roomId }) => {
      socket.to(roomId).emit('clear_canvas');
    });

    socket.on('undo_stroke', ({ roomId, strokes }) => {
      socket.to(roomId).emit('undo_stroke', { strokes });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);

      const roomId = roomManager.findRoomBySocket(socket.id);
      if (roomId) handleLeave(socket, roomId, io);
    });
  });
}

function startTurn(roomId, io) {
  const room = roomManager.getRoom(roomId);
  if (!room || room.status === 'ended') return;

  room.turnEnding = false;

  const drawer = room.players[room.currentDrawerIndex];
  const wordChoices = roomManager.getRandomWords();

  io.to(roomId).emit('turn_start', {
    drawerId: drawer.id,
    drawerName: drawer.name,
    round: room.currentRound,
    totalRounds: room.settings.rounds,
  });

  io.to(drawer.id).emit('choose_word', { words: wordChoices });

  roomManager.startWordChoiceTimer(roomId, io, drawer.id, 10, () => {
    startTimer(roomId, io);
  });

  console.log(`Turn started in room ${roomId}, drawer: ${drawer.name}`);
}

function startTimer(roomId, io) {
  const room = roomManager.getRoom(roomId);
  if (!room) return;

  let timeLeft = room.settings.timeLimit;

  if (timers[roomId]) clearInterval(timers[roomId]);

  timers[roomId] = setInterval(() => {
    timeLeft -= 1;

    io.to(roomId).emit('tick', { timeLeft });

    if (timeLeft <= 0) {
      clearInterval(timers[roomId]);
      delete timers[roomId];
      if (!room.turnEnding) {
        endTurn(roomId, io);
      }
    }
  }, 1000);
}

function endTurn(roomId, io) {
  const room = roomManager.getRoom(roomId);
  if (!room) return;

  io.to(roomId).emit('turn_end', {
    word: room.currentWord,
    players: room.players,
  });

  setTimeout(() => {
    const result = roomManager.nextTurn(roomId);

    if (result.gameOver) {
      io.to(roomId).emit('game_over', {
        players: result.players,
      });
    } else {
      startTurn(roomId, io);
    }
  }, 3000);
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

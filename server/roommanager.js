import { v4 as uuidv4 } from 'uuid';
import { words } from './words.js';

const rooms = {};

export const createRoom = (socketId, playerName, settings) => {
  const roomId = uuidv4().slice(0, 6).toUpperCase();

  rooms[roomId] = {
    id: roomId,
    status: 'waiting',
    settings: {
      maxPlayers: parseInt(settings.maxPlayers) || 6,
      timeLimit: parseInt(settings.timeLimit) || 80,
      rounds: parseInt(settings.rounds) || 3,
    },
    players: [
      {
        id: socketId,
        name: playerName,
        isHost: true,
        score: 0,
      },
    ],
  };

  return { success: true, roomId };
};

export const joinRoom = (socketId, roomId, playerName) => {
  const room = rooms[roomId];

  if (!room)
    return { success: false, message: 'Room not found, check the code!' };

  if (room.status !== 'waiting')
    return { success: false, message: 'Room has already started' };

  if (room.players.length >= room.settings.maxPlayers)
    return {
      success: false,
      message: 'Room has reached the maximum number of players',
    };

  room.players.push({
    id: socketId,
    name: playerName,
    isHost: false,
    score: 0,
  });

  return { success: true, roomId };
};

export const getRoom = (roomId) => {
  return rooms[roomId] || null;
};

export const leaveRoom = (socketId, roomId) => {
  const room = rooms[roomId];
  if (!room) return null;

  const leavingPlayer = room.players.find((p) => p.id === socketId);
  if (!leavingPlayer) return null;

  room.players = room.players.filter((p) => p.id !== socketId);

  if (room.players.length === 0) {
    delete rooms[roomId];
    return { roomDeleted: true, leavingPlayer };
  }

  if (leavingPlayer.isHost) {
    room.players[0].isHost = true;
  }

  return { roomDeleted: false, leavingPlayer, room };
};

export const startGame = (socketId, roomId) => {
  const room = rooms[roomId];
  if (!room) return { success: false, message: 'Room not found' };

  const player = room.players.find((p) => p.id === socketId);
  if (!player || !player.isHost)
    return { success: false, message: 'Only host can start' };
  if (room.players.length < 2)
    return { success: false, message: 'Need at least 2 players' };

  room.status = 'playing';
  return { success: true };
};

export const findRoomBySocket = (socketId) => {
  for (const roomId in rooms) {
    const found = rooms[roomId].players.find((p) => p.id === socketId);
    if (found) return roomId;
  }
  return null;
};

export const initGame = (roomId) => {
  const room = rooms[roomId];
  room.currentRound = 1;
  room.currentDrawerIndex = 0;
  room.currentWord = null;
  room.turnScores = {};
  return room;
};

export const getRandomWords = () => {
  const shuffled = [...words].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
};

export const setCurrentWord = (roomId, word) => {
  const room = rooms[roomId];
  room.currentWord = word;
  room.wordLength = word.length;
};

export const checkGuess = (roomId, socketId, guess, timeLeft) => {
  const room = rooms[roomId];
  if (!room || !room.currentWord) return { correct: false };
  const correct = guess.trim().toLowerCase() === room.currentWord.toLowerCase();
  if (correct) {
    const player = room.players.find((p) => p.id === socketId);
    if (player) player.score += Math.max(50, timeLeft * 5);
  }
  return { correct, word: room.currentWord };
};

export const nextTurn = (roomId) => {
  const room = rooms[roomId];
  room.currentDrawerIndex += 1;
  if (room.currentDrawerIndex >= room.players.length) {
    room.currentDrawerIndex = 0;
    room.currentRound += 1;
  }
  room.currentWord = null;
  if (room.currentRound > room.settings.rounds) {
    room.status = 'ended';
    return { gameOver: true, players: room.players };
  }
  const drawer = room.players[room.currentDrawerIndex];
  return { gameOver: false, drawer, round: room.currentRound };
};

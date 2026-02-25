import { v4 as uuidv4 } from 'uuid';

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

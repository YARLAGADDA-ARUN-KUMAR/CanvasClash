import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import socket from '@/utils/socket';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export default function WaitingRoom() {
  const navigate = useNavigate();
  const { roomId } = useParams();

  const [room, setRoom] = useState(null);
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    socket.emit('get-room', { roomId });

    socket.on('room_update', ({ players, settings }) => {
      setRoom((prev) => ({ ...prev, players, settings }));
      const me = players.find((p) => p.id === socket.id);
      setIsHost(me?.isHost || false);
    });

    socket.on('game_start', () => {
      navigate(`/game/${roomId}`);
    });

    return () => {
      socket.off('room_update');
      socket.off('game_start');
    };
  }, [navigate]);

  const handleStartGame = () => {
    const roomId = window.location.pathname.split('/').pop();
    socket.emit('start_game', { roomId });
  };

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center text-3xl font-bold">
        Loading room...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yellow-300 flex flex-col items-center justify-center p-6">
      <h1 className="text-5xl font-extrabold mb-8 border-4 border-black px-8 py-4 shadow-[8px_8px_0px_black] bg-white">
        Waiting Room
      </h1>

      <Card className="w-full max-w-lg border-4 border-black shadow-[8px_8px_0px_black] bg-white">
        <CardContent className="p-6 space-y-6">
          <div>
            <Label className="text-lg font-bold">Room ID</Label>
            <div className="text-2xl font-mono border-2 border-black p-2 mt-2">
              {roomId}
            </div>
          </div>

          <div>
            <Label className="text-lg font-bold">
              Players ({room.players.length}/{room.settings.maxPlayers})
            </Label>
            <ul className="mt-3 space-y-2">
              {room.players.map((player) => (
                <li
                  key={player.id}
                  className="border-2 border-black p-2 font-semibold bg-gray-100"
                >
                  {player.name}
                  {player.isHost && ' 👑'}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm font-semibold">
            <div className="border-2 border-black p-2">
              Time: {room.settings.timeLimit}s
            </div>
            <div className="border-2 border-black p-2">
              Rounds: {room.settings.rounds}
            </div>
          </div>

          {isHost && (
            <Button
              onClick={handleStartGame}
              disabled={room.players.length < 2}
              className="w-full border-4 border-black shadow-[4px_4px_0px_black] bg-green-500 hover:translate-x-1 hover:translate-y-1 transition"
            >
              Start Game
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

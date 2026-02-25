import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import socket from '@/utils/socket';
import { useNavigate } from 'react-router-dom';

export default function HomeScreen() {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState('4');
  const [timeLimit, setTimeLimit] = useState('60');
  const [rounds, setRounds] = useState('3');
  const [joinMode, setJoinMode] = useState(false);
  const [roomId, setRoomId] = useState('');

  const handleCreateRoom = () => {
    if (playerName === '') return;
    const settings = {
      maxPlayers,
      timeLimit,
      rounds,
    };

    socket.emit('create-room', { playerName, settings });
    socket.once('room-created', ({ roomId }) => {
      navigate(`/waiting-room/${roomId}`);
    });
  };

  const handleJoinRoom = () => {
    if (!playerName || !roomId) return;
    socket.emit('join-room', { roomId, playerName });
    socket.once('join_success', ({ roomId: id }) => {
      navigate(`/waiting-room/${id}`);
    });
    socket.once('join_error', ({ message }) => {
      alert(message);
    });
  };

  return (
    <div className="min-h-screen bg-yellow-300 flex flex-col items-center justify-center p-6">
      <h1 className="text-5xl md:text-7xl font-extrabold mb-10 border-4 border-black px-8 py-4 shadow-[8px_8px_0px_black] bg-white">
        Canvas Clash
      </h1>

      <Card className="w-full max-w-md border-4 border-black shadow-[8px_8px_0px_black] bg-white">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label>Player name</Label>
            <Input
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="border-4 border-black"
            />
            <Label>Max Players</Label>
            <Select value={maxPlayers} onValueChange={setMaxPlayers}>
              <SelectTrigger className="border-4 border-black">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="6">6</SelectItem>
                <SelectItem value="8">8</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Time Limit (seconds)</Label>
            <Select value={timeLimit} onValueChange={setTimeLimit}>
              <SelectTrigger className="border-4 border-black">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30</SelectItem>
                <SelectItem value="60">60</SelectItem>
                <SelectItem value="90">90</SelectItem>
                <SelectItem value="120">120</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Rounds</Label>
            <Select value={rounds} onValueChange={setRounds}>
              <SelectTrigger className="border-4 border-black">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="5">5</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {joinMode && (
            <div className="space-y-2">
              <Label>Room ID</Label>
              <Input
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter Room ID"
                className="border-4 border-black"
              />
            </div>
          )}

          <div className="flex flex-col gap-4 pt-4">
            <Button
              onClick={handleCreateRoom}
              className="border-4 border-black shadow-[4px_4px_0px_black] bg-orange-500 hover:translate-x-1 hover:translate-y-1 transition"
            >
              Create Room
            </Button>

            {!joinMode ? (
              <Button
                onClick={() => setJoinMode(true)}
                className="border-4 border-black shadow-[4px_4px_0px_black] bg-teal-400 hover:translate-x-1 hover:translate-y-1 transition"
              >
                Join Room
              </Button>
            ) : (
              <Button
                onClick={handleJoinRoom}
                className="border-4 border-black shadow-[4px_4px_0px_black] bg-red-400 hover:translate-x-1 hover:translate-y-1 transition"
              >
                Confirm Join
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

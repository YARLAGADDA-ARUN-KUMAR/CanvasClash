import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import socket from '@/utils/socket';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash, Undo, Redo } from 'lucide-react';
import ColorWheelButton from '@/components/ui/ColorWheelButton';

export default function Game() {
  const { roomId } = useParams();
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const strokeHistory = useRef([]);
  const redoStack = useRef([]);

  const [guess, setGuess] = useState('');
  const [color, setColor] = useState('#000000');
  const [brushSize] = useState(4);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const [wordLength, setWordLength] = useState(0);
  const [round, setRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(3);
  const [players, setPlayers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [drawerId, setDrawerId] = useState(null);
  const isDrawer = drawerId === socket.id;
  const [wordChoices, setWordChoices] = useState([]);
  const [showWordChoices, setShowWordChoices] = useState(false);
  const [turnEndWord, setTurnEndWord] = useState('');
  const [showTurnEnd, setShowTurnEnd] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [finalPlayers, setFinalPlayers] = useState([]);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const drawLine = (x0, y0, x1, y1, strokeColor, stroke) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = stroke;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const redrawAll = (strokes) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    strokes.forEach((stroke) => {
      stroke.forEach((point, i) => {
        if (i === 0) return;
        drawLine(
          stroke[i - 1].x,
          stroke[i - 1].y,
          point.x,
          point.y,
          point.color,
          point.brushSize,
        );
      });
    });
  };

  const handleMouseDown = (e) => {
    if (!isDrawer) return;
    isDrawing.current = true;
    lastPos.current = getPos(e);
    strokeHistory.current.push([{ ...lastPos.current, color, brushSize }]);
    redoStack.current = [];
  };

  const handleMouseMove = (e) => {
    if (!isDrawing.current || !isDrawer) return;
    const newPos = getPos(e);

    drawLine(
      lastPos.current.x,
      lastPos.current.y,
      newPos.x,
      newPos.y,
      color,
      brushSize,
    );

    const currentStroke =
      strokeHistory.current[strokeHistory.current.length - 1];
    currentStroke.push({ ...newPos, color, brushSize });

    socket.emit('draw', {
      roomId,
      x0: lastPos.current.x,
      y0: lastPos.current.y,
      x1: newPos.x,
      y1: newPos.y,
      color,
      brushSize,
    });

    lastPos.current = newPos;
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const handleUndo = () => {
    if (!isDrawer || strokeHistory.current.length === 0) return;
    const undone = strokeHistory.current.pop();
    redoStack.current.push(undone);
    redrawAll(strokeHistory.current);
    socket.emit('undo_stroke', { roomId, strokes: strokeHistory.current });
  };

  const handleRedo = () => {
    if (!isDrawer || redoStack.current.length === 0) return;
    const redone = redoStack.current.pop();
    strokeHistory.current.push(redone);
    redrawAll(strokeHistory.current);
    socket.emit('undo_stroke', { roomId, strokes: strokeHistory.current });
  };

  const handleClear = () => {
    if (!isDrawer) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    strokeHistory.current = [];
    redoStack.current = [];
    socket.emit('clear_canvas', { roomId });
  };

  const handleSendGuess = () => {
    if (!guess.trim()) return;
    socket.emit('guess', { roomId, guess, timeLeft });
    setGuess('');
  };

  useEffect(() => {
    socket.on(
      'turn_start',
      ({ drawerId: dId, drawerName, round: r, totalRounds: tr }) => {
        setDrawerId(dId);
        setRound(r);
        setTotalRounds(tr);
        setCurrentWord('');
        setTurnEndWord('');
        setShowTurnEnd(false);
        setWordChoices([]);
        setShowWordChoices(false);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        strokeHistory.current = [];
        redoStack.current = [];
        setMessages((prev) => [
          ...prev,
          { type: 'system', text: `${drawerName} is now drawing!` },
        ]);
      },
    );

    socket.on('choose_word', ({ words }) => {
      setWordChoices(words);
      setShowWordChoices(true);
    });

    socket.on('your_word', ({ word }) => {
      setCurrentWord(word);
    });

    socket.on('word_length', ({ length }) => {
      setWordLength(length);
    });

    socket.on('tick', ({ timeLeft: t }) => {
      setTimeLeft(t);
    });

    socket.on('correct_guess', ({ playerName, players: updatedPlayers }) => {
      setPlayers(updatedPlayers);
      setMessages((prev) => [
        ...prev,
        { type: 'correct', text: `${playerName} guessed the word!` },
      ]);
    });

    socket.on('chat_message', ({ playerName, message }) => {
      setMessages((prev) => [
        ...prev,
        { type: 'chat', playerName, text: message },
      ]);
    });

    socket.on('turn_end', ({ word, players: updatedPlayers }) => {
      setPlayers(updatedPlayers);
      setTurnEndWord(word);
      setShowTurnEnd(true);
    });

    socket.on('game_over', ({ players: finalScores }) => {
      setFinalPlayers(finalScores);
      setGameOver(true);
    });

    socket.on('draw', ({ x0, y0, x1, y1, color: c, brushSize: bs }) => {
      drawLine(x0, y0, x1, y1, c, bs);
    });

    socket.on('clear_canvas', () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      strokeHistory.current = [];
    });

    socket.on('undo_stroke', ({ strokes }) => {
      strokeHistory.current = strokes;
      redrawAll(strokes);
    });

    socket.on('room_update', ({ players: updatedPlayers }) => {
      setPlayers(updatedPlayers);
    });

    return () => {
      socket.off('turn_start');
      socket.off('choose_word');
      socket.off('your_word');
      socket.off('word_length');
      socket.off('tick');
      socket.off('correct_guess');
      socket.off('chat_message');
      socket.off('turn_end');
      socket.off('game_over');
      socket.off('draw');
      socket.off('clear_canvas');
      socket.off('undo_stroke');
      socket.off('room_update');
    };
  }, []);

  const colors = [
    '#000000',
    '#ffffff',
    '#ef4444',
    '#f97316',
    '#eab308',
    '#22c55e',
    '#3b82f6',
    '#8b5cf6',
    '#ec4899',
    '#6b7280',
    '#92400e',
    '#0ea5e9',
  ];

  return (
    <div className="min-h-screen bg-blue-400 p-4 flex flex-col items-center">
      <div className="w-full max-w-6xl flex justify-between items-center mb-4 bg-white border-4 border-black p-4 shadow-[4px_4px_0px_black]">
        <div
          className={`text-xl font-bold ${timeLeft <= 10 ? 'text-red-500' : ''}`}
        >
          Time: {timeLeft}s
        </div>
        <div className="text-3xl font-black tracking-[0.5em]">
          {isDrawer ? currentWord : '_ '.repeat(wordLength).trim()}
        </div>
        <div className="text-xl font-bold">
          Round {round}/{totalRounds}
        </div>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-12 gap-6 h-[70vh]">
        <Card className="col-span-3 border-4 border-black shadow-[8px_8px_0px_black] overflow-y-auto p-4 space-y-2">
          <h3 className="font-bold border-b-2 border-black pb-2 mb-2">
            Players
          </h3>
          {players.map((player) => (
            <div
              key={player.id}
              className={`flex justify-between border-2 border-black p-2 ${
                player.id === drawerId ? 'bg-yellow-200' : 'bg-green-200'
              }`}
            >
              <span>
                {player.name}
                {player.id === drawerId && ' ✏️'}
              </span>
              <span>{player.score}</span>
            </div>
          ))}
        </Card>

        <Card className="col-span-6 border-4 border-black shadow-[8px_8px_0px_black] bg-white relative">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="w-full h-full cursor-crosshair"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />

          {isDrawer && (
            <div className="absolute top-2 right-2">
              <ColorWheelButton
                size={40}
                onClick={() => setShowColorPicker((prev) => !prev)}
              />
            </div>
          )}

          {showColorPicker && (
            <div className="absolute top-14 right-2 bg-white border-4 border-black shadow-[4px_4px_0px_black] p-3 grid grid-cols-4 gap-2 z-10">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setColor(c);
                    setShowColorPicker(false);
                  }}
                  style={{ backgroundColor: c }}
                  className={`w-8 h-8 border-2 border-black hover:scale-110 transition ${color === c ? 'ring-2 ring-offset-1 ring-black' : ''}`}
                />
              ))}
            </div>
          )}

          {isDrawer && (
            <div className="flex absolute bottom-2 right-2 space-x-2">
              <button
                onClick={handleUndo}
                className="cursor-pointer hover:scale-110 transition p-1 bg-white border-2 border-black"
              >
                <Undo size={20} />
              </button>
              <button
                onClick={handleRedo}
                className="cursor-pointer hover:scale-110 transition p-1 bg-white border-2 border-black"
              >
                <Redo size={20} />
              </button>
              <button
                onClick={handleClear}
                className="cursor-pointer hover:scale-110 transition p-1 bg-white border-2 border-black"
              >
                <Trash size={20} />
              </button>
            </div>
          )}

          {isDrawer && (
            <div className="absolute bottom-2 left-2 flex items-center gap-2">
              <div
                className="w-6 h-6 border-2 border-black"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs font-bold">{color}</span>
            </div>
          )}
        </Card>

        <Card className="col-span-3 border-4 border-black shadow-[8px_8px_0px_black] flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-2 text-sm">
            {messages.map((msg, i) => (
              <div key={i}>
                {msg.type === 'correct' && (
                  <div className="font-bold text-green-600">{msg.text}</div>
                )}
                {msg.type === 'system' && (
                  <div className="font-bold text-blue-500 text-center">
                    {msg.text}
                  </div>
                )}
                {msg.type === 'chat' && (
                  <div>
                    <strong>{msg.playerName}:</strong> {msg.text}
                  </div>
                )}
              </div>
            ))}
          </div>

          {!isDrawer && (
            <div className="p-2 border-t-4 border-black flex gap-2">
              <Input
                placeholder="Type your guess..."
                className="border-2 border-black"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendGuess()}
              />
              <Button
                onClick={handleSendGuess}
                className="border-2 border-black bg-yellow-400 text-black hover:bg-yellow-500"
              >
                Send
              </Button>
            </div>
          )}
        </Card>
      </div>
      {showWordChoices && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_black] p-8 flex flex-col items-center gap-6">
            <h2 className="text-2xl font-black">Choose a word to draw!</h2>
            <div className="flex gap-4">
              {wordChoices.map((word) => (
                <button
                  key={word}
                  onClick={() => {
                    socket.emit('choose_word', { roomId, word });
                    setShowWordChoices(false);
                  }}
                  className="border-4 border-black px-6 py-3 font-bold text-lg shadow-[4px_4px_0px_black] bg-yellow-300 hover:translate-x-1 hover:translate-y-1 transition"
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {showTurnEnd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_black] p-8 text-center">
            <h2 className="text-2xl font-black mb-2">Turn Over!</h2>
            <p className="text-xl">
              The word was{' '}
              <span className="font-black text-orange-500">{turnEndWord}</span>
            </p>
          </div>
        </div>
      )}
      {gameOver && (
        <div className="fixed inset-0 bg-yellow-300 flex flex-col items-center justify-center z-50 border-4 border-black">
          <h1 className="text-6xl font-black mb-10 border-4 border-black px-8 py-4 bg-white shadow-[8px_8px_0px_black]">
            Game Over!
          </h1>
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_black] p-8 w-full max-w-md">
            <h2 className="text-2xl font-black border-b-4 border-black pb-2 mb-4">
              Final Scores
            </h2>
            {finalPlayers
              .sort((a, b) => b.score - a.score)
              .map((player, i) => (
                <div
                  key={player.id}
                  className={`flex justify-between border-2 border-black p-3 mb-2 ${i === 0 ? 'bg-yellow-300' : 'bg-gray-100'}`}
                >
                  <span className="font-bold">
                    {i === 0 ? '🏆 ' : ''}
                    {player.name}
                  </span>
                  <span className="font-black">{player.score}</span>
                </div>
              ))}
            <button
              onClick={() => (window.location.href = '/')}
              className="w-full mt-4 border-4 border-black bg-orange-500 text-white font-black py-3 shadow-[4px_4px_0px_black] hover:translate-x-1 hover:translate-y-1 transition"
            >
              PLAY AGAIN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

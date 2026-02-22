import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  transports: ['polling', 'websocket'],
});

function App() {
  const [message, setMessage] = useState('');
  const [received, setReceived] = useState('');

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected! Socket ID:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.log('Connection error:', err.message);
    });

    socket.on('message', (data) => {
      setReceived(data);
    });

    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('message');
    };
  }, []);

  const sendMessage = () => {
    socket.emit('message', message);
  };

  return (
    <div>
      <h2>Socket.IO React</h2>
      <input value={message} onChange={(e) => setMessage(e.target.value)} />
      <button onClick={sendMessage}>Send</button>
      <p>Received: {received}</p>
    </div>
  );
}

export default App;

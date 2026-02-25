import { Routes, Route, BrowserRouter } from 'react-router-dom';
import HomeScreen from './pages/HomeScreen';
import WaitingRoom from './pages/WaitingRoom';
import Game from './pages/Game';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/waiting-room/:roomId" element={<WaitingRoom />} />
        <Route path="/game/:roomId" element={<Game />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

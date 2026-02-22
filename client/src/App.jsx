import { Routes, Route, BrowserRouter } from 'react-router-dom';
import HomeScreen from './pages/HomeScreen';
import WaitingRoom from './pages/WaitingRoom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/waiting-room" element={<WaitingRoom />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

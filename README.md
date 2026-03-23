# 🎨 Draw & Guess

A real-time multiplayer drawing and guessing game where players take turns drawing while others try to guess the word. Built with React, Node.js, Socket.IO.

## ✨ Features

- 🎮 **Real-time Multiplayer** - Play with friends in real-time using WebSockets
- 🎨 **Interactive Canvas** - Smooth drawing with undo/redo and clear canvas features
- 🏆 **Scoring System** - Points for correct guesses and drawing
- ⏱️ **Timed Rounds** - Configurable time limits per turn
- 🎯 **Word Selection** - Drawer chooses from 3 random word options
- 👥 **Room Management** - Create and join private game rooms
- 🐳 **Docker Support** - Easy development setup with Docker Compose

## 🚀 Tech Stack

### Frontend
- **React 19** - Modern UI library with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Socket.IO Client** - Real-time bidirectional communication
- **React Router** - Client-side routing
- **Radix UI** - Accessible UI components
- **Lucide React** - Beautiful icons

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **Socket.IO** - Real-time event-based communication
- **Socket.IO Redis Adapter** - Enables multi-server scaling

## 📁 Project Structure

```
.
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/           # Page components
│   │   │   ├── HomeScreen.jsx
│   │   │   ├── WaitingRoom.jsx
│   │   │   └── Game.jsx
│   │   └── App.jsx
│   ├── Dockerfile
│   └── package.json
├── server/                 # Node.js backend
│   ├── index.js            # Express server entry
│   ├── socket.js           # Socket.IO event handlers
│   ├── roommanager.js      # Game room logic
│   ├── words.js            # Word bank for game
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml      # Docker orchestration
└── README.md
```

## 🛠️ Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)
- **OR**
- Node.js (v18 or higher)

## 🚀 Getting Started

### Option 1: Docker Compose (Recommended)

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd draw-and-guess
   ```

2. Create environment file:
   ```bash
   mkdir -p env
   echo "PORT=3000" > env/server.env
   ```

3. Start all services:
   ```bash
   docker-compose up --build
   ```

4. Open your browser:
   - 🎮 Game: http://localhost:5173
   - 🔧 API: http://localhost:3000

### Option 2: Manual Setup

#### Backend
```bash
cd server
npm install


# Then start the server
npm run dev
```

#### Frontend
```bash
cd client
npm install
npm run dev
```

## 🎮 How to Play

1. **Create a Room** - Enter your name and click "Create Room"
2. **Invite Friends** - Share the 6-digit room code with friends
3. **Join Room** - Enter the room code to join an existing game
4. **Start Game** - Host clicks "Start Game" when everyone is ready
5. **Draw & Guess**:
   - **Drawer**: Choose a word and draw it on the canvas
   - **Guessers**: Type your guesses in the chat
   - Points awarded for correct guesses!
6. **Win** - Player with the highest score after all rounds wins!

## 🎯 Game Rules

- Each player gets a turn to draw
- Drawer selects from 3 word options
- Other players have limited time to guess
- Faster guesses earn more points
- Drawer earns points when players guess correctly
- Game ends after all rounds complete

## ⚙️ Configuration

Game settings can be configured when creating a room:

| Setting | Default | Description |
|---------|---------|-------------|
| Max Players | 6 | Maximum players per room |
| Time Limit | 80s | Seconds per turn |
| Rounds | 3 | Number of rounds to play |

## 🛣️ API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check endpoint |

## 🔌 Socket.IO Events

### Client → Server
- `create-room` - Create a new game room
- `join-room` - Join an existing room
- `start_game` - Host starts the game
- `player_ready` - Player ready for next turn
- `choose_word` - Drawer selects a word
- `guess` - Submit a word guess
- `draw` - Canvas drawing data
- `clear_canvas` - Clear the drawing canvas
- `undo_stroke` - Undo last stroke

### Server → Client
- `room-created` - Room successfully created
- `join_success` / `join_error` - Join room result
- `room_update` - Room state updated
- `game_start` - Game has started
- `turn_start` - New turn begins
- `choose_word` - Present word options to drawer
- `word_length` - Reveal word length to guessers
- `your_word` - Show actual word to drawer
- `correct_guess` - Someone guessed correctly
- `chat_message` - Display chat/guess message
- `tick` - Timer countdown update
- `turn_end` - Turn ended
- `game_over` - Game finished

## 🧪 Development

### Running Tests
```bash
# Frontend
cd client
npm run lint

# Backend
cd server
npm test  # (if tests are added)
```

### Project Scripts

**Client:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

**Server:**
- `npm run dev` - Start with nodemon (auto-reload)
- `npm start` - Start production server

## 🐳 Docker Services

| Service | Port | Description |
|---------|------|-------------|
| client | 5173 | React development server |
| server | 3000 | Node.js API server |

## 🔮 Future Enhancements

- [ ] User authentication with Google OAuth
- [ ] Persistent game history with PostgreSQL
- [ ] Spectator mode
- [ ] Custom word packs
- [ ] Mobile-responsive improvements
- [ ] Emoji reactions
- [ ] Leaderboards

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by [Skribbl.io](https://skribbl.io/)
- Built with modern web technologies
- Thanks to all contributors!

---

Made with ❤️ using React, Node.js, and Socket.IO

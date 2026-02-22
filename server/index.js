import express from "express";
const app = express();
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  }),
);

const PORT = process.env.PORT || 3001;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("User Connnected");
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

app.get("/health", (req, res) => res.send("Server is up"));

server.listen(PORT, () => {
  console.log("Server running on port: 3001");
});

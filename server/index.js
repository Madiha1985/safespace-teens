const express = require("express");
const cors = require("cors");
require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db"); 
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");


const app = express();

// Connect Database
connectDB(); 

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);


app.get("/", (req, res) => {
  res.send("SafeSpace Teens API running");
});

 //  Create HTTP server
const server = http.createServer(app);

//  Create Socket.io server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Next.js dev server
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // Join a room
  socket.on("room:join", ({ roomId }) => {
    socket.join(roomId);
    socket.emit("room:joined", { roomId });
    console.log(`${socket.id} joined room ${roomId}`);
  });

  // Leave a room
  socket.on("room:leave", ({ roomId }) => {
    socket.leave(roomId);
    socket.emit("room:left", { roomId });
    console.log(`${socket.id} left room ${roomId}`);
  });

  // Send message to a room
  socket.on("message:send", ({ roomId, message, username }) => {
    const payload = {
      roomId,
      message,
      username: username || "anonymous",
      createdAt: new Date().toISOString(),
    };

    // emit to everyone in room (including sender)
    io.to(roomId).emit("message:new", payload);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

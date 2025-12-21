const express = require("express");
const cors = require("cors");
require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const { verifyToken } = require("./utils/jwt");
const Message = require("./models/Message");
const roomRoutes = require("./routes/roomRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const journalRoutes = require("./routes/journalRoutes");


const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// REST routes
app.get("/", (req, res) => {
  res.send("SafeSpace Teens API running");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/rooms",roomRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/journal", journalRoutes);


// Create HTTP server
const server = http.createServer(app);

// Create Socket.io server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Next.js dev server
    methods: ["GET", "POST"],
  },
});

// Socket.io JWT auth middleware
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Unauthorized: missing token"));

    const payload = verifyToken(token);

    socket.user = {
      id: payload.sub,
      username: payload.username,
      role: payload.role,
    };

    next();
  } catch (err) {
    next(new Error("Unauthorized: invalid/expired token"));
  }
});

// Socket.io events

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id, "user:", socket.user.username);

  // Track current room for this socket
  socket.currentRoomId = null;

  // helper to broadcast system messages
  const emitSystemMessage = (roomId, text) => {
    io.to(roomId).emit("message:new", {
      roomId,
      message: text,
      username: "System",
      userId: "system",
      createdAt: new Date().toISOString(),
      type: "system",
    });
  };

  socket.on("room:join", ({ roomId }) => {
    if (!roomId) return;

    // leave previous room (if any)
    if (socket.currentRoomId && socket.currentRoomId !== roomId) {
      socket.leave(socket.currentRoomId);
      emitSystemMessage(socket.currentRoomId, `${socket.user.username} left the room`);
    }

    socket.join(roomId);
    socket.currentRoomId = roomId;

    socket.emit("room:joined", { roomId });
    emitSystemMessage(roomId, `${socket.user.username} has joined the room`);

    console.log(`${socket.user.username} joined room ${roomId}`);
  });

  socket.on("room:leave", ({ roomId }) => {
    if (!roomId) return;

    socket.leave(roomId);

    if (socket.currentRoomId === roomId) {
      socket.currentRoomId = null;
    }

    emitSystemMessage(roomId, `${socket.user.username} has left the room`);
    socket.emit("room:left", { roomId });

    console.log(`${socket.user.username} left room ${roomId}`);
  });

  socket.on("message:send", async ({ roomId, message }) => {
    try {
      if (!roomId || !message) return;

      const doc = await Message.create({
        roomId,
        userId: socket.user.id,
        username: socket.user.username,
        message,
      });

      const payload = {
        id: doc._id,
        roomId: doc.roomId,
        userId: doc.userId,
        username: doc.username,
        message: doc.message,
        createdAt: doc.createdAt,
        type: "user",
      };

      io.to(roomId).emit("message:new", payload);
    } catch (err) {
      console.error("MESSAGE_SAVE_ERROR:", err.message);
      socket.emit("message:error", { message: "Failed to save message." });
    }
  });

  // --- Drawing events (room-based) ---
socket.on("draw:stroke", ({ roomId, stroke }) => {
  if (!roomId || !stroke) return;

  // broadcast to everyone else in the room (not including sender)
  socket.to(roomId).emit("draw:stroke", { roomId, stroke });
});

socket.on("draw:clear", ({ roomId }) => {
  if (!roomId) return;
  io.to(roomId).emit("draw:clear", { roomId });
});


  socket.on("disconnect", () => {
    if (socket.currentRoomId) {
      emitSystemMessage(socket.currentRoomId, `${socket.user.username} disconnected`);
    }
    console.log("Socket disconnected:", socket.id);
  });
});


// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const app = require("./app"); //  express app from app.js
const { verifyToken } = require("./utils/jwt");
const Message = require("./models/Message");

// Connect DB
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Create Socket.io server for development and production

const allowedOrigins = [
  "http://localhost:3000",
  process.env.CLIENT_URL, 
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
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

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id, "user:", socket.user.username);

  socket.currentRoomId = null;

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

    if (socket.currentRoomId && socket.currentRoomId !== roomId) {
      socket.leave(socket.currentRoomId);
      emitSystemMessage(socket.currentRoomId, `${socket.user.username} left the room`);
    }

    socket.join(roomId);
    socket.currentRoomId = roomId;

    socket.emit("room:joined", { roomId });
    emitSystemMessage(roomId, `${socket.user.username} has joined the room`);
  });

  socket.on("room:leave", ({ roomId }) => {
    if (!roomId) return;

    socket.leave(roomId);

    if (socket.currentRoomId === roomId) socket.currentRoomId = null;

    emitSystemMessage(roomId, `${socket.user.username} has left the room`);
    socket.emit("room:left", { roomId });
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

      io.to(roomId).emit("message:new", {
        id: doc._id,
        roomId: doc.roomId,
        userId: doc.userId,
        username: doc.username,
        message: doc.message,
        createdAt: doc.createdAt,
        type: "user",
      });
    } catch (err) {
      console.error("MESSAGE_SAVE_ERROR:", err.message);
      socket.emit("message:error", { message: "Failed to save message." });
    }
  });

  // Drawing events
  socket.on("draw:stroke", ({ roomId, stroke }) => {
    if (!roomId || !stroke) return;
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

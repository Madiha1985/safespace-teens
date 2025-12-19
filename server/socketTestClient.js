const { io } = require("socket.io-client");

const socket = io("http://localhost:5000");

socket.on("connect", () => {
  console.log("Connected as client:", socket.id);

  socket.emit("room:join", { roomId: "study-math" });

  socket.on("room:joined", (data) => {
    console.log("Joined room:", data);

    socket.emit("message:send", {
      roomId: "study-math",
      message: "Hello from test client!",
      username: "testUser",
    });
  });

  socket.on("message:new", (payload) => {
    console.log("New message:", payload);
    process.exit(0);
  });
});

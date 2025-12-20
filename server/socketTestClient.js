const { io } = require("socket.io-client");
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OTQ1NzZkN2JlOWZkYWFjMjdhNjRmY2EiLCJyb2xlIjoidGVlbiIsInVzZXJuYW1lIjoidGVzdHVzZXIxNiIsImlhdCI6MTc2NjE2MDE0NywiZXhwIjoxNzY2NzY0OTQ3fQ.eVJGT6nrs7whEcWcFhoTci4dTIRV61fHddfCXu3vANg";
const socket = io("http://localhost:5000",{
  auth:{token},
});

socket.on("connect", () => {
  console.log("Connected as client:", socket.id);

  socket.emit("room:join", { roomId: "study-math" });

  socket.on("room:joined", (data) => {
    console.log("Joined room:", data);

    socket.emit("message:send", {
      roomId: "study-math",
      message: "Hello from test client! Hello from JWT-secured socket!",
      username: "testUser",
    });
  });

  socket.on("message:new", (payload) => {
    console.log("New message:", payload);
    process.exit(0);
  });
});
socket.on("connect_error", (err) => {
  console.log("Connect error:", err.message);
});
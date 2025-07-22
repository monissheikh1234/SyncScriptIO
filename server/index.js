const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();

app.use(cors());

const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0";

app.get("/", (req, res) => {
  res.send("Server is running");
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://codesynced.vercel.app"],
    methods: ["GET", "POST"],
  },
});

const userSocketMap = {};
const roomData = {};

const getAllConnectedClients = (roomId) => {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => ({
      socketId,
      username: userSocketMap[socketId],
    })
  );
};

io.on("connection", (socket) => {
  // console.log(`User Connected: ${socket.id}`);

  socket.on("join", ({ roomId, username }) => {
    userSocketMap[socket.id] = username;
    // Only join if not already in room
    if (!socket.rooms.has(roomId)) {
      socket.join(roomId);
    }
    const clients = getAllConnectedClients(roomId);

    if (roomData[roomId]) {
      // console.log("Sending sync-data to", socket.id, roomData[roomId]);
      socket.emit("sync-code", roomData[roomId]);
    }

    // Notify all users except the newly joined one
    clients.forEach(({ socketId }) => {
      if (socketId !== socket.id) {
        io.to(socketId).emit("joined", {
          clients,
          username,
          socketId: socket.id,
        });
      }
    });
    // Notify the newly joined user only once
    io.to(socket.id).emit("joined", {
      clients,
      username,
      socketId: socket.id,
    });
  });

  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];
    // Remove user from map first
    delete userSocketMap[socket.id];
    rooms.forEach((roomId) => {
      const clients = getAllConnectedClients(roomId);
      socket.in(roomId).emit("disconnected", {
        socketId: socket.id,
        username: userSocketMap[socket.id],
        clients, // updated clients list, user removed
      });
    });
    socket.leave();
  });

  socket.on("code-change", ({ roomId, code }) => {
    // console.log(`Code received from ${socket.id} for room ${roomId}`);
    roomData[roomId] = {
      ...(roomData[roomId] || {}),
      code,
    };
    socket.in(roomId).emit("code-change", { code });
  });

  socket.on("language-change", ({ roomId, language }) => {
    roomData[roomId] = {
      ...(roomData[roomId] || {}),
      language,
    };
    socket.in(roomId).emit("language-change", { language });
  });
});

server.listen(PORT, () => {
  console.log(`Server running at PORT :${HOST}/${PORT}`);
});
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
    origin: [
      "http://localhost:5173",
      "https://syncscriptio-client.onrender.com",
    ],
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
  console.log("[Backend] New connection:", socket.id);

  socket.on("join", ({ roomId, username }) => {
    const clients = getAllConnectedClients(roomId);
    if (clients.some(client => client.username === username)) {
      console.log(`[Backend] join rejected: username '${username}' already in room '${roomId}' (socketId: ${socket.id})`);
      socket.emit("join-error", { message: "Username already taken in this room." });
      return;
    }
    console.log("[Backend] join event received:", { socketId: socket.id, roomId, username });
    const clientsBefore = getAllConnectedClients(roomId);
    if (clientsBefore.some(client => client.username === username)) {
      socket.emit("join-error", { message: "Username already taken in this room." });
      return;
    }
    userSocketMap[socket.id] = username;
    // Only join if not already in room
    if (!socket.rooms.has(roomId)) {
      socket.join(roomId);
    }
    const clientsAfter = getAllConnectedClients(roomId);
    console.log(`[Backend] User joined: ${username}, Room: ${roomId}, Clients:`, clientsAfter);
    console.log("[Backend] userSocketMap after join:", userSocketMap);

    if (roomData[roomId]) {
      // console.log("Sending sync-data to", socket.id, roomData[roomId]);
      socket.emit("sync-code", roomData[roomId]);
    }

    // Notify all users except the newly joined one
    clientsAfter.forEach(({ socketId }) => {
      if (socketId !== socket.id) {
        io.to(socketId).emit("joined", {
          clients: clientsAfter,
          username,
          socketId: socket.id,
        });
      }
    });

    // Notify the newly joined user only once
    io.to(socket.id).emit("joined", {
      clients: clientsAfter,
      username: null, // Do not show toast for self-join
      socketId: socket.id,
    });
  });

socket.on("leave-room", ({ roomId }, callback) => {
  const username = userSocketMap[socket.id];
  console.log("[Backend] leave-room event received:", { socketId: socket.id, roomId, username });
  console.log("[Backend] userSocketMap before delete:", userSocketMap);
  const clients = getAllConnectedClients(roomId);
  console.log(`[Backend] User left (leave-room): ${username}, Room: ${roomId}, Clients:`, clients);
  socket.in(roomId).emit("disconnected", {
    socketId: socket.id,
    username,
    clients: clients.filter(c => c.socketId !== socket.id),
  });
  delete userSocketMap[socket.id];
  socket.leave(roomId);
  if (callback) callback();
});

  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];
    const username = userSocketMap[socket.id];
    console.log("[Backend] disconnecting event:", { socketId: socket.id, username, rooms });
    console.log("[Backend] userSocketMap before delete:", userSocketMap);
    // For each room, get clients BEFORE deleting the user and before leaving the room
    rooms.forEach((roomId) => {
      const clients = getAllConnectedClients(roomId);
      console.log(`[Backend] User left (disconnect): ${username}, Room: ${roomId}, Clients:`, clients);
      socket.in(roomId).emit("disconnected", {
        socketId: socket.id,
        username,
        clients: clients.filter(c => c.socketId !== socket.id), // Remove disconnecting user from client list
      });
    });
    delete userSocketMap[socket.id];
    // socket.leave() is not needed here, as disconnecting will remove from all rooms
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

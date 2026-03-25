const express = require('express');
const { createServer } = require('https');
const { Server } = require('socket.io');
const path = require('path');
const os = require('os');
const fs = require('fs');

const app = express();
const httpServer = createServer({
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
}, app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow connections from Vite dev server and other devices
    methods: ["GET", "POST"]
  }
});

// Serve static files from the React app build directory
// ...
const rooms = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('createRoom', () => {
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    rooms.set(roomCode, {
      players: [socket.id],
      turn: 'X'
    });
    socket.join(roomCode);
    socket.emit('roomCreated', roomCode);
    console.log(`Room ${roomCode} created by ${socket.id}`);
  });

  socket.on('joinRoom', (roomCode) => {
    const room = rooms.get(roomCode);
    if (room) {
      if (room.players.length < 2) {
        room.players.push(socket.id);
        socket.join(roomCode);
        // Notify Creator (who is strictly the other player in the room)
        socket.to(roomCode).emit('gameStart', { symbol: 'X' }); 
        // Notify Joiner (me)
        socket.emit('gameStart', { symbol: 'O' });
        
        console.log(`User ${socket.id} joined room ${roomCode}`);
      } else {
        socket.emit('error', 'Room full');
      }
    } else {
      socket.emit('error', 'Room not found');
    }
  });

  socket.on('makeMove', ({ roomCode, boardIdx, cellIdx }) => {
    // Broadcast the move to everyone in the room (including sender, for sync)
    // Actually, sender usually updates optimistically. 
    // But let's broadcast to *others* primarily.
    // Or just broadcast 'updateState' if we had full state.
    // Since we don't have full state, we broadcast the move event.
    io.to(roomCode).emit('receiveMove', { boardIdx, cellIdx });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Notify room?
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Available on:');
  const networks = os.networkInterfaces();
  for (const name of Object.keys(networks)) {
    for (const net of networks[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        console.log(`  https://${net.address}:${PORT}`);
      }
    }
  }
});

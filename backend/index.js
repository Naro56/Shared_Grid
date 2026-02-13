const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./db');
const Block = require('./models/Block');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Connect to MongoDB
connectDB();

// Socket logic
io.on('connection', async (socket) => {
  const user = socket.handshake.auth.user;
  console.log('User connected:', user?.id || socket.id);

  // Send initial state
  try {
    const blocks = await Block.find().sort({ y: 1, x: 1 });
    // MongoDB documents don't have 'id' by default (they have _id)
    // But our virtual 'id' will be included in toJSON
    socket.emit('initial-state', blocks);
  } catch (err) {
    console.error('Error fetching initial state:', err);
  }

  // Handle block claim
  socket.on('claim-block', async (data) => {
    const { blockId, userId, userColor } = data;

    try {
      // Atomic find and update: only update if owner_id is still null
      // This handles concurrent clicks safely without explicit transactions
      const updatedBlock = await Block.findOneAndUpdate(
        { _id: blockId, owner_id: null },
        { owner_id: userId, owner_color: userColor },
        { new: true }
      );

      if (!updatedBlock) {
        // Either block doesn't exist or it's already owned
        return;
      }

      // Broadcast update to all clients
      io.emit('block-updated', updatedBlock);
      console.log(`Block ${blockId} claimed by ${userId}`);

    } catch (err) {
      console.error('Update failed:', err.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

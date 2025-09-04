const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

const rooms = {};
const MAX_ROOMS = 100;
const MAX_USERS_PER_ROOM = 20;

// Enhanced logging function
const log = (level, message, data = null) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  if (data) {
    console.log(logMessage, data);
  } else {
    console.log(logMessage);
  }
};

io.on('connection', (socket) => {
  const { roomId } = socket.handshake.query;
  
  log('info', 'New connection attempt', { socketId: socket.id, roomId });
  
  if (!roomId) {
    log('warn', 'Connection rejected: No roomId provided', { socketId: socket.id });
    socket.disconnect();
    return;
  }
  
  // Check room limits
  if (Object.keys(rooms).length >= MAX_ROOMS && !rooms[roomId]) {
    log('warn', 'Connection rejected: Maximum rooms reached', { socketId: socket.id, roomId });
    socket.emit('error', { message: 'Server at capacity. Please try again later.' });
    socket.disconnect();
    return;
  }
  
  // Create room if it doesn't exist
  if (!rooms[roomId]) {
    rooms[roomId] = {
      users: {},
      takenSeats: [],
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };
    log('info', 'New room created', { roomId });
  }
  
  // Check user limit per room
  if (Object.keys(rooms[roomId].users).length >= MAX_USERS_PER_ROOM) {
    log('warn', 'Connection rejected: Room at capacity', { socketId: socket.id, roomId });
    socket.emit('roomFull', { message: 'Room is at maximum capacity' });
    socket.disconnect();
    return;
  }
  
  // Add user with basic info (seat, name, character to be filled later)
  rooms[roomId].users[socket.id] = {
    id: socket.id,
    cameraRotation: { x: 0, y: 0 },
    connectedAt: new Date().toISOString()
  };
  
  socket.join(roomId);
  log('info', 'User connected to room', { socketId: socket.id, roomId, userCount: Object.keys(rooms[roomId].users).length });
  
  // Handle joinRoom: attach name and character
  socket.on('joinRoom', ({ name, character }) => {
    if (!name || !character) {
      log('warn', 'Invalid joinRoom data', { socketId: socket.id, roomId, name, character });
      socket.emit('error', { message: 'Name and character are required' });
      return;
    }
    
    if (rooms[roomId]?.users[socket.id]) {
      rooms[roomId].users[socket.id].name = name.trim();
      rooms[roomId].users[socket.id].character = character;
      rooms[roomId].lastActivity = new Date().toISOString();
      
      log('info', 'User joined room with character', { socketId: socket.id, roomId, name, character });
      
      // Immediately update all users after character selection
      const usersInRoom = Object.values(rooms[roomId].users);
      io.in(roomId).emit('updateUsers', usersInRoom);
    }
  });
  
  // Handle seat assignment
  socket.on('requestSeat', () => {
    const availableSeats = Array.from({ length: 20 }, (_, i) => i)
      .filter(seatIndex => !rooms[roomId].takenSeats.includes(seatIndex));
    
    if (availableSeats.length > 0) {
      const assignedSeat = availableSeats[0];
      rooms[roomId].takenSeats.push(assignedSeat);
      rooms[roomId].users[socket.id].seatIndex = assignedSeat;
      
      socket.emit('seatAssigned', { seatIndex: assignedSeat });
      
      const usersInRoom = Object.values(rooms[roomId].users);
      io.in(roomId).emit('updateUsers', usersInRoom);
    } else {
      socket.emit('roomFull');
    }
  });
  
  // Handle camera rotation updates
  socket.on('cameraUpdate', (data) => {
    if (rooms[roomId]?.users[socket.id]) {
      rooms[roomId].users[socket.id].cameraRotation = data.rotation;
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', (reason) => {
    if (rooms[roomId]?.users[socket.id]) {
      const user = rooms[roomId].users[socket.id];
      const seatIndex = user.seatIndex;
      
      log('info', 'User disconnected', { 
        socketId: socket.id, 
        roomId, 
        reason, 
        name: user.name,
        character: user.character,
        seatIndex 
      });
      
      if (seatIndex !== undefined) {
        rooms[roomId].takenSeats = rooms[roomId].takenSeats.filter(seat => seat !== seatIndex);
      }
      
      delete rooms[roomId].users[socket.id];
      rooms[roomId].lastActivity = new Date().toISOString();
      
      const usersInRoom = Object.values(rooms[roomId].users);
      io.in(roomId).emit('updateUsers', usersInRoom);
      
      if (Object.keys(rooms[roomId].users).length === 0) {
        log('info', 'Room deleted (empty)', { roomId });
        delete rooms[roomId];
      }
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    activeRooms: Object.keys(rooms).length,
    totalUsers: Object.values(rooms).reduce((total, room) => total + Object.keys(room.users).length, 0)
  });
});

// Room statistics endpoint
app.get('/stats', (req, res) => {
  const stats = {
    totalRooms: Object.keys(rooms).length,
    totalUsers: Object.values(rooms).reduce((total, room) => total + Object.keys(room.users).length, 0),
    rooms: Object.entries(rooms).map(([roomId, room]) => ({
      roomId,
      userCount: Object.keys(room.users).length,
      createdAt: room.createdAt,
      lastActivity: room.lastActivity
    }))
  };
  res.json(stats);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  log('info', `Socket server started successfully`, { port: PORT, maxRooms: MAX_ROOMS, maxUsersPerRoom: MAX_USERS_PER_ROOM });
});
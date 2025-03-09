const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/database');
const { errorHandler } = require('./middleware/error');
const { publicRateLimit, strictRateLimit } = require('./middleware/rateLimit');
const config = require('./config');
const mongoose = require('mongoose');

// Initialize Express
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = socketIo(server, {
  cors: {
    origin: config.allowedOrigins,
    methods: ['GET', 'POST']
  }
});

// Connect to MongoDB
connectDB();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors({
  origin: config.allowedOrigins,
  credentials: true
}));

// Apply rate limiting to all routes
app.use(publicRateLimit);

// Static files
app.use(`/${config.uploadDir}`, express.static(config.uploadDir));

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Handle real-time order updates
  socket.on('join-order-room', (orderId) => {
    socket.join(`order-${orderId}`);
  });

  // Handle real-time inventory updates
  socket.on('join-product-room', (productId) => {
    socket.join(`product-${productId}`);
  });

  // Handle user-specific updates
  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io accessible to our routes
app.set('io', io);

// Routes with rate limiting
app.use('/api/v1/auth', strictRateLimit, require('./routes/auth.routes'));
app.use('/api/v1/users', require('./routes/user.routes'));
app.use('/api/v1/products', require('./routes/product.routes'));
app.use('/api/v1/categories', require('./routes/category.routes'));
app.use('/api/v1/orders', require('./routes/order.routes'));
app.use('/api/v1/messages', require('./routes/message.routes'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    services: {
      server: 'up',
      database: mongoose.connection.readyState === 1 ? 'up' : 'down'
    },
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use(errorHandler);

// Start server
const PORT = config.port;
server.listen(PORT, () => {
  console.log(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
}); 
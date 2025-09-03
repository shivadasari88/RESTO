const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const logger = require('./middleware/logger');
const session = require('express-session');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173' // Allow requests from your Vite frontend
}));
app.use(express.json()); // Body parser
app.use(logger); // Use our request logger

// Session middleware (for anonymous customer tracking)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_session_secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

// Serve static files from public directory
app.use(express.static('backend/public'));


// Basic route for testing
app.get('/api/test', (req, res) => {
  res.status(200).json({ success: true, message: 'Hello from QR Restaurant API!' });
});

// Mount routers
app.use('/api/auth', require('./routes/auth'));
app.use('/api/menu', require('./routes/menu')); // Add this line
app.use('/api/orders', require('./routes/orders')); // Add this line

// Handle undefined routes
app.all('*', (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
});

// Error handling middleware (MUST be last!)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections (e.g., database connection errors)
process.on('unhandledRejection', (err, promise) => {
  console.log('Unhandled Rejection at:', promise, 'Reason:', err);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app; // Export for testing later if needed
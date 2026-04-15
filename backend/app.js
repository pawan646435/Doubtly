require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const doubtRoutes = require('./routes/doubts');

const app = express();

connectDB().catch((error) => {
  console.error('✗ Initial DB connection failed:', error.message);
});

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      const isAllowed =
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app');

      callback(isAllowed ? null : new Error('CORS origin not allowed'), isAllowed);
    },
    credentials: true,
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    error: 'Too many requests. Please try again in a minute.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);
app.use('/api/doubts', doubtRoutes);

app.get('/', (req, res) => {
  res.send('✦ Doubtly API is running. Use /api/health for status.');
});

app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Doubtly API ✦',
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Doubtly API is running ✦',
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found.`,
  });
});

app.use((err, req, res, next) => {
  console.error('✗ Unhandled Error:', err.message);

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: 'File too large. Maximum size is 10MB.',
    });
  }

  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      error: `Upload error: ${err.message}`,
    });
  }

  if (err.message === 'CORS origin not allowed') {
    return res.status(403).json({
      success: false,
      error: 'Request origin is not allowed.',
    });
  }

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error.',
  });
});

module.exports = app;

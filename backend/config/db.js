// /home/pawankumar/Desktop/Doubtly/backend/config/db.js
// MongoDB connection configuration

const mongoose = require('mongoose');
const { setDbMode } = require('./dbState');

const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true';
const DB_FALLBACK_MODE = (
  process.env.DB_FALLBACK_MODE || (isVercel ? 'disabled' : 'file')
).toLowerCase();
let connectionPromise = null;

const connectDB = async () => {
  if (connectionPromise) {
    return connectionPromise;
  }

  if (!process.env.MONGODB_URI) {
    if (DB_FALLBACK_MODE === 'file') {
      setDbMode('file');
      console.warn('✦ MONGODB_URI is not set. Using local file storage fallback.');
      return 'file';
    }

    setDbMode('disconnected');
    throw new Error('MONGODB_URI is required for this environment.');
  }

  try {
    connectionPromise = mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 2000, // Reduced to fail faster if offline
      socketTimeoutMS: 45000,
    });
    const conn = await connectionPromise;

    setDbMode('mongo');
    console.log(`✦ MongoDB Connected: ${conn.connection.host}`);
    return 'mongo';
  } catch (error) {
    connectionPromise = null;

    if (DB_FALLBACK_MODE === 'file') {
      setDbMode('file');
      console.warn(`✦ MongoDB unavailable. Using local file storage fallback.`);
      console.warn(`  Reason: ${error.message}`);
      return 'file';
    }

    setDbMode('disconnected');
    throw new Error(`MongoDB Connection Error: ${error.message}`);
  }
};

module.exports = connectDB;

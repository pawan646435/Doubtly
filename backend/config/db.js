// /home/pawankumar/Desktop/Doubtly/backend/config/db.js
// MongoDB connection configuration

const mongoose = require('mongoose');
const { setDbMode } = require('./dbState');

const DB_FALLBACK_MODE = (process.env.DB_FALLBACK_MODE || 'file').toLowerCase();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 2000, // Reduced to fail faster if offline
      socketTimeoutMS: 45000,
    });

    setDbMode('mongo');
    console.log(`✦ MongoDB Connected: ${conn.connection.host}`);
    return 'mongo';
  } catch (error) {
    if (DB_FALLBACK_MODE === 'file') {
      setDbMode('file');
      console.warn(`✦ MongoDB unavailable. Using local file storage fallback.`);
      console.warn(`  Reason: ${error.message}`);
      return 'file';
    }

    setDbMode('disconnected');
    console.error(`✗ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

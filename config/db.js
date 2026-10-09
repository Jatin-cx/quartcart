'use strict';

const mongoose = require('mongoose');

/**
 * Connect to MongoDB with connection error handling.
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('[Database Error] MONGODB_URI is not set in environment variables.');
    return;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log(`[Database Connected] MongoDB connected successfully to: ${conn.connection.name || 'Atlas'}`);
  } catch (err) {
    console.error(`[Database Error] MongoDB connection failed: ${err.message}`);
    console.log('   Ensure IP 0.0.0.0/0 is whitelisted in MongoDB Atlas Network Access.');
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('[Database Warning] MongoDB connection lost.');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err.message);
});

module.exports = connectDB;

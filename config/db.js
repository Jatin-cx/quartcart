'use strict';

const mongoose = require('mongoose');

let retries = 0;
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

/**
 * Connect to MongoDB with retry logic.
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce-store';

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    retries = 0;
    console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);
  } catch (err) {
    retries += 1;
    console.error(`❌ MongoDB connection failed (attempt ${retries}/${MAX_RETRIES}): ${err.message}`);

    if (retries < MAX_RETRIES) {
      console.log(`   Retrying in ${RETRY_DELAY_MS / 1000}s...`);
      setTimeout(connectDB, RETRY_DELAY_MS);
    } else {
      console.error('   Max retries reached. Exiting process.');
      process.exit(1);
    }
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
  connectDB();
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err.message);
});

module.exports = connectDB;

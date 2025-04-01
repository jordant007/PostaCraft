// src/lib/db.js
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

console.log('MONGODB_URI:', MONGODB_URI); // Debug log to verify the variable

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable in your .env file');
}

let cachedConnection = null;

export async function connectToDatabase() {
  if (cachedConnection && mongoose.connection.readyState >= 1) {
    console.log('Using cached MongoDB connection');
    return cachedConnection;
  }

  try {
    console.log('Connecting to MongoDB...');
    const connection = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    cachedConnection = connection;
    console.log('MongoDB connected successfully');
    return connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error('Failed to connect to MongoDB: ' + error.message);
  }
}
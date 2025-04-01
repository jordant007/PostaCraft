// src/models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: false, // Optional, since Google users won't have a password
  },
  authMethod: {
    type: String,
    enum: ['credentials', 'google'],
    default: 'credentials',
  },
  subscription: {
    type: String,
    enum: ['free', 'premium', 'pro'],
    default: 'free',
  },
  paypalSubscriptionId: {
    type: String,
    default: null,
  },
  subscriptionEnd: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Export a function to get the model, ensuring it’s only compiled once
export const getUserModel = async () => {
  if (mongoose.models.User) {
    return mongoose.models.User;
  }
  return mongoose.model('User', userSchema);
};

// Keep the default export for backward compatibility
export default mongoose.models.User || mongoose.model('User', userSchema);
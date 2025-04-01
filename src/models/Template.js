// src/models/Template.js
import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['Event Flyer', 'Business Poster', 'Other'], // Example categories
  },
  elements: [{
    type: {
      type: String,
      enum: ['text', 'image', 'shape'],
      required: true,
    },
    content: {
      type: String,
      required: true, // Text content or image URL
    },
    x: {
      type: Number,
      required: true,
      default: 0,
    },
    y: {
      type: Number,
      required: true,
      default: 0,
    },
    width: {
      type: Number,
      default: null, // Optional for text, required for images/shapes
    },
    height: {
      type: Number,
      default: null, // Optional for text, required for images/shapes
    },
    style: {
      font: { type: String, default: '16px Arial' }, // For text
      color: { type: String, default: '#000000' },   // For text or shape fill
      rotation: { type: Number, default: 0 },        // Rotation in degrees
    },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: false, // Optional, for user-created templates
  },
});

// Prevent model recompilation in development (Next.js hot reload)
export default mongoose.models.Template || mongoose.model('Template', templateSchema);
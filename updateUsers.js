// updateUsers.js
import mongoose from 'mongoose';
import { connectToDatabase } from './src/lib/db';

async function updateUsers() {
  try {
    await connectToDatabase();
    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
      email: String,
      name: String,
      password: String,
      authMethod: String,
      subscription: String,
      paypalSubscriptionId: String,
      subscriptionEnd: Date,
      createdAt: Date,
    }));

    // Update users without authMethod
    await User.updateMany(
      { authMethod: { $exists: false } },
      { $set: { authMethod: 'google' } } // Assume existing users are from Google if no password
    );

    console.log('Users updated successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error updating users:', error);
    process.exit(1);
  }
}

updateUsers();
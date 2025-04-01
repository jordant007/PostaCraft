// src/app/api/subscribe/route.js
import { connectToDatabase } from '../../../lib/db';
import { getUserModel } from '../../../models/User';

export async function POST(request) {
  try {
    await connectToDatabase();
    const User = await getUserModel();

    const { email, planId, subscriptionId } = await request.json();

    if (!email || !planId || !subscriptionId) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const subscriptionEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const subscriptionType = planId === 'free' ? 'free' : planId === 'P-3F1234567890' ? 'premium' : 'pro';

    const user = await User.findOneAndUpdate(
      { email },
      {
        subscription: subscriptionType,
        paypalSubscriptionId: subscriptionId,
        subscriptionEnd,
      },
      { new: true }
    );

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: 'Subscription activated successfully' }), { status: 200 });
  } catch (error) {
    console.error('Error in /api/subscribe:', error.message);
    return new Response(JSON.stringify({ error: `Failed to activate subscription: ${error.message}` }), { status: 500 });
  }
}
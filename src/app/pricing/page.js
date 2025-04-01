// src/app/pricing/page.js
"use client";

import { useSession } from 'next-auth/react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useState } from 'react';

const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

// Replace these with your actual PayPal plan IDs from the sandbox account
const PREMIUM_PLAN_ID = 'P-8M095002D27322503M7WBCJQ'; // Example format, replace with your actual Premium plan ID
const PRO_PLAN_ID = 'P-3E799484N5676905FM7WBAVY'; // Example format, replace with your actual Pro plan ID

export default function Pricing() {
  const { data: session } = useSession();
  const [message, setMessage] = useState('');

  const createSubscription = async (data, actions) => {
    try {
      return actions.subscription.create({
        plan_id: data.plan_id,
      });
    } catch (error) {
      console.error('Error in createSubscription:', error);
      throw new Error(`Create Subscription failed: ${error.message}`);
    }
  };

  const onApprove = async (data, actions) => {
    if (!session) {
      setMessage('You must be signed in to subscribe.');
      return;
    }

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: session.user.email,
          planId: data.plan_id,
          subscriptionId: data.subscriptionID,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(result.message);
      } else {
        setMessage(result.error || 'Failed to activate subscription');
      }
    } catch (error) {
      console.error('Error in onApprove:', error.message);
      setMessage(`Failed to activate subscription: ${error.message}`);
    }
  };

  const onError = (err) => {
    console.error('PayPal Button Error:', err);
    setMessage(`Payment failed: Create Subscription API response error: ${JSON.stringify(err)}`);
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Pricing Plans</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-semibold mb-2">Free</h2>
          <p className="text-4xl font-bold mb-4">$0</p>
          <p>Basic templates & tools</p>
          <button className="mt-4 bg-primary text-white px-4 py-2 rounded">Get Started</button>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg text-center border-2 border-accent">
          <h2 className="text-2xl font-semibold mb-2">Premium</h2>
          <p className="text-4xl font-bold mb-4">$9.99/mo</p>
          <p>All templates, advanced tools, exports</p>
          {paypalClientId ? (
            <PayPalScriptProvider
              options={{
                'client-id': paypalClientId,
                components: 'buttons',
                intent: 'subscription',
                vault: true,
              }}
            >
              <PayPalButtons
                createSubscription={(data, actions) =>
                  createSubscription({ plan_id: PREMIUM_PLAN_ID }, actions)
                }
                onApprove={onApprove}
                onError={onError}
                style={{ layout: 'vertical', color: 'gold' }}
              />
            </PayPalScriptProvider>
          ) : (
            <p className="text-red-500">PayPal Client ID not configured</p>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-semibold mb-2">Pro</h2>
          <p className="text-4xl font-bold mb-4">$19.99/mo</p>
          <p>Team features, priority support</p>
          {paypalClientId ? (
            <PayPalScriptProvider
              options={{
                'client-id': paypalClientId,
                components: 'buttons',
                intent: 'subscription',
                vault: true,
              }}
            >
              <PayPalButtons
                createSubscription={(data, actions) =>
                  createSubscription({ plan_id: PRO_PLAN_ID }, actions)
                }
                onApprove={onApprove}
                onError={onError}
                style={{ layout: 'vertical', color: 'gold' }}
              />
            </PayPalScriptProvider>
          ) : (
            <p className="text-red-500">PayPal Client ID not configured</p>
          )}
        </div>
      </div>
      {message && <p className="text-center mt-4">{message}</p>}
    </div>
  );
}
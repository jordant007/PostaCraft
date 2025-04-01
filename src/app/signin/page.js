// src/app/signin/page.js
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
      action: 'signin',
    });

    if (res.error) {
      setError(res.error);
    } else {
      setSuccess('Sign-in successful! Redirecting...');
      setTimeout(() => router.push('/'), 2000); // Redirect to home page
    }
  };

  const handleGoogleSignIn = async () => {
    await signIn('google', { callbackUrl: '/' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-6" style={{ color: '#1a202c' }}>
          Sign In
        </h1>
        {error && (
          <p className="text-center mb-4" style={{ color: '#e53e3e' }}>
            {error}
          </p>
        )}
        {success && (
          <p className="text-center mb-4" style={{ color: '#38a169' }}>
            {success}
          </p>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block mb-2" style={{ color: '#2d3748' }}>
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ borderColor: '#cbd5e0', backgroundColor: '#f7fafc' }}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block mb-2" style={{ color: '#2d3748' }}>
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ borderColor: '#cbd5e0', backgroundColor: '#f7fafc' }}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full p-3 rounded-lg font-semibold border-4"
            style={{
              backgroundColor: '#3182ce', // Blue background
              color: '#ffffff', // White text
              borderColor: '#ff0000', // Red border for debugging
            }}
          >
            Sign In
          </button>
        </form>
        <button
          onClick={handleGoogleSignIn}
          className="w-full mt-4 p-3 rounded-lg font-semibold border-4"
          style={{
            backgroundColor: '#1a202c', // Dark gray background
            color: '#ffffff', // White text
            borderColor: '#ff0000', // Red border for debugging
          }}
        >
          Sign In with Google
        </button>
        <p className="text-center mt-4" style={{ color: '#4a5568' }}>
          Don’t have an account?{' '}
          <Link href="/signup" className="underline" style={{ color: '#3182ce' }}>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
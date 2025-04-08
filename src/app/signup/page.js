// src/app/signup/page.js
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
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
      name,
      action: 'signup',
    });

    if (res.error) {
      setError(res.error);
    } else {
      setSuccess('Registration successful! Redirecting to sign-in page...');
      setTimeout(() => router.push(`/signin?email=${encodeURIComponent(email)}`), 2000);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setSuccess('');
    await signIn('google', { callbackUrl: `/signin` });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-6" style={{ color: '#1a202c' }}>
          Sign Up
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
            <label htmlFor="name" className="block text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ borderColor: '#cbd5e0', backgroundColor: '#f7fafc' }}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 mb-2">
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
            <label htmlFor="password" className="block text-gray-700 mb-2">
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
              backgroundColor: '#3182ce',
              color: '#ffffff',
              borderColor: '#ff0000',
            }}
          >
            Sign Up
          </button>
        </form>
        <button
          onClick={handleGoogleSignUp}
          className="w-full mt-4 p-3 rounded-lg font-semibold border-4"
          style={{
            backgroundColor: '#1a202c',
            color: '#ffffff',
            borderColor: '#ff0000',
          }}
        >
          Sign Up with Google
        </button>
        <p className="text-center mt-4" style={{ color: '#4a5568' }}>
          Already have an account?{' '}
          <Link href="/signin" className="underline" style={{ color: '#3182ce' }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
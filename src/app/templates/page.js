// src/app/templates/page.js
"use client";

import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';

export default function Templates() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="mb-4">
            Please{' '}
            <button
              onClick={() => signIn()}
              className="text-blue-500 hover:underline"
            >
              sign in
            </button>{' '}
            to access templates.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Choose a Template</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/design?template=event" className="bg-gray-200 p-4 rounded-lg text-center hover:bg-gray-300">
          Event Flyer
        </Link>
        <Link href="/design?template=business" className="bg-gray-200 p-4 rounded-lg text-center hover:bg-gray-300">
          Business Poster
        </Link>
        <Link href="/design?template=social" className="bg-gray-200 p-4 rounded-lg text-center hover:bg-gray-300">
          Social Media Graphic
        </Link>
      </div>
    </div>
  );
}
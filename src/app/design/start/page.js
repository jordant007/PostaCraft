// src/app/design/start/page.js
"use client";

import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';

export default function DesignStart() {
  const { data: session } = useSession();
  const router = useRouter();

  // Define design categories and their dimensions
  const designCategories = [
    { name: 'Poster Flyer Letter', width: 816, height: 1056 }, // 8.5x11 inches at 96 DPI
    { name: 'Instagram Reel Post', width: 1080, height: 1920 },
    { name: 'Event Flyer', width: 800, height: 1200 },
    { name: 'Business Poster', width: 800, height: 1200 },
    { name: 'Social Media Graphic', width: 1080, height: 1080 },
  ];

  const handleCategorySelect = (category) => {
    // Redirect to the design editor with the selected category as a query parameter
    router.push(`/design?category=${encodeURIComponent(category.name)}`);
  };

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
            to start designing.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center mb-8">Choose a Design Category</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {designCategories.map((category) => (
          <div
            key={category.name}
            onClick={() => handleCategorySelect(category)}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg cursor-pointer transition-shadow duration-200 flex flex-col items-center"
          >
            <div className="w-24 h-24 bg-gray-200 rounded-md mb-4 flex items-center justify-center">
              <span className="text-gray-500 text-sm text-center">
                {category.name}
              </span>
            </div>
            <h2 className="text-lg font-semibold">{category.name}</h2>
            <p className="text-gray-600 text-sm">
              {category.width} x {category.height} px
            </p>
          </div>
        ))}
        <div
          onClick={() => router.push('/design?category=Custom')}
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg cursor-pointer transition-shadow duration-200 flex flex-col items-center"
        >
          <div className="w-24 h-24 bg-gray-200 rounded-md mb-4 flex items-center justify-center">
            <span className="text-gray-500 text-sm text-center">Custom</span>
          </div>
          <h2 className="text-lg font-semibold">Custom Dimensions</h2>
          <p className="text-gray-600 text-sm">Set your own size</p>
        </div>
      </div>
    </div>
  );
}
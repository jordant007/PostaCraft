// src/app/templates/page.js
"use client";

import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link'; // Add Link for the "Create New Design" button
import { templates } from '../../components/TemplateSelector';

export default function Templates() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleSelectTemplate = (template) => {
    localStorage.setItem('selectedTemplate', JSON.stringify(template.elements));
    // Include the category in the redirect URL
    router.push(`/design?category=${encodeURIComponent(template.category)}`);
  };

  if (status === 'loading') return <p className="text-center py-20">Loading...</p>;
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
            to view templates.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center">Template Gallery</h1>
        <Link href="/design/start">
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Create New Design
          </button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {templates.map((template) => (
          <div key={template.id} className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center">
            <Image
              src={template.previewImage}
              alt={template.name}
              width={300}
              height={200}
              className="rounded-md mb-4 object-cover"
              onError={(e) => (e.target.src = '/placeholder-image.jpg')}
            />
            <h2 className="text-xl font-semibold mb-2">{template.name}</h2>
            <button
              onClick={() => handleSelectTemplate(template)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Use Template
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
// src/app/templates/page.js
"use client"; // Mark as Client Component

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { templates } from '../../components/TemplateSelector';

export default function Templates() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleSelectTemplate = (template) => {
    localStorage.setItem('selectedTemplate', JSON.stringify(template.elements));
    router.push('/design');
  };

  if (status === 'loading') return <p>Loading...</p>;
  if (!session) return <p className="text-center py-20">Please <a href="/api/auth/signin" className="text-primary">sign in</a> to view templates.</p>;

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Template Gallery</h1>
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
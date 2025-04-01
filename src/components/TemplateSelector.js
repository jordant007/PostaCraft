// src/components/TemplateSelector.js
"use client";

export const templates = [
  {
    id: 'event-flyer-1',
    name: 'Event Flyer 1',
    previewImage: '/templates/event-flyer-1.png',
    elements: [
      {
        id: '1',
        type: 'text',
        x: 50,
        y: 50,
        content: 'Event Title',
        style: { color: '#000000', fontSize: '32px', fontWeight: 'bold', fontFamily: 'Arial', textAlign: 'center', rotation: 0 },
      },
      {
        id: '2',
        type: 'text',
        x: 50,
        y: 100,
        content: 'Date: TBD | Location: TBD',
        style: { color: '#555555', fontSize: '16px', fontFamily: 'Arial', textAlign: 'center', rotation: 0 },
      },
      {
        id: '3',
        type: 'shape',
        x: 300,
        y: 50,
        content: '',
        style: { width: 100, height: 100, backgroundColor: '#ff0000', borderRadius: '50%', rotation: 0 },
        shapeType: 'circle',
      },
    ],
  },
  {
    id: 'business-poster-1',
    name: 'Business Poster 1',
    previewImage: '/templates/business-poster-1.png',
    elements: [
      {
        id: '1',
        type: 'text',
        x: 50,
        y: 50,
        content: 'Your Business Name',
        style: { color: '#000000', fontSize: '28px', fontWeight: 'bold', fontFamily: 'Arial', textAlign: 'left', rotation: 0 },
      },
      {
        id: '2',
        type: 'text',
        x: 50,
        y: 90,
        content: 'Contact Us: (123) 456-7890',
        style: { color: '#333333', fontSize: '14px', fontFamily: 'Arial', textAlign: 'left', rotation: 0 },
      },
      {
        id: '3',
        type: 'image',
        x: 200,
        y: 150,
        content: '/placeholder-image.jpg',
        style: { width: 150, height: 150, rotation: 0 },
      },
    ],
  },
  {
    id: 'event-flyer-2',
    name: 'Event Flyer 2',
    previewImage: '/templates/event-flyer-2.png',
    elements: [
      {
        id: '1',
        type: 'text',
        x: 50,
        y: 50,
        content: 'Summer Festival',
        style: { color: '#ff4500', fontSize: '36px', fontWeight: 'bold', fontFamily: 'Georgia', textAlign: 'center', rotation: 0 },
      },
      {
        id: '2',
        type: 'shape',
        x: 100,
        y: 150,
        content: '',
        style: { width: 80, height: 80, backgroundColor: '#00ff00', borderRadius: '0%', rotation: 0 },
        shapeType: 'square',
      },
      {
        id: '3',
        type: 'text',
        x: 50,
        y: 250,
        content: 'Join us for a fun day!',
        style: { color: '#000000', fontSize: '20px', fontFamily: 'Arial', textAlign: 'center', rotation: 0 },
      },
    ],
  },
];

export default function TemplateSelector({ setElements }) {
  const applyTemplate = (template) => {
    setElements(template.elements);
  };

  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold mb-2">Select a Template</h2>
      <div className="flex gap-2">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => applyTemplate(template)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            {template.name}
          </button>
        ))}
      </div>
    </div>
  );
}
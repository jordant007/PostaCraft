// src/app/design/page.js
"use client";

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Canvas from '../../components/Canvas';
import Toolbar from '../../components/Toolbar';
import TemplateSelector from '../../components/TemplateSelector';

export default function Design() {
  const { data: session, status } = useSession();
  const [elements, setElements] = useState([]);
  const [designs, setDesigns] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [history, setHistory] = useState([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [backgroundColor, setBackgroundColor] = useState('#f0f0f0');

  // Load selected template from localStorage on mount
  useEffect(() => {
    const selectedTemplate = localStorage.getItem('selectedTemplate');
    if (selectedTemplate) {
      const templateElements = JSON.parse(selectedTemplate);
      setElements(templateElements);
      setHistory([templateElements]);
      setHistoryIndex(0);
      // Clear the selected template from localStorage to prevent reloading on refresh
      localStorage.removeItem('selectedTemplate');
    }
  }, []);

  useEffect(() => {
    if (session) {
      fetch('/api/designs')
        .then((res) => res.json())
        .then((data) => setDesigns(data))
        .catch((err) => console.error('Error fetching designs:', err));
    }
  }, [session]);

  const addToHistory = (newElements) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newElements);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
      setElements(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1);
      setElements(history[historyIndex + 1]);
    }
  };

  const saveDesign = async () => {
    try {
      const res = await fetch('/api/designs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ elements }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      alert('Design saved successfully!');
      setDesigns((prev) => [...prev, { _id: data.designId, elements }]);
    } catch (error) {
      console.error('Error saving design:', error);
      alert('Failed to save design.');
    }
  };

  const loadDesign = (designElements) => {
    setElements(designElements);
    setSelectedElement(null);
    setHistory([designElements]);
    setHistoryIndex(0);
  };

  if (status === 'loading') return <p>Loading...</p>;
  if (!session) return <p className="text-center py-20">Please <a href="/api/auth/signin" className="text-primary">sign in</a> to access the design editor.</p>;

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Design Your Poster</h1>
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-2 mb-4">
          <button
            onClick={undo}
            disabled={historyIndex === 0}
            className="px-4 py-2 bg-gray-500 text-white rounded disabled:bg-gray-300"
          >
            Undo
          </button>
          <button
            onClick={redo}
            disabled={historyIndex === history.length - 1}
            className="px-4 py-2 bg-gray-500 text-white rounded disabled:bg-gray-300"
          >
            Redo
          </button>
        </div>
        <Toolbar
          elements={elements}
          setElements={setElements}
          selectedElement={selectedElement}
          setSelectedElement={setSelectedElement}
          setBackgroundColor={setBackgroundColor}
          addToHistory={addToHistory}
        />
        <TemplateSelector setElements={setElements} />
        <Canvas
          elements={elements}
          setElements={setElements}
          setSelectedElement={setSelectedElement}
          addToHistory={addToHistory}
          backgroundColor={backgroundColor}
        />
        <div className="mt-4 flex gap-2">
          <button
            onClick={saveDesign}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Save Design
          </button>
          {designs.length > 0 && (
            <div className="flex gap-2">
              {designs.map((design) => (
                <button
                  key={design._id}
                  onClick={() => loadDesign(design.elements)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Load Design {design._id.slice(-4)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
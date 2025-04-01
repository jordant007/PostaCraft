// src/components/Toolbar.js
"use client";

import { useState } from 'react';
import { SketchPicker } from 'react-color';
import axios from 'axios';
import { FaTrash, FaCopy, FaItalic, FaUnderline } from 'react-icons/fa';

export default function Toolbar({ elements, setElements, selectedElement, setSelectedElement, setBackgroundColor, addToHistory }) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [backgroundColor, setBgColor] = useState('#f0f0f0');
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontWeight, setFontWeight] = useState('normal');
  const [textAlign, setTextAlign] = useState('left');
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [shapeType, setShapeType] = useState('square');
  const [textContent, setTextContent] = useState('');

  const fontFamilies = ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia'];
  const fontWeights = ['normal', 'bold', 'bolder', 'lighter', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
  const textAlignments = ['left', 'center', 'right'];
  const shapeTypes = ['square', 'circle', 'triangle', 'star', 'rectangle'];

  const addElement = (type, imageUrl = null) => {
    const newElement = {
      id: Date.now().toString(),
      type,
      x: 50,
      y: 50,
      content: type === 'text' ? 'New Text' : type === 'image' && imageUrl ? imageUrl : type === 'image' ? '/placeholder-image.jpg' : '',
      style: {
        color: type === 'text' ? selectedColor : undefined,
        fontSize: type === 'text' ? `${fontSize}px` : undefined,
        fontFamily: type === 'text' ? fontFamily : undefined,
        fontWeight: type === 'text' ? fontWeight : undefined,
        textAlign: type === 'text' ? textAlign : undefined,
        fontStyle: type === 'text' && isItalic ? 'italic' : 'normal',
        textDecoration: type === 'text' && isUnderline ? 'underline' : 'none',
        width: type === 'image' ? 100 : type === 'shape' ? 50 : undefined,
        height: type === 'image' ? 100 : type === 'shape' ? 50 : undefined,
        backgroundColor: type === 'shape' ? selectedColor : undefined,
        borderRadius: type === 'shape' && shapeType === 'circle' ? '50%' : '0%',
        rotation: 0, // Initialize rotation
      },
      shapeType: type === 'shape' ? shapeType : undefined, // Store shape type for rendering
    };
    setElements((prev) => {
      const newElements = [...prev, newElement];
      addToHistory(newElements); // Add to history for undo/redo
      return newElements;
    });
    setSelectedElement(newElement.id);
  };

  const updateElementStyle = (property, value) => {
    if (!selectedElement) return;
    setElements((prev) => {
      const newElements = prev.map((el) =>
        el.id === selectedElement
          ? { ...el, style: { ...el.style, [property]: value } }
          : el
      );
      addToHistory(newElements);
      return newElements;
    });
  };

  const updateTextContent = (newContent) => {
    if (!selectedElement) return;
    setElements((prev) => {
      const newElements = prev.map((el) =>
        el.id === selectedElement && el.type === 'text'
          ? { ...el, content: newContent }
          : el
      );
      addToHistory(newElements);
      return newElements;
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const imageUrl = res.data.url;
      addElement('image', imageUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image.');
    }
  };

  const deleteElement = () => {
    if (!selectedElement) return;
    setElements((prev) => {
      const newElements = prev.filter((el) => el.id !== selectedElement);
      addToHistory(newElements);
      return newElements;
    });
    setSelectedElement(null);
  };

  const duplicateElement = () => {
    if (!selectedElement) return;
    const elementToDuplicate = elements.find((el) => el.id === selectedElement);
    if (!elementToDuplicate) return;

    const newElement = {
      ...elementToDuplicate,
      id: Date.now().toString(),
      x: elementToDuplicate.x + 20,
      y: elementToDuplicate.y + 20,
    };
    setElements((prev) => {
      const newElements = [...prev, newElement];
      addToHistory(newElements);
      return newElements;
    });
    setSelectedElement(newElement.id);
  };

  const selectedElementData = elements.find((el) => el.id === selectedElement);

  return (
    <div className="flex flex-wrap gap-2 mb-4 p-2 bg-gray-200 rounded-lg">
      <button
        onClick={() => addElement('text')}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Add Text
      </button>
      <label className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer">
        Add Image
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </label>
      <div className="flex items-center gap-2">
        <button
          onClick={() => addElement('shape')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Shape
        </button>
        <select
          value={shapeType}
          onChange={(e) => setShapeType(e.target.value)}
          className="p-2 border rounded"
        >
          {shapeTypes.map((type) => (
            <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
          ))}
        </select>
      </div>
      <div className="relative">
        <button
          onClick={() => setShowColorPicker(!showColorPicker)}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Pick Color
        </button>
        {showColorPicker && (
          <div className="absolute z-10 mt-2">
            <SketchPicker
              color={selectedColor}
              onChangeComplete={(color) => {
                setSelectedColor(color.hex);
                if (selectedElement) {
                  const element = elements.find((el) => el.id === selectedElement);
                  if (element?.type === 'text') {
                    updateElementStyle('color', color.hex);
                  } else if (element?.type === 'shape') {
                    updateElementStyle('backgroundColor', color.hex);
                  }
                }
              }}
            />
          </div>
        )}
      </div>
      <div className="relative">
        <button
          onClick={() => setShowBgColorPicker(!showBgColorPicker)}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Background Color
        </button>
        {showBgColorPicker && (
          <div className="absolute z-10 mt-2">
            <SketchPicker
              color={backgroundColor}
              onChangeComplete={(color) => {
                setBgColor(color.hex);
                setBackgroundColor(color.hex);
              }}
            />
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <label htmlFor="fontSize" className="text-gray-700">Font Size:</label>
        <input
          type="number"
          id="fontSize"
          value={fontSize}
          onChange={(e) => {
            const newSize = Number(e.target.value);
            setFontSize(newSize);
            updateElementStyle('fontSize', `${newSize}px`);
          }}
          className="w-16 p-1 border rounded"
          min="8"
          max="72"
        />
      </div>
      {selectedElementData?.type === 'text' && (
        <>
          <div className="flex items-center gap-2">
            <label htmlFor="textContent" className="text-gray-700">Edit Text:</label>
            <input
              type="text"
              id="textContent"
              value={selectedElementData.content}
              onChange={(e) => {
                setTextContent(e.target.value);
                updateTextContent(e.target.value);
              }}
              className="p-1 border rounded"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="fontFamily" className="text-gray-700">Font Family:</label>
            <select
              id="fontFamily"
              value={fontFamily}
              onChange={(e) => {
                setFontFamily(e.target.value);
                updateElementStyle('fontFamily', e.target.value);
              }}
              className="p-1 border rounded"
            >
              {fontFamilies.map((font) => (
                <option key={font} value={font}>{font}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="fontWeight" className="text-gray-700">Font Weight:</label>
            <select
              id="fontWeight"
              value={fontWeight}
              onChange={(e) => {
                setFontWeight(e.target.value);
                updateElementStyle('fontWeight', e.target.value);
              }}
              className="p-1 border rounded"
            >
              {fontWeights.map((weight) => (
                <option key={weight} value={weight}>{weight}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="textAlign" className="text-gray-700">Align:</label>
            <select
              id="textAlign"
              value={textAlign}
              onChange={(e) => {
                setTextAlign(e.target.value);
                updateElementStyle('textAlign', e.target.value);
              }}
              className="p-1 border rounded"
            >
              {textAlignments.map((align) => (
                <option key={align} value={align}>{align.charAt(0).toUpperCase() + align.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsItalic(!isItalic);
                updateElementStyle('fontStyle', isItalic ? 'normal' : 'italic');
              }}
              className={`p-2 ${isItalic ? 'bg-blue-500 text-white' : 'bg-gray-300'} rounded`}
            >
              <FaItalic />
            </button>
            <button
              onClick={() => {
                setIsUnderline(!isUnderline);
                updateElementStyle('textDecoration', isUnderline ? 'none' : 'underline');
              }}
              className={`p-2 ${isUnderline ? 'bg-blue-500 text-white' : 'bg-gray-300'} rounded`}
            >
              <FaUnderline />
            </button>
          </div>
        </>
      )}
      {selectedElement && (
        <div className="flex items-center gap-2">
          <button
            onClick={deleteElement}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            <FaTrash />
          </button>
          <button
            onClick={duplicateElement}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            <FaCopy />
          </button>
        </div>
      )}
    </div>
  );
}
// src/components/Canvas.js
"use client";

import { useState, useRef } from 'react';
import { DndContext, useDraggable } from '@dnd-kit/core';
import { Resizable } from 'react-resizable';
import Image from 'next/image'; // Import Image from next/image
import html2canvas from 'html2canvas';
import 'react-resizable/css/styles.css';

function DraggableElement({ element, onDragEnd, onClick, onResize, onRotate, onZIndexChange, selectedElement, elements, setElements }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: element.id,
  });

  const style = {
    position: 'absolute',
    left: element.x,
    top: element.y,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0) rotate(${element.style.rotation}deg)` : `rotate(${element.style.rotation}deg)`,
    zIndex: elements.findIndex((el) => el.id === element.id),
    width: element.style.width || (element.type === 'text' ? 'auto' : 100), // Ensure width is set
    height: element.style.height || (element.type === 'text' ? 'auto' : 100), // Ensure height is set
    ...element.style,
  };

  const handleResize = (e, { size }) => {
    e.stopPropagation(); // Prevent drag events from interfering
    console.log('Resizing element:', element.id, 'New size:', size); // Debug log
    onResize(element.id, size.width, size.height);
  };

  const handleRotate = (direction) => {
    onRotate(element.id, direction);
  };

  const handleZIndexChange = (direction) => {
    onZIndexChange(element.id, direction);
  };

  const renderShape = () => {
    switch (element.shapeType) {
      case 'triangle':
        return (
          <svg width={element.style.width} height={element.style.height} viewBox="0 0 100 100">
            <polygon points="50,0 100,100 0,100" fill={element.style.backgroundColor} />
          </svg>
        );
      case 'star':
        return (
          <svg width={element.style.width} height={element.style.height} viewBox="0 0 100 100">
            <polygon points="50,0 61,35 98,35 68,58 79,95 50,72 21,95 32,58 2,35 39,35" fill={element.style.backgroundColor} />
          </svg>
        );
      case 'rectangle':
        return (
          <div
            style={{
              width: element.style.width,
              height: element.style.height * 0.6,
              backgroundColor: element.style.backgroundColor,
              borderRadius: '0%',
            }}
          />
        );
      case 'circle':
        return (
          <div
            style={{
              width: element.style.width,
              height: element.style.height,
              backgroundColor: element.style.backgroundColor,
              borderRadius: '50%',
            }}
          />
        );
      case 'square':
      default:
        return (
          <div
            style={{
              width: element.style.width,
              height: element.style.height,
              backgroundColor: element.style.backgroundColor,
              borderRadius: '0%',
            }}
          />
        );
    }
  };

  // Only allow resizing for images and shapes
  const isResizable = element.type === 'image' || element.type === 'shape';

  return (
    <Resizable
      width={element.style.width || 100}
      height={element.style.height || 100}
      onResize={handleResize}
      minConstraints={[30, 30]} // Adjusted for better usability
      maxConstraints={[600, 600]}
      resizeHandles={isResizable ? ['se', 'sw', 'ne', 'nw'] : []} // Multiple handles for images and shapes
      handle={(h) => (
        <span
          className={`react-resizable-handle react-resizable-handle-${h} bg-blue-500 w-3 h-3 rounded-full absolute z-10 cursor-${h}-resize`}
          style={{
            display: isResizable && element.id === selectedElement ? 'block' : 'none', // Show handles only for selected element
          }}
        />
      )}
    >
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className={`cursor-move ${element.id === selectedElement ? 'ring-2 ring-blue-500' : ''}`}
        onClick={(e) => {
          e.stopPropagation(); // Prevent click events from bubbling up
          onClick();
        }}
      >
        {element.type === 'text' && (
          <span
            style={{
              color: element.style?.color,
              fontSize: element.style?.fontSize,
              fontFamily: element.style?.fontFamily,
              fontWeight: element.style?.fontWeight,
              textAlign: element.style?.textAlign,
              fontStyle: element.style?.fontStyle,
              textDecoration: element.style?.textDecoration,
            }}
          >
            {element.content}
          </span>
        )}
        {element.type === 'image' && (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <Image
              src={element.content}
              alt="Poster element"
              layout="fill"
              objectFit="cover"
            />
          </div>
        )}
        {element.type === 'shape' && renderShape()}
        {element.id === selectedElement && (
          <div className="absolute top-0 right-0 flex gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRotate(-10);
              }}
              className="p-1 bg-gray-300 rounded"
            >
              ↺
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRotate(10);
              }}
              className="p-1 bg-gray-300 rounded"
            >
              ↻
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleZIndexChange('up');
              }}
              className="p-1 bg-gray-300 rounded"
            >
              ↑
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleZIndexChange('down');
              }}
              className="p-1 bg-gray-300 rounded"
            >
              ↓
            </button>
          </div>
        )}
      </div>
    </Resizable>
  );
}

export default function Canvas({ elements, setElements, setSelectedElement, addToHistory, backgroundColor }) {
  const [selectedElement, setSelectedElementState] = useState(null);
  const canvasRef = useRef(null);

  const handleDragEnd = (event) => {
    const { active, delta } = event;
    setElements((prevElements) => {
      const newElements = prevElements.map((el) =>
        el.id === active.id
          ? { ...el, x: el.x + delta.x, y: el.y + delta.y }
          : el
      );
      addToHistory(newElements);
      return newElements;
    });
  };

  const handleClick = (id) => {
    setSelectedElementState(id);
    setSelectedElement(id);
  };

  const handleResize = (id, width, height) => {
    setElements((prevElements) => {
      const newElements = prevElements.map((el) =>
        el.id === id
          ? { ...el, style: { ...el.style, width, height } }
          : el
      );
      addToHistory(newElements);
      return newElements;
    });
  };

  const handleRotate = (id, direction) => {
    setElements((prevElements) => {
      const newElements = prevElements.map((el) =>
        el.id === id
          ? {
              ...el,
              style: {
                ...el.style,
                rotation: (el.style.rotation || 0) + direction,
              },
            }
          : el
      );
      addToHistory(newElements);
      return newElements;
    });
  };

  const handleZIndexChange = (id, direction) => {
    setElements((prevElements) => {
      const index = prevElements.findIndex((el) => el.id === id);
      if (index === -1) return prevElements;

      const newElements = [...prevElements];
      const [element] = newElements.splice(index, 1);
      if (direction === 'up' && index < newElements.length) {
        newElements.splice(index + 1, 0, element);
      } else if (direction === 'down' && index > 0) {
        newElements.splice(index - 1, 0, element);
      } else {
        newElements.splice(index, 0, element);
      }
      addToHistory(newElements);
      return newElements;
    });
  };

  const exportPoster = async () => {
    if (!canvasRef.current) return;
    const canvas = await html2canvas(canvasRef.current);
    const link = document.createElement('a');
    link.download = 'poster.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div>
      <div
        ref={canvasRef}
        className="relative w-full h-[500px] bg-white border-2 border-gray-300 rounded-lg shadow-lg overflow-hidden"
        style={{ background: backgroundColor || '#f0f0f0' }}
      >
        <DndContext onDragEnd={handleDragEnd}>
          {elements.map((element) => (
            <DraggableElement
              key={element.id}
              element={element}
              onDragEnd={handleDragEnd}
              onClick={() => handleClick(element.id)}
              onResize={handleResize}
              onRotate={handleRotate}
              onZIndexChange={handleZIndexChange}
              selectedElement={selectedElement}
              elements={elements}
              setElements={setElements}
            />
          ))}
        </DndContext>
      </div>
      <div className="mt-4">
        <h3 className="text-lg font-semibold">Layers</h3>
        <ul className="border p-2 rounded max-h-40 overflow-y-auto">
          {elements.map((el, index) => (
            <li
              key={el.id}
              className={`p-1 cursor-pointer ${el.id === selectedElement ? 'bg-blue-100' : ''}`}
              onClick={() => handleClick(el.id)}
            >
              {el.type} {index + 1}
            </li>
          ))}
        </ul>
      </div>
      <button
        onClick={exportPoster}
        className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Export Poster
      </button>
    </div>
  );
}
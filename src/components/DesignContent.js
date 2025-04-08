// src/components/DesignContent.js
"use client";

import { useSession, signIn } from 'next-auth/react';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { templates } from '../components/TemplateSelector';
import { fabric } from 'fabric';

export default function DesignContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [text, setText] = useState('');
  const [selectedElement, setSelectedElement] = useState(null);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [showGrid, setShowGrid] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [activeTab, setActiveTab] = useState('Templates');
  const [designCategory, setDesignCategory] = useState('Poster Flyer Letter');
  const [canvasSize, setCanvasSize] = useState(null);
  const [zoom, setZoom] = useState(0.5);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [customDimensions, setCustomDimensions] = useState({ width: 816, height: 1056 });
  const [showCustomDimensions, setShowCustomDimensions] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCanvasRefReady, setIsCanvasRefReady] = useState(false);
  // Add state for toggling sidebars on mobile
  const [showTools, setShowTools] = useState(true);
  const [showProperties, setShowProperties] = useState(true);

  const designCategories = useMemo(() => ({
    'Poster Flyer Letter': { width: 816, height: 1056 },
    'Instagram Reel Post': { width: 1080, height: 1920 },
    'Event Flyer': { width: 800, height: 1200 },
    'Business Poster': { width: 800, height: 1200 },
    'Social Media Graphic': { width: 1080, height: 1080 },
  }), []);

  const fontFamilies = ['Arial', 'Roboto', 'Times New Roman', 'Helvetica', 'Georgia'];

  // Handle redirect if no category is specified
  useEffect(() => {
    const category = searchParams.get('category');
    if (!category && status !== 'loading') {
      router.replace('/design/start');
    }
  }, [searchParams, router, status]);

  // Set category and canvas size
  useEffect(() => {
    const category = searchParams.get('category') || 'Poster Flyer Letter';
    setDesignCategory(category);

    let size;
    if (category === 'Custom') {
      setShowCustomDimensions(true);
      size = customDimensions;
    } else {
      setShowCustomDimensions(false);
      size = designCategories[category] || { width: 816, height: 1056 };
    }
    setCanvasSize(size);
  }, [searchParams, customDimensions, designCategories]);

  // Track when canvasRef.current is ready
  useEffect(() => {
    if (canvasRef.current) {
      setIsCanvasRefReady(true);
    }
  }, []);

  // Define loadTemplate with useCallback to prevent redefinition on every render
  const loadTemplate = useCallback((template) => {
    if (!canvas || !fabric || canvas._disposed) {
      console.error('Cannot load template: canvas or fabric not initialized or canvas is disposed');
      return;
    }
    canvas.clear();
    template.elements.forEach((el) => {
      if (el.type === 'text') {
        const textObj = new fabric.Textbox(el.text, {
          left: el.left,
          top: el.top,
          fontSize: el.fontSize || 20,
          fill: el.fill || '#000000',
          fontFamily: el.fontFamily || 'Arial',
          fontWeight: el.fontWeight || 'normal',
          fontStyle: el.fontStyle || 'normal',
          textAlign: el.textAlign || 'left',
          editable: true,
        });
        canvas.add(textObj);
      } else if (el.type === 'image') {
        fabric.Image.fromURL(el.src, (img) => {
          if (canvas._disposed) {
            console.warn('Canvas disposed while loading image for template');
            return;
          }
          img.set({ left: el.left, top: el.top, angle: el.angle || 0 });
          img.scale(el.scale || 0.5);
          canvas.add(img);
          canvas.renderAll();
        }, (err) => {
          console.error('Error loading image for template:', err);
        });
      } else if (el.type === 'rect') {
        const rect = new fabric.Rect({
          left: el.left,
          top: el.top,
          width: el.width,
          height: el.height,
          fill: el.fill || '#ff0000',
          stroke: el.stroke || '#000000',
          strokeWidth: el.strokeWidth || 1,
        });
        canvas.add(rect);
      } else if (el.type === 'circle') {
        const circle = new fabric.Circle({
          left: el.left,
          top: el.top,
          radius: el.radius,
          fill: el.fill || '#00ff00',
          stroke: el.stroke || '#000000',
          strokeWidth: el.strokeWidth || 1,
        });
        canvas.add(circle);
      } else if (el.type === 'triangle') {
        const triangle = new fabric.Triangle({
          left: el.left,
          top: el.top,
          width: el.width,
          height: el.height,
          fill: el.fill || '#0000ff',
          stroke: el.stroke || '#000000',
          strokeWidth: el.strokeWidth || 1,
        });
        canvas.add(triangle);
      } else if (el.type === 'ellipse') {
        const ellipse = new fabric.Ellipse({
          left: el.left,
          top: el.top,
          rx: el.rx,
          ry: el.ry,
          fill: el.fill || '#ff00ff',
          stroke: el.stroke || '#000000',
          strokeWidth: el.strokeWidth || 1,
        });
        canvas.add(ellipse);
      } else if (el.type === 'line') {
        const line = new fabric.Line(el.points, {
          stroke: el.stroke || '#000000',
          strokeWidth: el.strokeWidth || 2,
        });
        canvas.add(line);
      }
    });
    if (!canvas._disposed) {
      canvas.renderAll();
    }
  }, [canvas, fabric]);

  // Initialize canvas when canvasRef.current and canvasSize are available
  useEffect(() => {
    if (!fabric || !fabric.Canvas || !isCanvasRefReady || !canvasSize?.width || !canvasSize?.height) {
      console.log('Skipping canvas initialization due to missing dependencies:', {
        fabric: !!fabric,
        fabricCanvas: fabric?.Canvas,
        canvasRef: !!canvasRef.current,
        isCanvasRefReady,
        canvasSize,
      });
      return;
    }

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      height: canvasSize.height,
      width: canvasSize.width,
      backgroundColor: '#ffffff',
      selection: true,
      preserveObjectStacking: true,
    });

    const savedTemplate = localStorage.getItem('selectedTemplate');
    console.log('Saved template from localStorage:', savedTemplate);
    if (savedTemplate) {
      try {
        const elements = JSON.parse(savedTemplate);
        console.log('Parsed template elements:', elements);
        loadTemplate({ elements });
      } catch (error) {
        console.error('Error parsing saved template:', error);
        localStorage.removeItem('selectedTemplate');
      }
    }

    setCanvas(fabricCanvas);

    fabricCanvas.on('selection:created', (e) => {
      setSelectedElement(e.target);
    });
    fabricCanvas.on('selection:updated', (e) => {
      setSelectedElement(e.target);
    });
    fabricCanvas.on('selection:cleared', () => {
      setSelectedElement(null);
    });

    fabricCanvas.on('object:modified', () => {
      if (fabricCanvas._disposed) {
        console.warn('Canvas disposed during object:modified event');
        return;
      }
      const state = JSON.stringify(fabricCanvas.toJSON());
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(state);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    });

    setIsLoading(false);

    return () => {
      if (fabricCanvas && !fabricCanvas._disposed) {
        try {
          fabricCanvas.dispose();
          fabricCanvas._disposed = true;
        } catch (error) {
          console.error('Error disposing canvas:', error);
        }
      }
      setCanvas(null);
    };
  }, [canvasSize, isCanvasRefReady]);

  // Update canvas background color
  useEffect(() => {
    if (canvas && !canvas._disposed) {
      console.log('Updating background color to:', backgroundColor);
      canvas.backgroundColor = backgroundColor;
      canvas.renderAll();
    }
  }, [backgroundColor, canvas]);

  const handleCategoryChange = (category) => {
    setDesignCategory(category);
    if (category === 'Custom') {
      setShowCustomDimensions(true);
    } else {
      setShowCustomDimensions(false);
      const size = designCategories[category] || { width: 816, height: 1056 };
      setCanvasSize(size);
    }
    localStorage.removeItem('selectedTemplate');
  };

  const handleCustomDimensionsChange = () => {
    setCanvasSize({ width: customDimensions.width, height: customDimensions.height });
    setShowCustomDimensions(false);
  };

  const addText = (style = 'Body') => {
    if (!canvas || !fabric || canvas._disposed) {
      console.error('Cannot add text: canvas or fabric not initialized or canvas is disposed');
      return;
    }
    const styles = {
      Heading: { fontSize: 40, fontWeight: 'bold', textAlign: 'center' },
      Subheading: { fontSize: 30, fontWeight: 'normal', textAlign: 'center' },
      Body: { fontSize: 20, fontWeight: 'normal', textAlign: 'left' },
    };
    const textStyle = styles[style] || styles.Body;
    const textObj = new fabric.Textbox(text || 'Enter text', {
      left: 100,
      top: 100,
      fontSize: textStyle.fontSize,
      fontWeight: textStyle.fontWeight,
      textAlign: textStyle.textAlign,
      fill: '#000000',
      fontFamily: 'Arial',
      editable: true,
    });
    canvas.add(textObj);
    setText('');
    canvas.setActiveObject(textObj);
    canvas.renderAll();
  };

  const addImage = (e) => {
    if (!canvas || !fabric || canvas._disposed) {
      console.error('Cannot add image: canvas or fabric not initialized or canvas is disposed');
      return;
    }
    const file = e.target.files[0];
    if (!file) {
      console.error('No file selected');
      return;
    }
    const reader = new FileReader();
    reader.onload = (f) => {
      const data = f.target.result;
      fabric.Image.fromURL(data, (img) => {
        if (canvas._disposed) {
          console.warn('Canvas disposed while adding image');
          return;
        }
        img.scale(0.5);
        img.set({ left: 100, top: 100 });
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
        setUploadedImages([...uploadedImages, data]);
      }, (err) => {
        console.error('Error loading image:', err);
      });
    };
    reader.onerror = (err) => {
      console.error('Error reading file:', err);
    };
    reader.readAsDataURL(file);
  };

  const addUploadedImage = (src) => {
    if (!canvas || !fabric || canvas._disposed) {
      console.error('Cannot add uploaded image: canvas or fabric not initialized or canvas is disposed');
      return;
    }
    fabric.Image.fromURL(src, (img) => {
      if (canvas._disposed) {
        console.warn('Canvas disposed while adding uploaded image');
        return;
      }
      img.scale(0.5);
      img.set({ left: 100, top: 100 });
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
    }, (err) => {
      console.error('Error loading uploaded image:', err);
    });
  };

  const addShape = (shapeType) => {
    if (!canvas || !fabric || canvas._disposed) {
      console.error('Cannot add shape: canvas or fabric not initialized or canvas is disposed');
      return;
    }
    let shape;
    if (shapeType === 'rectangle') {
      shape = new fabric.Rect({
        left: 100,
        top: 100,
        width: 100,
        height: 60,
        fill: '#ff0000',
        stroke: '#000000',
        strokeWidth: 1,
      });
    } else if (shapeType === 'circle') {
      shape = new fabric.Circle({
        left: 100,
        top: 100,
        radius: 50,
        fill: '#00ff00',
        stroke: '#000000',
        strokeWidth: 1,
      });
    } else if (shapeType === 'triangle') {
      shape = new fabric.Triangle({
        left: 100,
        top: 100,
        width: 80,
        height: 80,
        fill: '#0000ff',
        stroke: '#000000',
        strokeWidth: 1,
      });
    } else if (shapeType === 'ellipse') {
      shape = new fabric.Ellipse({
        left: 100,
        top: 100,
        rx: 50,
        ry: 30,
        fill: '#ff00ff',
        stroke: '#000000',
        strokeWidth: 1,
      });
    } else if (shapeType === 'line') {
      shape = new fabric.Line([100, 100, 200, 100], {
        stroke: '#000000',
        strokeWidth: 2,
      });
    }
    if (shape) {
      canvas.add(shape);
      canvas.setActiveObject(shape);
      canvas.renderAll();
    }
  };

  const addBackgroundImage = (e) => {
    if (!canvas || canvas._disposed) {
      console.error('Cannot add background image: canvas not initialized or disposed');
      return;
    }
    const file = e.target.files[0];
    if (!file) {
      console.error('No file selected for background image');
      return;
    }
    const reader = new FileReader();
    reader.onload = (f) => {
      const data = f.target.result;
      if (canvas._disposed) {
        console.warn('Canvas disposed while setting background image');
        return;
      }
      canvas.setBackgroundImage(data, canvas.renderAll.bind(canvas), {
        scaleX: canvas.width / canvasSize.width,
        scaleY: canvas.height / canvasSize.height,
      });
    };
    reader.onerror = (err) => {
      console.error('Error reading background image file:', err);
    };
    reader.readAsDataURL(file);
  };

  const removeBackground = () => {
    if (canvas && !canvas._disposed && canvas.backgroundImage) {
      canvas.setBackgroundImage(null, canvas.renderAll.bind(canvas));
    }
  };

  const updateElementProperty = (property, value) => {
    if (selectedElement && canvas && !canvas._disposed) {
      console.log(`Updating ${property} to ${value} for element:`, selectedElement);
      selectedElement.set(property, value);
      canvas.renderAll();
      setSelectedElement({ ...selectedElement });
    } else {
      console.error('No element selected to update or canvas is disposed');
    }
  };

  const undo = () => {
    if (historyIndex > 0 && canvas && !canvas._disposed) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      canvas.loadFromJSON(JSON.parse(history[newIndex]), canvas.renderAll.bind(canvas));
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1 && canvas && !canvas._disposed) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      canvas.loadFromJSON(JSON.parse(history[newIndex]), canvas.renderAll.bind(canvas));
    }
  };

  const downloadCanvas = (format = 'png') => {
    if (canvas && !canvas._disposed) {
      const url = canvas.toDataURL({
        format: format,
        quality: 1,
      });
      const link = document.createElement('a');
      link.download = `design.${format}`;
      link.href = url;
      link.click();
    } else {
      console.error('Cannot download: canvas not initialized or disposed');
    }
  };

  const toggleGrid = () => {
    if (!canvas || canvas._disposed) return;
    setShowGrid(!showGrid);
    if (!showGrid) {
      for (let i = 0; i < canvasSize.width; i += 50) {
        const line = new fabric.Line([i, 0, i, canvasSize.height], {
          stroke: '#ccc',
          selectable: false,
          evented: false,
        });
        canvas.add(line);
      }
      for (let i = 0; i < canvasSize.height; i += 50) {
        const line = new fabric.Line([0, i, canvasSize.width, i], {
          stroke: '#ccc',
          selectable: false,
          evented: false,
        });
        canvas.add(line);
      }
    } else {
      canvas.getObjects().forEach((obj) => {
        if (obj.type === 'line') {
          canvas.remove(obj);
        }
      });
    }
    canvas.renderAll();
  };

  const handleZoom = (value) => {
    setZoom(value);
    if (canvas && !canvas._disposed) {
      canvas.setZoom(value);
      canvas.setWidth(canvasSize.width * value);
      canvas.setHeight(canvasSize.height * value);
      canvas.renderAll();
    }
  };

  const filteredTemplates = templates.filter(
    (template) => template.category === designCategory
  );

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading...</h2>
          <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4 animate-spin"></div>
        </div>
      </div>
    );
  }

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
            to access the design page.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-500">Error</h1>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 font-sans">
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-white">Loading Editor...</h2>
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4 animate-spin"></div>
          </div>
        </div>
      )}

      {showCustomDimensions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4">Set Custom Dimensions</h2>
            <div className="space-y-4">
              <label className="block">
                Width (px):
                <input
                  type="number"
                  value={customDimensions.width}
                  onChange={(e) =>
                    setCustomDimensions({
                      ...customDimensions,
                      width: parseInt(e.target.value) || 816,
                    })
                  }
                  className="border p-2 rounded w-full mt-1"
                />
              </label>
              <label className="block">
                Height (px):
                <input
                  type="number"
                  value={customDimensions.height}
                  onChange={(e) =>
                    setCustomDimensions({
                      ...customDimensions,
                      height: parseInt(e.target.value) || 1056,
                    })
                  }
                  className="border p-2 rounded w-full mt-1"
                />
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={handleCustomDimensionsChange}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
                >
                  Apply
                </button>
                <button
                  onClick={() => setShowCustomDimensions(false)}
                  className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 w-full"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Toolbar */}
      <div className="bg-white p-4 shadow-md flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center space-x-2 flex-wrap">
          <button
            onClick={() => window.history.back()}
            className="text-blue-500 hover:underline text-sm md:text-base"
          >
            Back
          </button>
          <select
            value={designCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="p-2 border rounded-lg text-sm md:text-base w-full md:w-auto"
          >
            {Object.keys(designCategories).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
            <option value="Custom">Custom Dimensions</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <label className="text-gray-600 text-sm md:text-base">Zoom:</label>
            <select
              value={zoom}
              onChange={(e) => handleZoom(parseFloat(e.target.value))}
              className="p-2 border rounded-lg text-sm md:text-base"
            >
              <option value={0.25}>25%</option>
              <option value={0.5}>50%</option>
              <option value={1}>100%</option>
              <option value={1.5}>150%</option>
              <option value={2}>200%</option>
            </select>
          </div>
        </div>
        <div className="flex space-x-2 flex-wrap gap-2">
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 text-sm md:text-base min-w-[60px]"
          >
            Undo
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 text-sm md:text-base min-w-[60px]"
          >
            Redo
          </button>
          <button
            onClick={() => alert('Preview feature coming soon!')}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm md:text-base min-w-[60px]"
          >
            Preview
          </button>
          <select
            onChange={(e) => downloadCanvas(e.target.value)}
            className="px-3 py-1 border rounded text-sm md:text-base"
          >
            <option value="">Download As...</option>
            <option value="png">PNG</option>
            <option value="jpeg">JPEG</option>
            <option value="pdf">PDF (Beta)</option>
          </select>
          <button
            onClick={() => alert('Share feature coming soon!')}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm md:text-base min-w-[60px]"
          >
            Share
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row flex-1">
        {/* Tools Sidebar (Left) */}
        <div className="w-full md:w-72 bg-white p-4 shadow-md overflow-y-auto">
          <div className="flex justify-between items-center mb-4 md:mb-0">
            <h2 className="text-lg font-bold">Tools</h2>
            <button
              onClick={() => setShowTools(!showTools)}
              className="md:hidden text-blue-500 hover:underline"
            >
              {showTools ? 'Hide' : 'Show'} Tools
            </button>
          </div>
          <div className={`${showTools ? 'block' : 'hidden'} md:block`}>
            <div className="flex space-x-2 mb-4 flex-wrap gap-2">
              {['Templates', 'Elements', 'Text', 'Images', 'Background', 'Uploads'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 rounded mb-2 text-sm md:text-base ${
                    activeTab === tab
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 'Templates' && (
              <div>
                <h3 className="font-semibold mb-2 text-lg">Templates</h3>
                <div className="space-y-2">
                  {filteredTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="flex items-center space-x-2 p-2 bg-gray-100 rounded hover:bg-gray-200 cursor-pointer"
                      onClick={() => loadTemplate(template)}
                    >
                      <Image
                        src={template.previewImage}
                        alt={template.name}
                        width={50}
                        height={50}
                        className="object-cover rounded"
                      />
                      <span className="text-sm md:text-base">{template.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'Elements' && (
              <div>
                <h3 className="font-semibold mb-2 text-lg">Elements</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => addShape('rectangle')}
                    className="w-full p-2 bg-gray-200 rounded hover:bg-gray-300 text-left text-sm md:text-base"
                  >
                    Add Rectangle
                  </button>
                  <button
                    onClick={() => addShape('circle')}
                    className="w-full p-2 bg-gray-200 rounded hover:bg-gray-300 text-left text-sm md:text-base"
                  >
                    Add Circle
                  </button>
                  <button
                    onClick={() => addShape('triangle')}
                    className="w-full p-2 bg-gray-200 rounded hover:bg-gray-300 text-left text-sm md:text-base"
                  >
                    Add Triangle
                  </button>
                  <button
                    onClick={() => addShape('ellipse')}
                    className="w-full p-2 bg-gray-200 rounded hover:bg-gray-300 text-left text-sm md:text-base"
                  >
                    Add Ellipse
                  </button>
                  <button
                    onClick={() => addShape('line')}
                    className="w-full p-2 bg-gray-200 rounded hover:bg-gray-300 text-left text-sm md:text-base"
                  >
                    Add Line
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'Text' && (
              <div>
                <h3 className="font-semibold mb-2 text-lg">Add Text</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => addText('Heading')}
                    className="w-full p-2 bg-gray-200 rounded hover:bg-gray-300 text-left text-sm md:text-base"
                  >
                    Add Heading
                  </button>
                  <button
                    onClick={() => addText('Subheading')}
                    className="w-full p-2 bg-gray-200 rounded hover:bg-gray-300 text-left text-sm md:text-base"
                  >
                    Add Subheading
                  </button>
                  <button
                    onClick={() => addText('Body')}
                    className="w-full p-2 bg-gray-200 rounded hover:bg-gray-300 text-left text-sm md:text-base"
                  >
                    Add Body Text
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'Images' && (
              <div>
                <h3 className="font-semibold mb-2 text-lg">Add Image</h3>
                <input
                  type="file"
                  accept="image/*"
                  onChange={addImage}
                  className="border p-2 rounded w-full text-sm md:text-base"
                />
              </div>
            )}

            {activeTab === 'Background' && (
              <div>
                <h3 className="font-semibold mb-2 text-lg">Background</h3>
                <div className="space-y-2">
                  <label className="block">
                    Color:
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-full h-10 mt-1"
                    />
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={addBackgroundImage}
                    className="border p-2 rounded w-full text-sm md:text-base"
                  />
                  <button
                    onClick={removeBackground}
                    className="bg-red-500 text-white px-4 py-2 rounded w-full hover:bg-red-600 text-sm md:text-base"
                  >
                    Remove Background
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'Uploads' && (
              <div>
                <h3 className="font-semibold mb-2 text-lg">Uploads</h3>
                <input
                  type="file"
                  accept="image/*"
                  onChange={addImage}
                  className="border p-2 rounded w-full mb-2 text-sm md:text-base"
                />
                <div className="space-y-2">
                  {uploadedImages.map((src, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 p-2 bg-gray-100 rounded hover:bg-gray-200 cursor-pointer"
                      onClick={() => addUploadedImage(src)}
                    >
                      <Image
                        src={src}
                        alt={`Upload ${index}`}
                        width={50}
                        height={50}
                        className="object-cover rounded"
                      />
                      <span className="text-sm md:text-base">Image {index + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Canvas (Center) */}
        <div className="flex-1 p-4 flex justify-center items-center bg-gray-200 w-full">
          <div
            className="overflow-auto w-full max-w-full"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
            }}
          >
            <canvas ref={canvasRef} className="border shadow-lg max-w-full" />
          </div>
        </div>

        {/* Properties & Layers Sidebar (Right) */}
        <div className="w-full md:w-72 bg-white p-4 shadow-md overflow-y-auto">
          <div className="flex justify-between items-center mb-4 md:mb-0">
            <h2 className="text-lg font-bold">Properties & Layers</h2>
            <button
              onClick={() => setShowProperties(!showProperties)}
              className="md:hidden text-blue-500 hover:underline"
            >
              {showProperties ? 'Hide' : 'Show'} Properties
            </button>
          </div>
          <div className={`${showProperties ? 'block' : 'hidden'} md:block`}>
            {selectedElement && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Properties</h3>
                {selectedElement.type === 'textbox' && (
                  <div className="space-y-2">
                    <label className="block">
                      Font Family:
                      <select
                        value={selectedElement.fontFamily || 'Arial'}
                        onChange={(e) =>
                          updateElementProperty('fontFamily', e.target.value)
                        }
                        className="border p-1 rounded w-full text-sm md:text-base"
                      >
                        {fontFamilies.map((font) => (
                          <option key={font} value={font}>
                            {font}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      Font Size:
                      <input
                        type="number"
                        value={selectedElement.fontSize || 20}
                        onChange={(e) =>
                          updateElementProperty('fontSize', parseInt(e.target.value))
                        }
                        className="border p-1 rounded w-full text-sm md:text-base"
                      />
                    </label>
                    <label className="block">
                      Font Weight:
                      <select
                        value={selectedElement.fontWeight || 'normal'}
                        onChange={(e) =>
                          updateElementProperty('fontWeight', e.target.value)
                        }
                        className="border p-1 rounded w-full text-sm md:text-base"
                      >
                        <option value="normal">Normal</option>
                        <option value="bold">Bold</option>
                      </select>
                    </label>
                    <label className="block">
                      Font Style:
                      <select
                        value={selectedElement.fontStyle || 'normal'}
                        onChange={(e) =>
                          updateElementProperty('fontStyle', e.target.value)
                        }
                        className="border p-1 rounded w-full text-sm md:text-base"
                      >
                        <option value="normal">Normal</option>
                        <option value="italic">Italic</option>
                      </select>
                    </label>
                    <label className="block">
                      Alignment:
                      <select
                        value={selectedElement.textAlign || 'left'}
                        onChange={(e) =>
                          updateElementProperty('textAlign', e.target.value)
                        }
                        className="border p-1 rounded w-full text-sm md:text-base"
                      >
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                      </select>
                    </label>
                    <label className="block">
                      Color:
                      <input
                        type="color"
                        value={selectedElement.fill || '#000000'}
                        onChange={(e) => updateElementProperty('fill', e.target.value)}
                        className="w-full h-10"
                      />
                    </label>
                    <label className="block">
                      Opacity:
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={selectedElement.opacity || 1}
                        onChange={(e) =>
                          updateElementProperty('opacity', parseFloat(e.target.value))
                        }
                        className="w-full"
                      />
                    </label>
                  </div>
                )}
                {(selectedElement.type === 'image' || selectedElement.type === 'rect' || selectedElement.type === 'circle' || selectedElement.type === 'triangle' || selectedElement.type === 'ellipse' || selectedElement.type === 'line') && (
                  <div className="space-y-2">
                    <label className="block">
                      Opacity:
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={selectedElement.opacity || 1}
                        onChange={(e) =>
                          updateElementProperty('opacity', parseFloat(e.target.value))
                        }
                        className="w-full"
                      />
                    </label>
                    <label className="block">
                      Rotation:
                      <input
                        type="number"
                        value={selectedElement.angle || 0}
                        onChange={(e) =>
                          updateElementProperty('angle', parseInt(e.target.value))
                        }
                        className="border p-1 rounded w-full text-sm md:text-base"
                      />
                    </label>
                    {selectedElement.type === 'image' && (
                      <>
                        <button
                          onClick={() =>
                            updateElementProperty('flipX', !selectedElement.flipX)
                          }
                          className="w-full p-2 bg-gray-200 rounded hover:bg-gray-300 text-sm md:text-base"
                        >
                          Flip Horizontal
                        </button>
                        <button
                          onClick={() =>
                            updateElementProperty('flipY', !selectedElement.flipY)
                          }
                          className="w-full p-2 bg-gray-200 rounded hover:bg-gray-300 text-sm md:text-base"
                        >
                          Flip Vertical
                        </button>
                      </>
                    )}
                    {(selectedElement.type === 'rect' || selectedElement.type === 'circle' || selectedElement.type === 'triangle' || selectedElement.type === 'ellipse' || selectedElement.type === 'line') && (
                      <>
                        <label className="block">
                          Fill Color:
                          <input
                            type="color"
                            value={selectedElement.fill || '#ff0000'}
                            onChange={(e) =>
                              updateElementProperty('fill', e.target.value)
                            }
                            className="w-full h-10"
                          />
                        </label>
                        <label className="block">
                          Stroke Color:
                          <input
                            type="color"
                            value={selectedElement.stroke || '#000000'}
                            onChange={(e) =>
                              updateElementProperty('stroke', e.target.value)
                            }
                            className="w-full h-10"
                          />
                        </label>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
            <h3 className="font-semibold mb-2">Layers</h3>
            <div className="space-y-2">
              {canvas?.getObjects().map((obj, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-2 bg-gray-100 rounded"
                >
                  <span className="text-sm md:text-base">{obj.type}</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        if (canvas && !canvas._disposed) {
                          canvas.setActiveObject(obj);
                          canvas.renderAll();
                        }
                      }}
                      className="text-blue-500 hover:text-blue-700 text-sm md:text-base"
                    >
                      Select
                    </button>
                    <button
                      onClick={() => {
                        if (canvas && !canvas._disposed) {
                          canvas.remove(obj);
                          canvas.renderAll();
                        }
                      }}
                      className="text-red-500 hover:text-red-700 text-sm md:text-base"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
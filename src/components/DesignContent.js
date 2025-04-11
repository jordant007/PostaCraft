"use client";

import { useSession, signIn } from 'next-auth/react';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { fabric } from 'fabric';
import { templates } from '../components/TemplateSelector';

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
  const [showFolds, setShowFolds] = useState(false);
  const [showBleed, setShowBleed] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [activeTab, setActiveTab] = useState(null);
  const [designCategory, setDesignCategory] = useState('Poster Flyer Letter');
  const [canvasSize, setCanvasSize] = useState(null); // Initialize as null
  const [zoom, setZoom] = useState(1);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [customDimensions, setCustomDimensions] = useState({ width: 816, height: 1056 });
  const [showCustomDimensions, setShowCustomDimensions] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTools, setShowTools] = useState(true);
  const [designTitle, setDesignTitle] = useState('A New Design');
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [slides, setSlides] = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showFeaturePopup, setShowFeaturePopup] = useState(false);
  const [textStyles, setTextStyles] = useState({
    fontFamily: 'Arial',
    fontSize: 20,
    fontWeight: 'normal',
    fontStyle: 'normal',
    textAlign: 'left',
    fill: '#000000',
    opacity: 1,
    lineHeight: 1.2,
    charSpacing: 0,
  });
  const [isTextEditPanelOpen, setIsTextEditPanelOpen] = useState(false);

  const designCategories = useMemo(() => ({
    'Poster Flyer Letter': { width: 816, height: 1056 },
    'Instagram Reel Post': { width: 1080, height: 1920 },
    'Event Flyer': { width: 800, height: 1200 },
    'Business Poster': { width: 800, height: 1200 },
    'Social Media Graphic': { width: 1080, height: 1080 },
    'Custom': { width: 816, height: 1056 },
  }), []);

  // Handle redirect if no category is specified
  useEffect(() => {
    if (status !== 'loading' && !searchParams.get('category')) {
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

  // Initialize canvas
  useEffect(() => {
    // Ensure all dependencies are ready before initializing the canvas
    if (!fabric || !fabric.Canvas) {
      setError('Fabric.js library failed to load. Please refresh the page.');
      setIsLoading(false);
      return;
    }

    if (!canvasRef.current) {
      // If canvasRef is not ready, wait for the DOM to be ready
      setTimeout(() => {
        if (!canvasRef.current) {
          setError('Canvas element not found. Please refresh the page.');
          setIsLoading(false);
        }
      }, 100);
      return;
    }

    if (!canvasSize?.width || !canvasSize?.height) {
      setError('Canvas dimensions are not set. Please refresh the page.');
      setIsLoading(false);
      return;
    }

    // Initialize the canvas
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      height: canvasSize.height,
      width: canvasSize.width,
      backgroundColor: '#ffffff',
      selection: true,
      preserveObjectStacking: true,
      fireRightClick: true,
      stopContextMenu: true,
    });

    const savedTemplate = localStorage.getItem('selectedTemplate');
    if (savedTemplate) {
      try {
        const elements = JSON.parse(savedTemplate);
        loadTemplate({ elements });
      } catch (error) {
        console.error('Error parsing saved template:', error);
        localStorage.removeItem('selectedTemplate');
      }
    }

    setCanvas(fabricCanvas);

    fabricCanvas.on('selection:created', (e) => {
      setSelectedElement(e.target);
      if (e.target && e.target.type === 'textbox') {
        setTextStyles({
          fontFamily: e.target.fontFamily || 'Arial',
          fontSize: e.target.fontSize || 20,
          fontWeight: e.target.fontWeight || 'normal',
          fontStyle: e.target.fontStyle || 'normal',
          textAlign: e.target.textAlign || 'left',
          fill: e.target.fill || '#000000',
          opacity: e.target.opacity || 1,
          lineHeight: e.target.lineHeight || 1.2,
          charSpacing: e.target.charSpacing || 0,
        });
      }
    });

    fabricCanvas.on('selection:updated', (e) => {
      setSelectedElement(e.target);
      if (e.target && e.target.type === 'textbox') {
        setTextStyles({
          fontFamily: e.target.fontFamily || 'Arial',
          fontSize: e.target.fontSize || 20,
          fontWeight: e.target.fontWeight || 'normal',
          fontStyle: e.target.fontStyle || 'normal',
          textAlign: e.target.textAlign || 'left',
          fill: e.target.fill || '#000000',
          opacity: e.target.opacity || 1,
          lineHeight: e.target.lineHeight || 1.2,
          charSpacing: e.target.charSpacing || 0,
        });
      }
    });

    fabricCanvas.on('selection:cleared', () => {
      setSelectedElement(null);
      setIsTextEditPanelOpen(false);
    });

    fabricCanvas.on('object:modified', () => {
      if (fabricCanvas._disposed) return;
      const state = JSON.stringify(fabricCanvas.toJSON());
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(state);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    });

    setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => {
      if (fabricCanvas && !fabricCanvas._disposed) {
        fabricCanvas.dispose();
        fabricCanvas._disposed = true;
      }
      setCanvas(null);
    };
  }, [canvasSize, canvasRef]); // Add canvasRef as a dependency to ensure it re-runs if the ref changes

  // Add a timeout to handle loading failures
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        setError('Failed to load the editor. Please refresh the page.');
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, [isLoading]);

  // Add keyboard event listener for deleting elements
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' && canvas && !canvas._disposed) {
        const activeObjects = canvas.getActiveObjects();
        if (activeObjects.length > 0) {
          activeObjects.forEach((obj) => {
            canvas.remove(obj);
          });
          canvas.discardActiveObject();
          setSelectedElement(null);
          setIsTextEditPanelOpen(false);
          canvas.renderAll();

          const state = JSON.stringify(canvas.toJSON());
          const newHistory = history.slice(0, historyIndex + 1);
          newHistory.push(state);
          setHistory(newHistory);
          setHistoryIndex(newHistory.length - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [canvas, history, historyIndex]);

  // Update canvas background color
  useEffect(() => {
    if (canvas && !canvas._disposed) {
      canvas.backgroundColor = backgroundColor;
      canvas.renderAll();
    }
  }, [backgroundColor, canvas]);

  // Handle Grid toggle
  useEffect(() => {
    if (!canvas || canvas._disposed) return;
    canvas.getObjects().forEach((obj) => {
      if (obj.type === 'line' && obj.gridLine) {
        canvas.remove(obj);
      }
    });
    if (showGrid) {
      for (let i = 0; i < canvasSize.width; i += 50) {
        const line = new fabric.Line([i, 0, i, canvasSize.height], {
          stroke: '#ccc',
          selectable: false,
          evented: false,
          gridLine: true,
        });
        canvas.add(line);
      }
      for (let i = 0; i < canvasSize.height; i += 50) {
        const line = new fabric.Line([0, i, canvasSize.width, i], {
          stroke: '#ccc',
          selectable: false,
          evented: false,
          gridLine: true,
        });
        canvas.add(line);
      }
    }
    canvas.renderAll();
  }, [showGrid, canvas, canvasSize]);

  // Handle Folds
  useEffect(() => {
    if (!canvas || canvas._disposed) return;
    canvas.getObjects().forEach((obj) => {
      if (obj.type === 'line' && obj.foldLine) {
        canvas.remove(obj);
      }
    });
    if (showFolds) {
      const fold1 = canvasSize.width / 3;
      const fold2 = (canvasSize.width * 2) / 3;
      const line1 = new fabric.Line([fold1, 0, fold1, canvasSize.height], {
        stroke: '#00f',
        strokeDashArray: [5, 5],
        selectable: false,
        evented: false,
        foldLine: true,
      });
      const line2 = new fabric.Line([fold2, 0, fold2, canvasSize.height], {
        stroke: '#00f',
        strokeDashArray: [5, 5],
        selectable: false,
        evented: false,
        foldLine: true,
      });
      canvas.add(line1, line2);
    }
    canvas.renderAll();
  }, [showFolds, canvas, canvasSize]);

  // Handle Bleed
  useEffect(() => {
    if (!canvas || canvas._disposed) return;
    canvas.getObjects().forEach((obj) => {
      if (obj.type === 'rect' && obj.bleedArea) {
        canvas.remove(obj);
      }
    });
    if (showBleed) {
      const bleedSize = 10;
      const bleedRect = new fabric.Rect({
        left: -bleedSize,
        top: -bleedSize,
        width: canvasSize.width + 2 * bleedSize,
        height: canvasSize.height + 2 * bleedSize,
        fill: 'transparent',
        stroke: '#f00',
        strokeWidth: 2,
        selectable: false,
        evented: false,
        bleedArea: true,
      });
      canvas.add(bleedRect);
    }
    canvas.renderAll();
  }, [showBleed, canvas, canvasSize]);

  // Handle Drawing Mode
  useEffect(() => {
    if (!canvas || canvas._disposed) return;
    canvas.isDrawingMode = isDrawingMode;
    if (isDrawingMode) {
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.color = '#000000';
      canvas.freeDrawingBrush.width = 5;
    }
  }, [isDrawingMode, canvas]);

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

  const loadTemplate = useCallback((template) => {
    if (!canvas || !fabric || canvas._disposed) return;
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
          textBaseline: 'alphabetic',
        });
        canvas.add(textObj);
      } else if (el.type === 'image') {
        fabric.Image.fromURL(el.src, (img) => {
          if (canvas._disposed) return;
          img.set({ left: el.left, top: el.top, angle: el.angle || 0 });
          img.scale(el.scale || 0.5);
          canvas.add(img);
          canvas.renderAll();
        }, { crossOrigin: 'anonymous' });
      }
    });
    if (!canvas._disposed) {
      canvas.renderAll();
    }
  }, [canvas]);

  const addText = (style = 'Body') => {
    if (!canvas || !fabric || canvas._disposed) return;
    const styles = {
      Heading: { fontSize: 40, fontWeight: 'bold', textAlign: 'center' },
      Subheading: { fontSize: 30, fontWeight: 'normal', textAlign: 'center' },
      Body: { fontSize: 20, fontWeight: 'normal', textAlign: 'left' },
    };
    const textStyle = styles[style] || styles.Body;
    const textObj = new fabric.Textbox(text || 'add your text', {
      left: 100,
      top: 100,
      fontSize: textStyle.fontSize,
      fontWeight: textStyle.fontWeight,
      textAlign: textStyle.textAlign,
      fill: '#000000',
      fontFamily: 'Arial',
      editable: true,
      selectable: true,
      evented: true,
      textBaseline: 'alphabetic',
    });
    canvas.add(textObj);
    setText('');
    canvas.renderAll();

    setTimeout(() => {
      if (canvas._disposed) return;
      canvas.setActiveObject(textObj);
      canvas.renderAll();
      canvas.fire('selection:created', { target: textObj });
    }, 50);
  };

  const updateTextStyles = () => {
    if (!canvas || !selectedElement || selectedElement.type !== 'textbox') return;
    selectedElement.set({
      fontFamily: textStyles.fontFamily,
      fontSize: textStyles.fontSize,
      fontWeight: textStyles.fontWeight,
      fontStyle: textStyles.fontStyle,
      textAlign: textStyles.textAlign,
      fill: textStyles.fill,
      opacity: textStyles.opacity,
      lineHeight: textStyles.lineHeight,
      charSpacing: textStyles.charSpacing,
      textBaseline: 'alphabetic',
    });
    canvas.renderAll();
  };

  useEffect(() => {
    updateTextStyles();
  }, [textStyles, selectedElement, canvas]);

  const addImage = (e) => {
    if (!canvas || !fabric || canvas._disposed) return;
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (f) => {
      const data = f.target.result;
      fabric.Image.fromURL(data, (img) => {
        if (canvas._disposed) return;
        img.scale(0.5);
        img.set({ left: 100, top: 100 });
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
        setUploadedImages([...uploadedImages, data]);
      }, { crossOrigin: 'anonymous' });
    };
    reader.readAsDataURL(file);
  };

  const addUploadedImage = (src) => {
    if (!canvas || !fabric || canvas._disposed) return;
    fabric.Image.fromURL(src, (img) => {
      if (canvas._disposed) return;
      img.scale(0.5);
      img.set({ left: 100, top: 100 });
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
    }, { crossOrigin: 'anonymous' });
  };

  const addBackgroundImage = (e) => {
    if (!canvas || canvas._disposed) return;
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (f) => {
      const data = f.target.result;
      if (canvas._disposed) return;
      canvas.setBackgroundImage(data, canvas.renderAll.bind(canvas), {
        scaleX: canvas.width / canvasSize.width,
        scaleY: canvas.height / canvasSize.height,
      });
    };
    reader.readAsDataURL(file);
  };

  const removeBackground = () => {
    if (canvas && !canvas._disposed && canvas.backgroundImage) {
      canvas.setBackgroundImage(null, canvas.renderAll.bind(canvas));
    }
  };

  const recordMedia = () => {
    alert('Simulating media capture: A photo has been captured.');
    const placeholderImage = 'https://via.placeholder.com/150';
    fabric.Image.fromURL(placeholderImage, (img) => {
      if (canvas._disposed) return;
      img.scale(0.5);
      img.set({ left: 100, top: 100 });
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
    }, { crossOrigin: 'anonymous' });
  };

  const addSlideshow = () => {
    const newSlide = {
      id: slides.length + 1,
      elements: [],
    };
    setSlides([...slides, newSlide]);
    setCurrentSlideIndex(slides.length);
    alert('New slide added to slideshow.');
  };

  const addLayoutElement = (type) => {
    if (!canvas || !fabric || canvas._disposed) return;
    const layoutText = type === 'schedule' ? 'Event Schedule\n9:00 AM - Opening\n10:00 AM - Keynote' : 'Menu\nAppetizer: Salad\nMain: Pasta';
    const textObj = new fabric.Textbox(layoutText, {
      left: 100,
      top: 100,
      fontSize: 20,
      fill: '#000000',
      fontFamily: 'Arial',
      editable: true,
      textBaseline: 'alphabetic',
    });
    canvas.add(textObj);
    canvas.setActiveObject(textObj);
    canvas.renderAll();
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

  const deleteSelectedElement = () => {
    if (canvas && !canvas._disposed) {
      const activeObjects = canvas.getActiveObjects();
      if (activeObjects.length > 0) {
        activeObjects.forEach((obj) => {
          canvas.remove(obj);
        });
        canvas.discardActiveObject();
        setSelectedElement(null);
        setIsTextEditPanelOpen(false);
        canvas.renderAll();

        const state = JSON.stringify(canvas.toJSON());
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(state);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }
    }
  };

  const saveDesign = () => {
    if (canvas && !canvas._disposed) {
      const designData = canvas.toJSON();
      localStorage.setItem('savedDesign', JSON.stringify(designData));
      alert('Design saved successfully!');
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
    }
  };

  const publishDesign = () => {
    if (canvas && !canvas._disposed) {
      const designData = canvas.toDataURL({ format: 'png', quality: 1 });
      alert('Design published! Share this link: [Placeholder URL]');
    }
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
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-sm md:max-w-sm">
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

      {showFeaturePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-sm md:max-w-sm text-center">
            <h2 className="text-xl font-bold mb-4">Feature Coming Soon</h2>
            <p className="mb-4">This feature is under development and will be available soon!</p>
            <button
              onClick={() => setShowFeaturePopup(false)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Top Toolbar */}
      <div className="bg-blue-500 text-white p-2 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {/* Removed PosterMyWall heading */}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="p-1 disabled:opacity-50"
            aria-label="Undo last action"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="p-1 disabled:opacity-50"
            aria-label="Redo last action"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
            </svg>
          </button>
          <button
            onClick={deleteSelectedElement}
            disabled={!canvas || !canvas.getActiveObject()}
            className="p-1 disabled:opacity-50"
            aria-label="Delete selected element"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4M4 7h16" />
            </svg>
          </button>
          <button
            onClick={saveDesign}
            className="p-1"
            aria-label="Save design"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
            </svg>
          </button>
          <button
            onClick={() => downloadCanvas('png')}
            className="bg-white text-blue-500 px-2 py-1 rounded flex items-center space-x-1"
            aria-label="Download design as PNG"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Download</span>
          </button>
          <button
            onClick={publishDesign}
            className="bg-white text-blue-500 px-2 py-1 rounded flex items-center space-x-1"
            aria-label="Publish design"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span>Publish</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row flex-1">
        {/* Left Sidebar (Tools) */}
        <div className="w-full md:w-64 bg-white p-4 shadow-md overflow-y-auto">
          <div className="flex justify-between items-center mb-4 md:mb-0">
            <h2 className="text-lg font-bold">Add</h2>
            <button
              onClick={() => setShowTools(!showTools)}
              className="md:hidden text-blue-500 hover:underline"
            >
              {showTools ? 'Hide' : 'Show'} Tools
            </button>
          </div>
          <div className={`${showTools ? 'block' : 'hidden'} md:block`}>
            <div className="space-y-4">
              {[
                { name: 'My Uploads', icon: 'M3 16h18M3 12h18m0 0l-9-9m9 9l-9 9', desc: 'Add from My Uploads, Google Drive, and more' },
                { name: 'Templates', icon: 'M4 5a2 2 0 012-2h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5z', desc: 'Explore templates for your design' },
                { name: 'Media', icon: 'M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z', desc: 'Add photos, videos, elements, and audio' },
                { name: 'Text', icon: 'M9 5h6m-6 4h6m-6 4h6', desc: 'Choose from a variety of text styles' },
                { name: 'AI', icon: 'M12 2a10 10 0 00-7.35 16.65M12 2a10 10 0 017.35 16.65M12 2v20', desc: 'Transform your ideas with AI' },
                { name: 'Background', icon: 'M4 4h16v16H4z', desc: 'Change the background of your design' },
                { name: 'Record', icon: 'M3 12h18M12 3v18', desc: 'Capture photos, videos, or audio' },
                { name: 'Slideshow', icon: 'M15 5l5 5m0 0l-5 5m5-5H5', desc: 'Create text, photo, and video slideshows' },
                { name: 'Draw', icon: 'M15 5l5 5m0 0l-5 5m5-5H5', desc: 'Use a free-hand drawing tool' },
                { name: 'Layout', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16', desc: 'Add schedules, menus, tables, and more' },
              ].map((tab) => (
                <div
                  key={tab.name}
                  className={`p-2 rounded cursor-pointer ${activeTab === tab.name ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                  onClick={() => setActiveTab(tab.name)}
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon} />
                    </svg>
                    <div>
                      <h3 className="font-semibold">{tab.name}</h3>
                      <p className="text-sm text-gray-600">{tab.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal for Tools */}
        {activeTab && (
          <div className={`fixed inset-0 z-50 flex items-center justify-center ${activeTab === 'My Uploads' ? 'bg-black bg-opacity-75 backdrop-blur-sm' : ''}`}>
            <div className={`
              ${activeTab === 'My Uploads' 
                ? 'w-[90%] h-[90%] md:w-[90%] md:h-[90%] bg-white p-6 rounded-lg shadow-lg overflow-y-auto' 
                : 'w-11/12 max-w-sm md:absolute md:left-64 md:top-16 md:w-full md:max-w-md bg-white p-6 rounded-lg shadow-lg overflow-y-auto max-h-[60vh]'
              }`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">{activeTab}</h3>
                <button onClick={() => setActiveTab(null)} className="text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {activeTab === 'My Uploads' && (
                <div>
                  <h3 className="font-semibold mb-2 text-lg">My Uploads</h3>
                  <p className="text-sm text-gray-600 mb-2">Add your media or record directly from your device.</p>
                  <div className="flex space-x-2 mb-4">
                    <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                      <label className="cursor-pointer">
                        Upload media
                        <input
                          type="file"
                          accept="image/*"
                          onChange={addImage}
                          className="hidden"
                        />
                      </label>
                    </button>
                    <button onClick={recordMedia} className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-100">
                      Record media
                    </button>
                    <button onClick={() => setShowFeaturePopup(true)} className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-100">
                      Generate
                    </button>
                  </div>
                  <div className="flex space-x-2 mb-4">
                    <button className="border border-blue-500 text-blue-500 px-4 py-1 rounded">My Photos</button>
                    <button className="border border-gray-300 px-4 py-1 rounded">My Videos</button>
                    <button className="border border-gray-300 px-4 py-1 rounded">My Audio</button>
                  </div>
                  {uploadedImages.length === 0 ? (
                    <div className="text-center">
                      <p className="text-gray-600 mb-2">You haven't uploaded any media yet.</p>
                      <button className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-100">
                        Add stock media
                      </button>
                    </div>
                  ) : (
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
                            style={{ width: 'auto', height: 'auto' }}
                            className="object-cover rounded"
                          />
                          <span className="text-sm md:text-base">Image {index + 1}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

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
                          style={{ width: 'auto', height: 'auto' }}
                          className="object-cover rounded"
                        />
                        <span className="text-sm md:text-base">{template.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'Media' && (
                <div>
                  <h3 className="font-semibold mb-2 text-lg">Media</h3>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={addImage}
                    className="border p-2 rounded w-full text-sm md:text-base"
                  />
                  <p className="text-sm text-gray-600 mt-2">Add photos, videos, elements, and audio (images only for now).</p>
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

              {activeTab === 'AI' && (
                <div>
                  <h3 className="font-semibold mb-2 text-lg">AI Tools</h3>
                  <button
                    onClick={() => setShowFeaturePopup(true)}
                    className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm md:text-base"
                  >
                    Generate AI Content
                  </button>
                  <p className="text-sm text-gray-600 mt-2">AI features coming soon.</p>
                </div>
              )}

              {activeTab === 'Background' && (
                <div>
                  <h3 className="font-semibold mb-2 text-lg">Solid Color Background</h3>
                  <div className="space-y-2">
                    <label className="block">
                      Pick a color:
                      <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-full h-10 mt-1"
                      />
                    </label>
                    <div className="grid grid-cols-5 gap-2 mt-2">
                      {[
                        '#FFFFFF', '#F5F5F5', '#E5E5E5', '#D5D5D5', '#C5C5C5',
                        '#B5B5B5', '#A5A5A5', '#95A5A5', '#85A5A5', '#75A5A5',
                        '#65A5A5', '#55A5A5', '#45A5A5', '#35A5A5', '#25A5A5',
                        '#FF6347', '#FF4500', '#FF0000', '#C71585', '#FF1493',
                        '#FFD700', '#FFA500', '#FF8C00', '#000000', '#2F4F4F',
                      ].map((color) => (
                        <div
                          key={color}
                          className="w-8 h-8 rounded cursor-pointer"
                          style={{ backgroundColor: color }}
                          onClick={() => setBackgroundColor(color)}
                        />
                      ))}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={addBackgroundImage}
                      className="border p-2 rounded w-full text-sm md:text-base mt-2"
                    />
                    <div className="flex space-x-2 mt-2">
                      <button
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        onClick={() => setBackgroundColor(backgroundColor)}
                      >
                        Solid
                      </button>
                      <button
                        className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-100"
                        onClick={() => setShowFeaturePopup(true)}
                      >
                        Gradient
                      </button>
                    </div>
                    <button
                      onClick={removeBackground}
                      className="bg-red-500 text-white px-4 py-2 rounded w-full hover:bg-red-600 text-sm md:text-base mt-2"
                    >
                      Remove Background
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'Record' && (
                <div>
                  <h3 className="font-semibold mb-2 text-lg">Record</h3>
                  <button
                    onClick={recordMedia}
                    className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm md:text-base"
                  >
                    Capture Photo
                  </button>
                  <p className="text-sm text-gray-600 mt-2">Simulates capturing a photo.</p>
                </div>
              )}

              {activeTab === 'Slideshow' && (
                <div>
                  <h3 className="font-semibold mb-2 text-lg">Slideshow</h3>
                  <button
                    onClick={addSlideshow}
                    className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm md:text-base"
                  >
                    Add Slide
                  </button>
                  {slides.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm">Slides: {slides.length}</p>
                      <div className="flex space-x-2 mt-2">
                        <button
                          onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                          disabled={currentSlideIndex === 0}
                          className="p-1 bg-gray-200 rounded disabled:opacity-50"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setCurrentSlideIndex(Math.min(slides.length - 1, currentSlideIndex + 1))}
                          disabled={currentSlideIndex === slides.length - 1}
                          className="p-1 bg-gray-200 rounded disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'Draw' && (
                <div>
                  <h3 className="font-semibold mb-2 text-lg">Draw</h3>
                  <button
                    onClick={() => setIsDrawingMode(!isDrawingMode)}
                    className={`w-full p-2 rounded text-white ${isDrawingMode ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-sm md:text-base`}
                  >
                    {isDrawingMode ? 'Stop Drawing' : 'Start Drawing'}
                  </button>
                </div>
              )}

              {activeTab === 'Layout' && (
                <div>
                  <h3 className="font-semibold mb-2 text-lg">Layout</h3>
                  <button
                    onClick={() => addLayoutElement('schedule')}
                    className="w-full p-2 bg-gray-200 rounded hover:bg-gray-300 text-left text-sm md:text-base"
                  >
                    Add Schedule
                  </button>
                  <button
                    onClick={() => addLayoutElement('menu')}
                    className="w-full p-2 bg-gray-200 rounded hover:bg-gray-300 text-left text-sm md:text-base mt-2"
                  >
                    Add Menu
                  </button>
                </div>
              )}

              {activeTab !== 'Background' && activeTab !== 'My Uploads' && (
                <button
                  onClick={() => setActiveTab(null)}
                  className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600 mt-4"
                >
                  Apply changes
                </button>
              )}
            </div>
          </div>
        )}

        {/* Central Canvas */}
        <div className="flex-1 p-4 flex justify-center items-center bg-gray-200 relative">
          {canvasSize ? (
            <div
              className="overflow-auto relative"
              style={{
                width: `${canvasSize.width * zoom}px`,
                height: `${canvasSize.height * zoom}px`,
                maxWidth: '80%',
                maxHeight: '80%',
              }}
            >
              <canvas ref={canvasRef} className="border shadow-lg" />

              {/* Mobile Text Editing Arrow/Button */}
              {selectedElement && (selectedElement.type === 'textbox' || selectedElement.type === 'Textbox' || selectedElement.type === 'text') && (
                <div className="md:hidden">
                  {/* Arrow Button to Toggle Text Editing Panel */}
                  <button
                    onClick={() => setIsTextEditPanelOpen(!isTextEditPanelOpen)}
                    className="absolute bg-blue-500 text-white rounded-full p-2 shadow-lg"
                    style={{
                      left: selectedElement.left + (selectedElement.width * selectedElement.scaleX) / 2 - 16,
                      top: selectedElement.top - 40,
                      transform: 'translateX(-50%)',
                      zIndex: 100,
                    }}
                    aria-label={isTextEditPanelOpen ? "Close text editing panel" : "Open text editing panel"}
                  >
                    <svg
                      className={`w-4 h-4 transform ${isTextEditPanelOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Floating Text Editing Panel */}
                  {isTextEditPanelOpen && (
                    <div
                      className="absolute bg-white p-3 rounded-lg shadow-lg w-64 max-h-[80vh] min-h-[400px] overflow-y-auto z-50"
                      style={{
                        left: selectedElement.left + (selectedElement.width * selectedElement.scaleX) / 2,
                        top: selectedElement.top - 300,
                        transform: 'translateX(-50%)',
                        zIndex: 100,
                      }}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-bold">Edit Text</h3>
                        <button
                          onClick={() => setIsTextEditPanelOpen(false)}
                          className="text-gray-600"
                          aria-label="Close text editing panel"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <h4 className="text-xs font-semibold">Styles</h4>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => addText('Heading')}
                              className="p-1 bg-gray-200 rounded hover:bg-gray-300 text-xs"
                            >
                              Heading
                            </button>
                            <button
                              onClick={() => addText('Subheading')}
                              className="p-1 bg-gray-200 rounded hover:bg-gray-300 text-xs"
                            >
                              Subheading
                            </button>
                            <button
                              onClick={() => addText('Body')}
                              className="p-1 bg-gray-200 rounded hover:bg-gray-300 text-xs"
                            >
                              Body
                            </button>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold">Font</h4>
                          <select
                            value={textStyles.fontFamily}
                            onChange={(e) => setTextStyles({ ...textStyles, fontFamily: e.target.value })}
                            className="border p-1 rounded w-full text-xs"
                          >
                            <option value="Arial">Arial</option>
                            <option value="Times New Roman">Times New Roman</option>
                            <option value="Helvetica">Helvetica</option>
                            <option value="Raleway">Raleway</option>
                          </select>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => setTextStyles({ ...textStyles, fontWeight: textStyles.fontWeight === 'bold' ? 'normal' : 'bold' })}
                            className={`p-1 ${textStyles.fontWeight === 'bold' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                            aria-label={textStyles.fontWeight === 'bold' ? 'Remove bold' : 'Apply bold'}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4h-2a2 2 0 00-2 2v12a2 2 0 002 2h2a2 2 0 002-2v-5a2 2 0 00-2-2h-2m4-3h2a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setTextStyles({ ...textStyles, fontStyle: textStyles.fontStyle === 'italic' ? 'normal' : 'italic' })}
                            className={`p-1 ${textStyles.fontStyle === 'italic' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                            aria-label={textStyles.fontStyle === 'italic' ? 'Remove italic' : 'Apply italic'}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5h6l-6 14H3" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setShowFeaturePopup(true)}
                            className="p-1 bg-gray-200"
                            aria-label="Open additional text formatting options (coming soon)"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12l4-4m-4 4l4 4" />
                            </svg>
                          </button>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold">Size</h4>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => setTextStyles({ ...textStyles, fontSize: Math.max(8, textStyles.fontSize - 1) })}
                              className="p-1 bg-gray-200 rounded text-xs"
                              aria-label="Decrease font size"
                            >
                              -
                            </button>
                            <span className="text-xs">{textStyles.fontSize}</span>
                            <button
                              onClick={() => setTextStyles({ ...textStyles, fontSize: textStyles.fontSize + 1 })}
                              className="p-1 bg-gray-200 rounded text-xs"
                              aria-label="Increase font size"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold">Color</h4>
                          <input
                            type="color"
                            value={textStyles.fill}
                            onChange={(e) => setTextStyles({ ...textStyles, fill: e.target.value })}
                            className="w-full h-8"
                          />
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold">Opacity</h4>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => setTextStyles({ ...textStyles, opacity: Math.max(0, textStyles.opacity - 0.1) })}
                              className="p-1 bg-gray-200 rounded text-xs"
                              aria-label="Decrease opacity"
                            >
                              -
                            </button>
                            <span className="text-xs">{Math.round(textStyles.opacity * 100)}</span>
                            <button
                              onClick={() => setTextStyles({ ...textStyles, opacity: Math.min(1, textStyles.opacity + 0.1) })}
                              className="p-1 bg-gray-200 rounded text-xs"
                              aria-label="Increase opacity"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold">Alignment</h4>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => setTextStyles({ ...textStyles, textAlign: 'left' })}
                              className={`p-1 ${textStyles.textAlign === 'left' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                              aria-label="Align text left"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h12M4 14h16M4 18h12" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setTextStyles({ ...textStyles, textAlign: 'center' })}
                              className={`p-1 ${textStyles.textAlign === 'center' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                              aria-label="Align text center"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M6 10h12M4 14h16M6 18h12" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setTextStyles({ ...textStyles, textAlign: 'right' })}
                              className={`p-1 ${textStyles.textAlign === 'right' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                              aria-label="Align text right"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M8 10h12M4 14h16M8 18h12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold">Vertical Alignment</h4>
                          <div className="flex space-x-1">
                            <button onClick={() => setShowFeaturePopup(true)} className="p-1 bg-gray-200" aria-label="Align text top (coming soon)">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m-8-8h16" />
                              </svg>
                            </button>
                            <button onClick={() => setShowFeaturePopup(true)} className="p-1 bg-gray-200" aria-label="Align text middle (coming soon)">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 12v8m-8-8h16" />
                              </svg>
                            </button>
                            <button onClick={() => setShowFeaturePopup(true)} className="p-1 bg-gray-200" aria-label="Align text bottom (coming soon)">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v8m-8-4h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold">Line Height</h4>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => setTextStyles({ ...textStyles, lineHeight: Math.max(0.5, textStyles.lineHeight - 0.1) })}
                              className="p-1 bg-gray-200 rounded text-xs"
                              aria-label="Decrease line height"
                            >
                              -
                            </button>
                            <span className="text-xs">{textStyles.lineHeight.toFixed(1)}</span>
                            <button
                              onClick={() => setTextStyles({ ...textStyles, lineHeight: textStyles.lineHeight + 0.1 })}
                              className="p-1 bg-gray-200 rounded text-xs"
                              aria-label="Increase line height"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold">Letter Spacing</h4>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => setTextStyles({ ...textStyles, charSpacing: Math.max(-100, textStyles.charSpacing - 10) })}
                              className="p-1 bg-gray-200 rounded text-xs"
                              aria-label="Decrease letter spacing"
                            >
                              -
                            </button>
                            <span className="text-xs">{textStyles.charSpacing}</span>
                            <button
                              onClick={() => setTextStyles({ ...textStyles, charSpacing: textStyles.charSpacing + 10 })}
                              className="p-1 bg-gray-200 rounded text-xs"
                              aria-label="Increase letter spacing"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <p>Loading canvas dimensions...</p>
            </div>
          )}

          {/* Mobile Bottom Toolbar */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white p-2 flex justify-around items-center shadow-lg">
            <button
              onClick={() => setIsAddMenuOpen(true)}
              className="flex flex-col items-center text-blue-500"
              aria-label="Open add menu"
              tabIndex={0}
            >
              <div className="bg-blue-500 text-white rounded-full p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-xs mt-1">Add</span>
            </button>
            <button
              onClick={() => setShowCustomDimensions(true)}
              className="flex flex-col items-center"
              aria-label="Resize canvas"
              tabIndex={0}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h8m-4-4v8m-4 4h8" />
              </svg>
              <span className="text-xs mt-1">Resize</span>
            </button>
            <button
              onClick={() => setActiveTab('Background')}
              className="flex flex-col items-center"
              aria-label="Change background"
              tabIndex={0}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4h16v16H4z" />
              </svg>
              <span className="text-xs mt-1">Background</span>
            </button>
            <button
              onClick={() => setActiveTab('Text')}
              className="flex flex-col items-center"
              aria-label="Add text"
              tabIndex={0}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5h6m-6 4h6m-6 4h6" />
              </svg>
              <span className="text-xs mt-1">Title</span>
            </button>
            <button
              onClick={deleteSelectedElement}
              disabled={!selectedElement}
              className="flex flex-col items-center disabled:opacity-50"
              aria-label="Delete selected element"
              tabIndex={0}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4M4 7h16" />
              </svg>
              <span className="text-xs mt-1">Delete</span>
            </button>
            <button
              onClick={() => setShowGrid(!showGrid)}
              className="flex flex-col items-center"
              aria-label={showGrid ? "Hide grid" : "Show grid"}
              tabIndex={0}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <span className="text-xs mt-1">Grid</span>
            </button>
            <button
              onClick={() => setShowFolds(!showFolds)}
              className="flex flex-col items-center"
              aria-label={showFolds ? "Hide folds" : "Show folds"}
              tabIndex={0}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <span className="text-xs mt-1">Folds</span>
            </button>
            <button
              onClick={() => setShowBleed(!showBleed)}
              className="flex flex-col items-center"
              aria-label={showBleed ? "Hide bleed" : "Show bleed"}
              tabIndex={0}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4h16v16H4z" />
              </svg>
              <span className="text-xs mt-1">Bleed</span>
            </button>
          </div>

          {/* Mobile Add Menu */}
          {isAddMenuOpen && (
            <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg w-11/12 max-w-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-lg">Add Elements</h3>
                  <button
                    onClick={() => setIsAddMenuOpen(false)}
                    className="text-gray-600"
                    aria-label="Close add menu"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    </button>
              </div>
              <div className="space-y-2">
                {[
                  { name: 'My Uploads', icon: 'M3 16h18M3 12h18m0 0l-9-9m9 9l-9 9', desc: 'Add from My Uploads, Google Drive, and more' },
                  { name: 'Templates', icon: 'M4 5a2 2 0 012-2h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5z', desc: 'Explore templates for your design' },
                  { name: 'Media', icon: 'M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z', desc: 'Add photos, videos, elements, and audio' },
                  { name: 'Text', icon: 'M9 5h6m-6 4h6m-6 4h6', desc: 'Choose from a variety of text styles' },
                  { name: 'AI', icon: 'M12 2a10 10 0 00-7.35 16.65M12 2a10 10 0 017.35 16.65M12 2v20', desc: 'Transform your ideas with AI' },
                  { name: 'Background', icon: 'M4 4h16v16H4z', desc: 'Change the background of your design' },
                  { name: 'Record', icon: 'M3 12h18M12 3v18', desc: 'Capture photos, videos, or audio' },
                  { name: 'Slideshow', icon: 'M15 5l5 5m0 0l-5 5m5-5H5', desc: 'Create text, photo, and video slideshows' },
                  { name: 'Draw', icon: 'M15 5l5 5m0 0l-5 5m5-5H5', desc: 'Use a free-hand drawing tool' },
                  { name: 'Layout', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16', desc: 'Add schedules, menus, tables, and more' },
                ].map((tab) => (
                  <div
                    key={tab.name}
                    className="p-2 rounded cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      setActiveTab(tab.name);
                      setIsAddMenuOpen(false);
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon} />
                      </svg>
                      <div>
                        <h3 className="font-semibold">{tab.name}</h3>
                        <p className="text-sm text-gray-600">{tab.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar (Text Editing Panel for Desktop) */}
      <div className="hidden md:block w-64 bg-white p-4 shadow-md overflow-y-auto">
        {selectedElement && (selectedElement.type === 'textbox' || selectedElement.type === 'Textbox' || selectedElement.type === 'text') ? (
          <div>
            <h2 className="text-lg font-bold mb-4">Text Options</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Styles</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => addText('Heading')}
                    className="p-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Heading
                  </button>
                  <button
                    onClick={() => addText('Subheading')}
                    className="p-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Subheading
                  </button>
                  <button
                    onClick={() => addText('Body')}
                    className="p-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Body
                  </button>
                </div>
              </div>
              <div>
                <h3 className="font-semibold">Font</h3>
                <select
                  value={textStyles.fontFamily}
                  onChange={(e) => setTextStyles({ ...textStyles, fontFamily: e.target.value })}
                  className="border p-2 rounded w-full"
                >
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Raleway">Raleway</option>
                </select>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setTextStyles({ ...textStyles, fontWeight: textStyles.fontWeight === 'bold' ? 'normal' : 'bold' })}
                  className={`p-2 ${textStyles.fontWeight === 'bold' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  aria-label={textStyles.fontWeight === 'bold' ? 'Remove bold' : 'Apply bold'}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4h-2a2 2 0 00-2 2v12a2 2 0 002 2h2a2 2 0 002-2v-5a2 2 0 00-2-2h-2m4-3h2a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
                  </svg>
                </button>
                <button
                  onClick={() => setTextStyles({ ...textStyles, fontStyle: textStyles.fontStyle === 'italic' ? 'normal' : 'italic' })}
                  className={`p-2 ${textStyles.fontStyle === 'italic' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  aria-label={textStyles.fontStyle === 'italic' ? 'Remove italic' : 'Apply italic'}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5h6l-6 14H3" />
                  </svg>
                </button>
                <button
                  onClick={() => setShowFeaturePopup(true)}
                  className="p-2 bg-gray-200"
                  aria-label="Open additional text formatting options (coming soon)"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12l4-4m-4 4l4 4" />
                  </svg>
                </button>
              </div>
              <div>
                <h3 className="font-semibold">Size</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setTextStyles({ ...textStyles, fontSize: Math.max(8, textStyles.fontSize - 1) })}
                    className="p-2 bg-gray-200 rounded"
                    aria-label="Decrease font size"
                  >
                    -
                  </button>
                  <span>{textStyles.fontSize}</span>
                  <button
                    onClick={() => setTextStyles({ ...textStyles, fontSize: textStyles.fontSize + 1 })}
                    className="p-2 bg-gray-200 rounded"
                    aria-label="Increase font size"
                  >
                    +
                  </button>
                </div>
              </div>
              <div>
                <h3 className="font-semibold">Color</h3>
                <input
                  type="color"
                  value={textStyles.fill}
                  onChange={(e) => setTextStyles({ ...textStyles, fill: e.target.value })}
                  className="w-full h-10"
                />
              </div>
              <div>
                <h3 className="font-semibold">Opacity</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setTextStyles({ ...textStyles, opacity: Math.max(0, textStyles.opacity - 0.1) })}
                    className="p-2 bg-gray-200 rounded"
                    aria-label="Decrease opacity"
                  >
                    -
                  </button>
                  <span>{Math.round(textStyles.opacity * 100)}</span>
                  <button
                    onClick={() => setTextStyles({ ...textStyles, opacity: Math.min(1, textStyles.opacity + 0.1) })}
                    className="p-2 bg-gray-200 rounded"
                    aria-label="Increase opacity"
                  >
                    +
                  </button>
                </div>
              </div>
              <div>
                <h3 className="font-semibold">Alignment</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setTextStyles({ ...textStyles, textAlign: 'left' })}
                    className={`p-2 ${textStyles.textAlign === 'left' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    aria-label="Align text left"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h12M4 14h16M4 18h12" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setTextStyles({ ...textStyles, textAlign: 'center' })}
                    className={`p-2 ${textStyles.textAlign === 'center' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    aria-label="Align text center"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M6 10h12M4 14h16M6 18h12" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setTextStyles({ ...textStyles, textAlign: 'right' })}
                    className={`p-2 ${textStyles.textAlign === 'right' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    aria-label="Align text right"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M8 10h12M4 14h16M8 18h12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div>
                <h3 className="font-semibold">Vertical Alignment</h3>
                <div className="flex space-x-2">
                  <button onClick={() => setShowFeaturePopup(true)} className="p-2 bg-gray-200" aria-label="Align text top (coming soon)">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m-8-8h16" />
                    </svg>
                  </button>
                  <button onClick={() => setShowFeaturePopup(true)} className="p-2 bg-gray-200" aria-label="Align text middle (coming soon)">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 12v8m-8-8h16" />
                    </svg>
                  </button>
                  <button onClick={() => setShowFeaturePopup(true)} className="p-2 bg-gray-200" aria-label="Align text bottom (coming soon)">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v8m-8-4h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <div>
                <h3 className="font-semibold">Line Height</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setTextStyles({ ...textStyles, lineHeight: Math.max(0.5, textStyles.lineHeight - 0.1) })}
                    className="p-2 bg-gray-200 rounded"
                    aria-label="Decrease line height"
                  >
                    -
                  </button>
                  <span>{textStyles.lineHeight.toFixed(1)}</span>
                  <button
                    onClick={() => setTextStyles({ ...textStyles, lineHeight: textStyles.lineHeight + 0.1 })}
                    className="p-2 bg-gray-200 rounded"
                    aria-label="Increase line height"
                  >
                    +
                  </button>
                </div>
              </div>
              <div>
                <h3 className="font-semibold">Letter Spacing</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setTextStyles({ ...textStyles, charSpacing: Math.max(-100, textStyles.charSpacing - 10) })}
                    className="p-2 bg-gray-200 rounded"
                    aria-label="Decrease letter spacing"
                  >
                    -
                  </button>
                  <span>{textStyles.charSpacing}</span>
                  <button
                    onClick={() => setTextStyles({ ...textStyles, charSpacing: textStyles.charSpacing + 10 })}
                    className="p-2 bg-gray-200 rounded"
                    aria-label="Increase letter spacing"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-bold mb-4">Design Options</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Canvas Size</h3>
                <select
                  value={designCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="border p-2 rounded w-full"
                >
                  {Object.keys(designCategories).map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <h3 className="font-semibold">Zoom</h3>
                <input
                  type="range"
                  min="0.1"
                  max="2"
                  step="0.1"
                  value={zoom}
                  onChange={(e) => handleZoom(parseFloat(e.target.value))}
                  className="w-full"
                />
                <span>{Math.round(zoom * 100)}%</span>
              </div>
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={showGrid}
                    onChange={() => setShowGrid(!showGrid)}
                  />
                  <span>Show Grid</span>
                </label>
              </div>
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={showFolds}
                    onChange={() => setShowFolds(!showFolds)}
                  />
                  <span>Show Folds</span>
                </label>
              </div>
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={showBleed}
                    onChange={() => setShowBleed(!showBleed)}
                  />
                  <span>Show Bleed</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);
}
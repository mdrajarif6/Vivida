import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Upload, Undo2, Redo2, RotateCcw, Download, Sparkles, Sliders, Crop, 
  Paintbrush, Type, Smile, Frame, History, RefreshCw, ZoomIn, 
  ZoomOut, Maximize2, Trash2, Check, X, FileImage, Palette, 
  ChevronRight, Bold, Italic, Image as ImageIcon, LayoutTemplate,
  Wand2, User
} from 'lucide-react';
import { 
  ImageSettings, DrawingPath, TextLayer, StickerLayer, HistoryState, CropBox 
} from './types';
import { drawImageWithSettings, computeRenderSize } from './utils/canvasRenderer';
import CropOverlay from './components/CropOverlay';
import LandingPage from './LandingPage';
import AdBanner from './components/AdBanner';
import ProModal from './components/ProModal';
import ConnectWallet from './components/ConnectWallet';
import AuthModal from './components/AuthModal';
import DashboardModal from './components/DashboardModal';
import logoImg from './assets/logo.png';
import { useAuth } from './contexts/AuthContext';
import { removeImageBackground } from './utils/aiFeatures';
import { generateMetaImage, applyMetaSAM } from './utils/metaAiFeatures';

// @ts-ignore - import worker as a URL
const DEFAULT_SETTINGS: ImageSettings = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  grayscale: 0,
  sepia: 0,
  hueRotate: 0,
  blur: 0,
  invert: 0,
  exposure: 0,
  temperature: 0,
  vignette: 0,
  noise: 0,
  rotation: 0,
  flipH: false,
  flipV: false,
  filter: 'none',
  borderStyle: 'none',
  borderColor: '#ffffff',
  borderWidth: 15,
};

const FILTER_PRESETS = [
  { id: 'none', name: 'Original', desc: 'No modifications' },
  { id: 'vintage', name: 'Vintage film', desc: 'Warm, high sepia and contrast', settings: { sepia: 45, temperature: 30, contrast: 110, saturation: 90 } },
  { id: 'cyberpunk', name: 'Cyberpunk', isPremium: true, desc: 'Neon neon vibes with high saturation', settings: { saturation: 150, hueRotate: 310, temperature: -30, brightness: 105 } },
  { id: 'dramatic', name: 'Dramatic', isPremium: true, desc: 'High contrast, low saturation noir', settings: { contrast: 145, saturation: 50, exposure: -5, vignette: 25 } },
  { id: 'lomo', name: 'Lomo', desc: 'High contrast and heavy vignette', settings: { vignette: 65, contrast: 125, saturation: 120, brightness: 95 } },
  { id: 'mono', name: 'Noir B&W', desc: 'Crisp black and white portrait', settings: { grayscale: 100, contrast: 135, brightness: 100 } },
  { id: 'warm', name: 'Golden Hour', desc: 'Warm amber sunshine tint', settings: { temperature: 50, brightness: 105, saturation: 110 } },
  { id: 'cool', name: 'Nordic Cool', desc: 'Calming cool blue tint', settings: { temperature: -40, brightness: 100, saturation: 95, contrast: 105 } },
  { id: 'polaroid', name: 'Polaroid Style', desc: 'Muted vintage shades with low contrast', settings: { sepia: 25, contrast: 85, brightness: 110, saturation: 85 } }
];

const SAMPLE_IMAGES = [
  {
    title: 'Sunset Skyline',
    url: 'https://images.pexels.com/photos/12841274/pexels-photo-12841274.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    description: 'City skyline reflecting in river at dusk',
  },
  {
    title: 'Rome Architecture',
    url: 'https://images.pexels.com/photos/38087339/pexels-photo-38087339.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    description: 'Charming Roman facades and street',
  },
  {
    title: 'Elegant Model',
    url: 'https://images.pexels.com/photos/36991036/pexels-photo-36991036.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    description: 'Stylish portrait photography',
  },
  {
    title: 'Singapore Dusk',
    url: 'https://images.pexels.com/photos/881727/pexels-photo-881727.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    description: 'High-rise skyscrapers under brilliant sky',
  },
  {
    title: 'Modern Abstract',
    url: 'https://images.pexels.com/photos/38291492/pexels-photo-38291492.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    description: 'Vibrant red pipes and deep blue sky',
  },
  {
    title: 'Suburban Ivy',
    url: 'https://images.pexels.com/photos/10680242/pexels-photo-10680242.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    description: 'Charming house exterior with fresh green leaves',
  },
];

const BRUSH_COLORS = [
  '#000000', '#ffffff', '#ef4444', '#f97316', '#f59e0b', '#10b981', 
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#a855f7'
];

const EMOJI_STICKERS = [
  '🔥', '✨', '🚀', '❤️', '🌟', '🎉', '💯', '💡', '💥', '💀',
  '😂', '😎', '😍', '🥳', '🤔', '🤯', '😴', '🤫', '👿', '🤡',
  '📸', '🎵', '🎨', '🌈', '⚡', '🍕', '☕', '🪐', '👑', '💬',
  '🌸', '🍀', '🐾', '🕶️', '🎩', '🎈', '🎁', '🧸', '🎯', '📍'
];

const FONTS = [
  { id: 'Poppins', name: 'Poppins (Modern)' },
  { id: 'Montserrat', name: 'Montserrat (Bold)' },
  { id: 'Playfair Display', name: 'Playfair (Elegant)' },
  { id: 'Pacifico', name: 'Pacifico (Cursive)' },
  { id: 'Lobster', name: 'Lobster (Bold Retro)' },
  { id: 'Caveat', name: 'Caveat (Handwritten)' },
  { id: 'Special Elite', name: 'Special Elite (Typewriter)' },
  { id: 'monospace', name: 'Monospace' }
];

export default function App() {
  // Monetization States
  const [showProModal, setShowProModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  
  const { user } = useAuth();
  const isPro = user?.is_pro || false; 
  
  // Web3 Auth States
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  // AI States
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isAdobeProcessing, setIsAdobeProcessing] = useState(false);
  const [isMetaGenerating, setIsMetaGenerating] = useState(false);
  const [metaPrompt, setMetaPrompt] = useState('');
  
  // Free tier project tracking
  const [projectsCount, setProjectsCount] = useState(0);

  useEffect(() => {
    const currentMonth = new Date().getMonth().toString();
    const savedMonth = localStorage.getItem('resizzy_month');
    if (savedMonth !== currentMonth) {
      localStorage.setItem('resizzy_month', currentMonth);
      localStorage.setItem('resizzy_projects_count', '0');
      setProjectsCount(0);
    } else {
      const count = parseInt(localStorage.getItem('resizzy_projects_count') || '0', 10);
      setProjectsCount(count);
    }
  }, []);

  // Main States
  const [hasStarted, setHasStarted] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [settings, setSettings] = useState<ImageSettings>(DEFAULT_SETTINGS);
  
  // Annotation layers
  const [drawings, setDrawings] = useState<DrawingPath[]>([]);
  const [texts, setTexts] = useState<TextLayer[]>([]);
  const [stickers, setStickers] = useState<StickerLayer[]>([]);

  // Editing state controls
  const [activeTab, setActiveTab] = useState<string>('adjust');
  const [zoom, setZoom] = useState<number>(100);
  const [isCropMode, setIsCropMode] = useState<boolean>(false);
  const [cropAspectRatio, setCropAspectRatio] = useState<string>('free');
  const [cropBox, setCropBox] = useState<CropBox>({ x: 10, y: 10, width: 80, height: 80 });

  // Drawing Brush configurations
  const [brushColor, setBrushColor] = useState<string>('#ef4444');
  const [brushWidth, setBrushWidth] = useState<number>(8);
  const [brushOpacity, setBrushOpacity] = useState<number>(1.0);
  const [brushMode, setBrushMode] = useState<'brush' | 'eraser'>('brush');
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const activePathRef = useRef<DrawingPath | null>(null);

  // Dragging states for Text and Stickers
  const [activeLayer, setActiveLayer] = useState<{ type: 'text' | 'sticker'; id: string } | null>(null);
  const dragStartOffset = useRef({ x: 0, y: 0 });

  // History system
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Export settings modal
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [exportQuality, setExportQuality] = useState<number>(90);
  const [exportWidth, setExportWidth] = useState<number>(0);
  const [exportHeight, setExportHeight] = useState<number>(0);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Cloud Share states
  const [isCloudSaving, setIsCloudSaving] = useState<boolean>(false);
  const [shareableUrl, setShareableUrl] = useState<string | null>(null);

  // Advanced AI
  const [isAiUpscaling, setIsAiUpscaling] = useState<boolean>(false);

  // Canvas Reference
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  // Initialize and scale zoom to fit screen size beautifully
  const autoFitZoom = (imgW: number, imgH: number) => {
    if (!viewportRef.current) return;
    const viewportW = viewportRef.current.clientWidth - 48; // padding
    const viewportH = viewportRef.current.clientHeight - 48;

    const widthScale = viewportW / imgW;
    const heightScale = viewportH / imgH;
    const bestScale = Math.min(widthScale, heightScale, 10); // Cap auto-zoom at 1000%
    setZoom(Math.round(bestScale * 100));
  };

  // Helper to load image from src URL
  const loadImage = (src: string, actionName: string = 'Load Image') => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setOriginalImage(img);
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      setOriginalDimensions({ width: w, height: h });
      setImageSrc(src);

      // Auto set export dimensions
      setExportWidth(w);
      setExportHeight(h);

      // Reset tools & zoom
      const freshSettings = { ...DEFAULT_SETTINGS };
      setSettings(freshSettings);
      setDrawings([]);
      setTexts([]);
      setStickers([]);
      setIsCropMode(false);

      // Push to History
      const firstState: HistoryState = {
        imageSrc: src,
        originalDimensions: { width: w, height: h },
        settings: freshSettings,
        drawings: [],
        texts: [],
        stickers: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        actionName,
      };
      setHistory([firstState]);
      setHistoryIndex(0);

      // Timeout to ensure ref is mounted
      setTimeout(() => {
        autoFitZoom(w, h);
      }, 50);
    };
    img.src = src;
  };

  // Load a preset sample image initially
  useEffect(() => {
    loadImage(SAMPLE_IMAGES[0].url, 'Load Sample Sunset');
  }, []);

  // Update canvas anytime dependencies change
  useEffect(() => {
    if (!originalImage || !canvasRef.current) return;
    drawImageWithSettings(canvasRef.current, {
      image: originalImage,
      settings,
      drawings,
      texts,
      stickers,
    });
  }, [originalImage, settings, drawings, texts, stickers, isCropMode, activeTab, activeLayer]);

  // Compute rotated and bordered size on screen
  const displayDimensions = useMemo(() => {
    if (originalDimensions.width === 0) {
      return { width: 0, height: 0, rotatedWidth: 0, rotatedHeight: 0 };
    }
    return computeRenderSize(originalDimensions.width, originalDimensions.height, settings);
  }, [originalDimensions, settings]);

  // History State Commit function
  const commitState = (actionName: string, updatedSettings = settings, updatedDrawings = drawings, updatedTexts = texts, updatedStickers = stickers, updatedSrc = imageSrc) => {
    if (!updatedSrc) return;
    const newState: HistoryState = {
      imageSrc: updatedSrc,
      originalDimensions: { ...originalDimensions },
      settings: { ...updatedSettings },
      drawings: [...updatedDrawings],
      texts: [...updatedTexts],
      stickers: [...updatedStickers],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      actionName,
    };

    const newHistory = history.slice(0, historyIndex + 1);
    setHistory([...newHistory, newState]);
    setHistoryIndex(newHistory.length);
  };

  // Undo / Redo Actions
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const state = history[prevIndex];
      setHistoryIndex(prevIndex);
      applyHistoryState(state);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const state = history[nextIndex];
      setHistoryIndex(nextIndex);
      applyHistoryState(state);
    }
  };

  const applyHistoryState = (state: HistoryState) => {
    setSettings(state.settings);
    setDrawings(state.drawings);
    setTexts(state.texts);
    setStickers(state.stickers);
    setOriginalDimensions(state.originalDimensions);
    
    if (state.imageSrc !== imageSrc) {
      setImageSrc(state.imageSrc);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setOriginalImage(img);
      };
      img.src = state.imageSrc;
    }
  };

  const handleResetAll = () => {
    if (confirm('Are you sure you want to reset all edits? This cannot be undone.')) {
      setSettings(DEFAULT_SETTINGS);
      setDrawings([]);
      setTexts([]);
      setStickers([]);
      setIsCropMode(false);
      commitState('Reset All Edits', DEFAULT_SETTINGS, [], [], []);
    }
  };

  // Handle Local Image Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!isPro && (ext === 'raw' || ext === 'dng' || ext === 'cr2')) {
        setShowProModal(true);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          loadImage(event.target.result as string, `Upload: ${file.name}`);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  // Handle Slider values changes
  const updateSetting = (key: keyof ImageSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  // Debounced/Ended commit for slider drags
  const handleSliderChangeEnd = (actionName: string) => {
    commitState(actionName);
  };

  // Apply a preset filter bundle
  const handleApplyPresetFilter = (preset: typeof FILTER_PRESETS[0]) => {
    if ((preset as any).isPremium && !isPro) {
      setShowProModal(true);
      return;
    }
    
    if (preset.id === 'none') {
      setSettings(DEFAULT_SETTINGS);
      commitState('Reset to Original Filter');
      return;
    }
    
    let nextSettings = { ...DEFAULT_SETTINGS, filter: preset.id };
    if (preset.settings) {
      nextSettings = { ...nextSettings, ...preset.settings };
    }
    setSettings(nextSettings);
    commitState(`Apply Filter: ${preset.name}`, nextSettings);
  };

  // Apply Crop Transformation
  const handleApplyCrop = () => {
    if (!originalImage || !canvasRef.current) return;

    const w = originalDimensions.width;
    const h = originalDimensions.height;

    // We create a temporary canvas to render the cropped region
    const tempCanvas = document.createElement('canvas');
    const cropPixelX = (cropBox.x / 100) * w;
    const cropPixelY = (cropBox.y / 100) * h;
    const cropPixelW = (cropBox.width / 100) * w;
    const cropPixelH = (cropBox.height / 100) * h;

    tempCanvas.width = cropPixelW;
    tempCanvas.height = cropPixelH;

    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return;

    // Draw only the cropped portion from the original image
    ctx.drawImage(
      originalImage,
      cropPixelX, cropPixelY, cropPixelW, cropPixelH, // src rect
      0, 0, cropPixelW, cropPixelH // dest rect
    );

    const croppedDataUrl = tempCanvas.toDataURL('image/png');

    // Load cropped data as the NEW base image source
    loadImage(croppedDataUrl, 'Crop Image');
    setIsCropMode(false);
  };

  // Draggable Drawing Capture
  const handleDrawStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (activeTab !== 'draw' || isCropMode) return;
    setIsDrawing(true);

    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const px = ((clientX - rect.left) / rect.width) * 100;
    const py = ((clientY - rect.top) / rect.height) * 100;

    const newPath: DrawingPath = {
      id: Math.random().toString(36).substr(2, 9),
      points: [{ x: px, y: py }],
      color: brushMode === 'eraser' ? '#000000' : brushColor,
      width: brushWidth,
      opacity: brushOpacity,
      mode: brushMode,
    };

    activePathRef.current = newPath;
    setDrawings((prev) => [...prev, newPath]);
  };

  const handleDrawMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isDrawing || !activePathRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const px = ((clientX - rect.left) / rect.width) * 100;
    const py = ((clientY - rect.top) / rect.height) * 100;

    // Boundary check
    if (px >= 0 && px <= 100 && py >= 0 && py <= 100) {
      const updatedPoints = [...activePathRef.current.points, { x: px, y: py }];
      activePathRef.current.points = updatedPoints;
      
      const currentId = activePathRef.current.id;

      setDrawings((prev) =>
        prev.map((path) => (path.id === currentId ? { ...path, points: updatedPoints } : path))
      );
    }
  };

  const handleDrawEnd = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    setDrawings((latestDrawings) => {
      setTimeout(() => {
        commitState(brushMode === 'eraser' ? 'Eraser Stroke' : 'Brush Paint', settings, latestDrawings);
      }, 0);
      return latestDrawings;
    });
    
    activePathRef.current = null;
  };

  // Add Creative Text Layer
  const handleAddText = () => {
    const newText: TextLayer = {
      id: Math.random().toString(36).substr(2, 9),
      text: 'Double click to edit',
      x: 50,
      y: 50,
      color: '#ffffff',
      fontSize: 32,
      fontFamily: 'Montserrat',
      fontWeight: 'bold',
      fontStyle: 'normal',
      shadowColor: '#000000',
      shadowBlur: 4,
    };
    const nextTexts = [...texts, newText];
    setTexts(nextTexts);
    commitState('Add Text Layer', settings, drawings, nextTexts);
  };

  const handleUpdateTextProperty = (id: string, key: keyof TextLayer, value: any) => {
    const nextTexts = texts.map((t) => (t.id === id ? { ...t, [key]: value } : t));
    setTexts(nextTexts);
  };

  const handleTextPropertyBlur = () => {
    commitState('Edit Text Properties');
  };

  const handleDeleteText = (id: string) => {
    const nextTexts = texts.filter((t) => t.id !== id);
    setTexts(nextTexts);
    commitState('Delete Text Layer', settings, drawings, nextTexts);
  };

  // Add Emojis / Stickers
  const handleAddSticker = (emoji: string) => {
    const newSticker: StickerLayer = {
      id: Math.random().toString(36).substr(2, 9),
      emoji,
      x: 50,
      y: 50,
      size: 48,
      rotation: 0,
    };
    const nextStickers = [...stickers, newSticker];
    setStickers(nextStickers);
    commitState(`Add Sticker: ${emoji}`, settings, drawings, texts, nextStickers);
  };

  const handleUpdateStickerProperty = (id: string, key: keyof StickerLayer, value: any) => {
    setStickers((prev) => prev.map((s) => (s.id === id ? { ...s, [key]: value } : s)));
  };

  const handleDeleteSticker = (id: string) => {
    const nextStickers = stickers.filter((s) => s.id !== id);
    setStickers(nextStickers);
    commitState('Delete Sticker', settings, drawings, texts, nextStickers);
  };

  // Interactive Layer Drag & Drop logic on Image Frame Overlay
  const handleLayerDragStart = (
    e: React.MouseEvent | React.TouchEvent,
    type: 'text' | 'sticker',
    layerId: string
  ) => {
    e.stopPropagation();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    setActiveLayer({ type, id: layerId });
    dragStartOffset.current = {
      x: clientX,
      y: clientY,
    };
  };

  useEffect(() => {
    const handleGlobalDragMove = (e: MouseEvent | TouchEvent) => {
      if (!activeLayer || !viewportRef.current) return;

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - dragStartOffset.current.x;
      const deltaY = clientY - dragStartOffset.current.y;

      // Determine canvas displayed screen boundaries inside our zoom viewport container
      // Since zoom scales the container, actual pixels should be divided by the zoom ratio to calculate correctly!
      const zoomFactor = zoom / 100;
      const displayW = displayDimensions.rotatedWidth || displayDimensions.width;
      const displayH = displayDimensions.rotatedHeight || displayDimensions.height;

      // Delta in display percentage
      const percentDeltaX = ((deltaX / zoomFactor) / displayW) * 100;
      const percentDeltaY = ((deltaY / zoomFactor) / displayH) * 100;

      if (activeLayer.type === 'text') {
        setTexts((prev) =>
          prev.map((t) => {
            if (t.id === activeLayer.id) {
              return {
                ...t,
                x: Math.min(100, Math.max(0, t.x + percentDeltaX)),
                y: Math.min(100, Math.max(0, t.y + percentDeltaY)),
              };
            }
            return t;
          })
        );
      } else {
        setStickers((prev) =>
          prev.map((s) => {
            if (s.id === activeLayer.id) {
              return {
                ...s,
                x: Math.min(100, Math.max(0, s.x + percentDeltaX)),
                y: Math.min(100, Math.max(0, s.y + percentDeltaY)),
              };
            }
            return s;
          })
        );
      }

      // Reset drag reference anchor
      dragStartOffset.current = {
        x: clientX,
        y: clientY,
      };
    };

    const handleGlobalDragEnd = () => {
      if (activeLayer) {
        const type = activeLayer.type;
        setActiveLayer(null);
        
        if (type === 'text') {
          setTexts(latestTexts => {
            setTimeout(() => commitState(`Positioned Layer`, settings, drawings, latestTexts, stickers), 0);
            return latestTexts;
          });
        } else {
          setStickers(latestStickers => {
            setTimeout(() => commitState(`Positioned Layer`, settings, drawings, texts, latestStickers), 0);
            return latestStickers;
          });
        }
      }
    };

    if (activeLayer) {
      window.addEventListener('mousemove', handleGlobalDragMove);
      window.addEventListener('mouseup', handleGlobalDragEnd);
      window.addEventListener('touchmove', handleGlobalDragMove);
      window.addEventListener('touchend', handleGlobalDragEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalDragMove);
      window.removeEventListener('mouseup', handleGlobalDragEnd);
      window.removeEventListener('touchmove', handleGlobalDragMove);
      window.removeEventListener('touchend', handleGlobalDragEnd);
    };
  }, [activeLayer, displayDimensions, zoom]);

  // Export & Download High-Res Canvas Logic
  const handleTriggerExport = () => {
    if (!originalDimensions.width) return;
    setExportWidth(originalDimensions.width);
    setExportHeight(originalDimensions.height);
    setShowExportModal(true);
  };

  const handleExportWidthChange = (val: number) => {
    setExportWidth(val);
    // maintain aspect ratio
    const ratio = originalDimensions.height / originalDimensions.width;
    setExportHeight(Math.round(val * ratio));
  };

  const handleExportHeightChange = (val: number) => {
    setExportHeight(val);
    const ratio = originalDimensions.width / originalDimensions.height;
    setExportWidth(Math.round(val * ratio));
  };

  const handleSaveExport = async () => {
    if (!originalImage) return;
    
    const maxDimension = Math.max(exportWidth, exportHeight);
    if (maxDimension > 1920 && !isPro) {
      setShowExportModal(false);
      setShowProModal(true);
      return;
    }
    
    if (!isPro && projectsCount >= 5) {
      setShowExportModal(false);
      setShowProModal(true);
      return;
    }

    
    setIsExporting(true);

    // Timeout to yield main thread for UI spinner
    setTimeout(() => {
      try {
        const exportCanvas = document.createElement('canvas');
        
        // Calculate the scale relative to standard canvas dimensions
        const scaleFactor = exportWidth / originalDimensions.width;

        drawImageWithSettings(exportCanvas, {
          image: originalImage,
          settings,
          drawings,
          texts,
          stickers,
          exportScale: scaleFactor,
        });

        // Convert and trigger download
        const mimeType = exportFormat === 'png' ? 'image/png' : exportFormat === 'webp' ? 'image/webp' : 'image/jpeg';
        const quality = exportFormat === 'png' ? undefined : exportQuality / 100;
        
        const dataUrl = exportCanvas.toDataURL(mimeType, quality);
        
        const link = document.createElement('a');
        link.download = `resizzy_edit_${Date.now()}.${exportFormat}`;
        link.href = dataUrl;
        link.click();

        if (!isPro) {
          const newCount = projectsCount + 1;
          setProjectsCount(newCount);
          localStorage.setItem('resizzy_projects_count', newCount.toString());
        }

        setShowExportModal(false);
      } catch (err) {
        console.error('Failed to export image', err);
        alert('Could not export image. Please try again with PNG format or smaller dimensions.');
      } finally {
        setIsExporting(false);
      }
    }, 100);
  };

  const handleCloudSave = async () => {
    if (!originalImage || !canvasRef.current) return;
    
    if (!isPro) {
      setShowProModal(true);
      return;
    }

    setIsCloudSaving(true);
    setShareableUrl(null);
    
    try {
      const exportCanvas = document.createElement('canvas');
      const scaleFactor = exportWidth ? (exportWidth / originalDimensions.width) : 1;
      
      drawImageWithSettings(exportCanvas, {
        image: originalImage,
        settings,
        drawings,
        texts,
        stickers,
        exportScale: scaleFactor,
      });

      const dataUrl = exportCanvas.toDataURL('image/png', 0.9);
      
      const response = await fetch('/resizzy/backend/api/upload_imgbb.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataUrl })
      });

      const data = await response.json();
      if (data.success) {
        setShareableUrl(data.url);
      } else {
        throw new Error(data.error || 'Failed to upload');
      }
    } catch (err) {
      console.error('Cloud Save Error:', err);
      alert('Failed to upload image to cloud. Please try again.');
    } finally {
      setIsCloudSaving(false);
    }
  };

  if (!hasStarted) {
    return <LandingPage onStart={() => setHasStarted(true)} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black font-sans text-slate-100 antialiased p-4 gap-4">
      
      {/* Hidden File Input for image importing */}
      <input 
        ref={fileInputRef}
        type="file" 
        accept="image/*"
        onChange={handleFileUpload} 
        className="hidden" 
      />

      {/* LEFT NAVIGATION BAR */}
      <aside className="z-20 flex w-20 flex-col items-center justify-between rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-2xl py-6 shadow-2xl shadow-black/50">
        <div className="flex flex-col items-center gap-6">
          {/* Logo */}
          <div className="group relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-500 shadow-lg shadow-violet-500/30 transition-all hover:scale-110">
            <Sparkles className="h-5 w-5 text-white animate-pulse" />
            <span className="absolute left-16 top-2.5 z-50 scale-0 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-xl transition-all group-hover:scale-100 whitespace-nowrap">
              resizzy v1.0
            </span>
          </div>

          {/* Spacer Line */}
          <div className="h-px w-8 bg-slate-800" />

          {/* Tool Icons */}
          <nav className="flex flex-col gap-2.5">
            <button
              onClick={() => setActiveTab('ai')}
              className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all group relative ${
                activeTab === 'ai' ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30 scale-110 z-10' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sparkles className="h-5 w-5" />
              <span className="text-[9px] font-semibold opacity-0 group-hover:opacity-100 absolute -bottom-5 transition-opacity whitespace-nowrap">AI Magic</span>
            </button>

            <button
              onClick={() => setActiveTab('meta-ai')}
              className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all group relative ${
                activeTab === 'meta-ai' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-110 z-10' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Wand2 className="h-5 w-5" />
              <span className="text-[9px] font-semibold opacity-0 group-hover:opacity-100 absolute -bottom-5 transition-opacity whitespace-nowrap">Meta Gen</span>
            </button>

            <button
              onClick={() => setActiveTab('removebg')}
              className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all group relative ${
                activeTab === 'removebg' ? 'bg-[#ff3366] text-white shadow-lg shadow-[#ff3366]/30 scale-110 z-10' : 'text-slate-400 hover:text-[#ff3366] hover:bg-slate-800'
              }`}
            >
              <Sparkles className="h-5 w-5" />
              <span className="text-[9px] font-semibold opacity-0 group-hover:opacity-100 absolute -bottom-5 transition-opacity whitespace-nowrap text-[#ff3366]">Remove.bg</span>
            </button>

            <div className="w-8 h-[1px] bg-slate-800 my-1 rounded-full"></div>
            {[
              { id: 'templates', icon: LayoutTemplate, label: 'Templates' },
              { id: 'adjust', icon: Sliders, label: 'Adjust' },
              { id: 'filter', icon: Sparkles, label: 'Filters' },
              { id: 'crop', icon: Crop, label: 'Crop & Transform' },
              { id: 'draw', icon: Paintbrush, label: 'Draw / Paint' },
              { id: 'text', icon: Type, label: 'Add Text' },
              { id: 'stickers', icon: Smile, label: 'Stickers' },
              { id: 'frame', icon: Frame, label: 'Frames' },
              { id: 'history', icon: History, label: 'Timeline' },
            ].map((tool) => {
              const Icon = tool.icon;
              const isActive = activeTab === tool.id && !isCropMode;
              return (
                <button
                  key={tool.id}
                  onClick={() => {
                    setIsCropMode(tool.id === 'crop');
                    setActiveTab(tool.id);
                  }}
                  className={`group relative flex h-12 w-12 flex-col items-center justify-center rounded-xl transition-all duration-300 ease-out ${
                    isActive || (tool.id === 'crop' && isCropMode)
                      ? 'bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30 scale-105'
                      : 'text-slate-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="mt-1 text-[10px] font-medium leading-none tracking-tight">{tool.label.split(' ')[0]}</span>
                  
                  {/* Tooltip on Hover */}
                  <span className="absolute left-16 z-50 scale-0 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-xl transition-all group-hover:scale-100 whitespace-nowrap border border-slate-800">
                    {tool.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={triggerUpload}
            className="group relative flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800/80 text-slate-300 hover:bg-gradient-to-br hover:from-violet-600 hover:to-fuchsia-600 hover:text-white transition-all duration-300 shadow-md hover:shadow-violet-500/30 hover:scale-110"
          >
            <Upload className="h-5 w-5" />
            <span className="absolute left-16 z-50 scale-0 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-xl transition-all group-hover:scale-100 whitespace-nowrap border border-slate-800">
              Upload Photo
            </span>
          </button>
        </div>
      </aside>

      {/* LEFT SUB-BAR (ACTIVE TOOL SETTINGS PANEL) */}
      <aside className="z-10 flex w-80 flex-col rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-2xl py-5 shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between px-5 pb-4 border-b border-white/10">
          <h2 className="text-base font-semibold capitalize tracking-wide text-white flex items-center gap-2">
            {activeTab === 'templates' && <LayoutTemplate className="h-4.5 w-4.5 text-violet-500" />}
            {activeTab === 'adjust' && <Sliders className="h-4.5 w-4.5 text-violet-500" />}
            {activeTab === 'filter' && <Sparkles className="h-4.5 w-4.5 text-violet-500" />}
            {activeTab === 'crop' && <Crop className="h-4.5 w-4.5 text-violet-500" />}
            {activeTab === 'draw' && <Paintbrush className="h-4.5 w-4.5 text-violet-500" />}
            {activeTab === 'text' && <Type className="h-4.5 w-4.5 text-violet-500" />}
            {activeTab === 'stickers' && <Smile className="h-5 w-5" />}
            {activeTab === 'ai' && <Sparkles className="h-5 w-5" />}
            {activeTab === 'meta-ai' && <Wand2 className="h-5 w-5" />}
            {activeTab === 'history' && <History className="h-4.5 w-4.5 text-violet-500" />}
            {activeTab}
          </h2>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/50">
            {activeTab === 'history' ? `${history.length} states` : 'Settings'}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* TAB 0: TEMPLATES (CANVA-LIKE) */}
          {activeTab === 'templates' && (
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'yt', name: 'YT Thumbnail', ratio: '16:9', desc: '1280x720', color: 'from-red-500/20 to-red-600/20', border: 'border-red-500/30', w: 1280, h: 720 },
                { id: 'ig', name: 'IG Square', ratio: '1:1', desc: '1080x1080', color: 'from-pink-500/20 to-purple-600/20', border: 'border-pink-500/30', w: 1080, h: 1080 },
                { id: 'story', name: 'IG Story', ratio: '9:16', desc: '1080x1920', color: 'from-fuchsia-500/20 to-violet-600/20', border: 'border-violet-500/30', w: 1080, h: 1920 },
                { id: 'fb', name: 'FB Cover', ratio: '16:9', desc: '820x312', color: 'from-blue-500/20 to-blue-600/20', border: 'border-blue-500/30', w: 820, h: 312 },
              ].map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => {
                    if (!isPro && (tpl.id === 'story' || tpl.id === 'fb')) {
                      setShowProModal(true);
                      return;
                    }
                    // Apply crop preset automatically
                    setCropAspectRatio(tpl.ratio);
                    setIsCropMode(true);
                    setActiveTab('crop');
                  }}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border bg-gradient-to-br ${tpl.color} ${tpl.border} hover:scale-[1.02] transition-transform text-center relative`}
                >
                  {(!isPro && (tpl.id === 'story' || tpl.id === 'fb')) && (
                    <span className="absolute top-1.5 right-1.5 text-[8px] bg-amber-500/20 text-amber-400 px-1 py-0.5 rounded border border-amber-500/30 uppercase font-bold tracking-widest">PRO</span>
                  )}
                  <span className="text-[11px] font-bold text-white leading-tight mb-1">{tpl.name}</span>
                  <span className="text-[9px] text-slate-300 opacity-80">{tpl.desc}</span>
                </button>
              ))}
            </div>
          )}

          {/* TAB 1: ADJUSTMENT SLIDERS */}
          {activeTab === 'adjust' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400 mb-2">Double click any slider label to reset it to default.</p>
              
              {/* Brightness */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label 
                    onDoubleClick={() => updateSetting('brightness', 100)}
                    className="text-xs font-semibold text-slate-300 hover:text-violet-400 cursor-help"
                  >
                    Brightness
                  </label>
                  <span className="text-xs text-slate-400 font-mono">{settings.brightness}%</span>
                </div>
                <input 
                  type="range" min="0" max="200" value={settings.brightness}
                  onChange={(e) => updateSetting('brightness', parseInt(e.target.value))}
                  onMouseUp={() => handleSliderChangeEnd('Brightness Adjustment')}
                  onTouchEnd={() => handleSliderChangeEnd('Brightness Adjustment')}
                  className="w-full accent-violet-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Contrast */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label 
                    onDoubleClick={() => updateSetting('contrast', 100)}
                    className="text-xs font-semibold text-slate-300 hover:text-violet-400 cursor-help"
                  >
                    Contrast
                  </label>
                  <span className="text-xs text-slate-400 font-mono">{settings.contrast}%</span>
                </div>
                <input 
                  type="range" min="0" max="200" value={settings.contrast}
                  onChange={(e) => updateSetting('contrast', parseInt(e.target.value))}
                  onMouseUp={() => handleSliderChangeEnd('Contrast Adjustment')}
                  onTouchEnd={() => handleSliderChangeEnd('Contrast Adjustment')}
                  className="w-full accent-violet-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Saturation */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label 
                    onDoubleClick={() => updateSetting('saturation', 100)}
                    className="text-xs font-semibold text-slate-300 hover:text-violet-400 cursor-help"
                  >
                    Saturation
                  </label>
                  <span className="text-xs text-slate-400 font-mono">{settings.saturation}%</span>
                </div>
                <input 
                  type="range" min="0" max="200" value={settings.saturation}
                  onChange={(e) => updateSetting('saturation', parseInt(e.target.value))}
                  onMouseUp={() => handleSliderChangeEnd('Saturation Adjustment')}
                  onTouchEnd={() => handleSliderChangeEnd('Saturation Adjustment')}
                  className="w-full accent-violet-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Exposure */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label 
                    onDoubleClick={() => updateSetting('exposure', 0)}
                    className="text-xs font-semibold text-slate-300 hover:text-violet-400 cursor-help"
                  >
                    Exposure
                  </label>
                  <span className="text-xs text-slate-400 font-mono">{settings.exposure > 0 ? `+${settings.exposure}` : settings.exposure}</span>
                </div>
                <input 
                  type="range" min="-100" max="100" value={settings.exposure}
                  onChange={(e) => updateSetting('exposure', parseInt(e.target.value))}
                  onMouseUp={() => handleSliderChangeEnd('Exposure Adjustment')}
                  onTouchEnd={() => handleSliderChangeEnd('Exposure Adjustment')}
                  className="w-full accent-violet-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Temperature / Warmth */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label 
                    onDoubleClick={() => updateSetting('temperature', 0)}
                    className="text-xs font-semibold text-slate-300 hover:text-violet-400 cursor-help"
                  >
                    Warmth / Temperature
                  </label>
                  <span className="text-xs text-slate-400 font-mono">{settings.temperature > 0 ? `Warm +${settings.temperature}` : settings.temperature < 0 ? `Cool ${settings.temperature}` : 'Neutral'}</span>
                </div>
                <input 
                  type="range" min="-100" max="100" value={settings.temperature}
                  onChange={(e) => updateSetting('temperature', parseInt(e.target.value))}
                  onMouseUp={() => handleSliderChangeEnd('Temperature Adjustment')}
                  onTouchEnd={() => handleSliderChangeEnd('Temperature Adjustment')}
                  className="w-full accent-violet-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Vignette */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label 
                    onDoubleClick={() => updateSetting('vignette', 0)}
                    className="text-xs font-semibold text-slate-300 hover:text-violet-400 cursor-help"
                  >
                    Vignette Shading
                  </label>
                  <span className="text-xs text-slate-400 font-mono">{settings.vignette}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={settings.vignette}
                  onChange={(e) => updateSetting('vignette', parseInt(e.target.value))}
                  onMouseUp={() => handleSliderChangeEnd('Vignette Shading')}
                  onTouchEnd={() => handleSliderChangeEnd('Vignette Shading')}
                  className="w-full accent-violet-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Film Grain Noise */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label 
                    onDoubleClick={() => updateSetting('noise', 0)}
                    className="text-xs font-semibold text-slate-300 hover:text-violet-400 cursor-help"
                  >
                    Film Grain / Noise
                  </label>
                  <span className="text-xs text-slate-400 font-mono">{settings.noise}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={settings.noise}
                  onChange={(e) => updateSetting('noise', parseInt(e.target.value))}
                  onMouseUp={() => handleSliderChangeEnd('Film Grain Effect')}
                  onTouchEnd={() => handleSliderChangeEnd('Film Grain Effect')}
                  className="w-full accent-violet-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="h-px bg-slate-800 my-2" />

              {/* Hue Rotate */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label 
                    onDoubleClick={() => updateSetting('hueRotate', 0)}
                    className="text-xs font-semibold text-slate-300 hover:text-violet-400 cursor-help flex items-center gap-1"
                  >
                    Hue Shift
                    {!isPro && <span className="text-[8px] bg-amber-500/20 text-amber-400 px-1 py-0.5 rounded border border-amber-500/30 uppercase tracking-widest font-bold">PRO</span>}
                  </label>
                  <span className="text-xs text-slate-400 font-mono">{settings.hueRotate}°</span>
                </div>
                <input 
                  type="range" min="0" max="360" value={settings.hueRotate}
                  onChange={(e) => {
                    if (!isPro) { setShowProModal(true); return; }
                    updateSetting('hueRotate', parseInt(e.target.value));
                  }}
                  onMouseUp={() => handleSliderChangeEnd('Hue Shift')}
                  onTouchEnd={() => handleSliderChangeEnd('Hue Shift')}
                  className="w-full accent-violet-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Blur */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label 
                    onDoubleClick={() => updateSetting('blur', 0)}
                    className="text-xs font-semibold text-slate-300 hover:text-violet-400 cursor-help flex items-center gap-1"
                  >
                    Gaussian Blur
                    {!isPro && <span className="text-[8px] bg-amber-500/20 text-amber-400 px-1 py-0.5 rounded border border-amber-500/30 uppercase tracking-widest font-bold">PRO</span>}
                  </label>
                  <span className="text-xs text-slate-400 font-mono">{settings.blur}px</span>
                </div>
                <input 
                  type="range" min="0" max="20" step="0.5" value={settings.blur}
                  onChange={(e) => {
                    if (!isPro) { setShowProModal(true); return; }
                    updateSetting('blur', parseFloat(e.target.value));
                  }}
                  onMouseUp={() => handleSliderChangeEnd('Blur Adjustment')}
                  onTouchEnd={() => handleSliderChangeEnd('Blur Adjustment')}
                  className="w-full accent-violet-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Grayscale */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label 
                    onDoubleClick={() => updateSetting('grayscale', 0)}
                    className="text-xs font-semibold text-slate-300 hover:text-violet-400 cursor-help"
                  >
                    Grayscale Intensity
                  </label>
                  <span className="text-xs text-slate-400 font-mono">{settings.grayscale}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={settings.grayscale}
                  onChange={(e) => updateSetting('grayscale', parseInt(e.target.value))}
                  onMouseUp={() => handleSliderChangeEnd('Grayscale Adjustment')}
                  onTouchEnd={() => handleSliderChangeEnd('Grayscale Adjustment')}
                  className="w-full accent-violet-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Sepia */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label 
                    onDoubleClick={() => updateSetting('sepia', 0)}
                    className="text-xs font-semibold text-slate-300 hover:text-violet-400 cursor-help flex items-center gap-1"
                  >
                    Sepia Tone
                    {!isPro && <span className="text-[8px] bg-amber-500/20 text-amber-400 px-1 py-0.5 rounded border border-amber-500/30 uppercase tracking-widest font-bold">PRO</span>}
                  </label>
                  <span className="text-xs text-slate-400 font-mono">{settings.sepia}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={settings.sepia}
                  onChange={(e) => {
                    if (!isPro) { setShowProModal(true); return; }
                    updateSetting('sepia', parseInt(e.target.value));
                  }}
                  onMouseUp={() => handleSliderChangeEnd('Sepia Adjustment')}
                  onTouchEnd={() => handleSliderChangeEnd('Sepia Adjustment')}
                  className="w-full accent-violet-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Invert */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label 
                    onDoubleClick={() => updateSetting('invert', 0)}
                    className="text-xs font-semibold text-slate-300 hover:text-violet-400 cursor-help"
                  >
                    Invert Colors
                  </label>
                  <span className="text-xs text-slate-400 font-mono">{settings.invert}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={settings.invert}
                  onChange={(e) => updateSetting('invert', parseInt(e.target.value))}
                  onMouseUp={() => handleSliderChangeEnd('Invert Colors')}
                  onTouchEnd={() => handleSliderChangeEnd('Invert Colors')}
                  className="w-full accent-violet-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* TAB 2: PHOTOGRAPHIC PRESETS */}
          {activeTab === 'filter' && (
            <div className="grid grid-cols-1 gap-3">
              {FILTER_PRESETS.map((preset) => {
                const isActive = settings.filter === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleApplyPresetFilter(preset)}
                    className={`flex items-center justify-between p-3.5 rounded-xl text-left border transition-all ${
                      isActive 
                        ? 'bg-violet-600/10 border-violet-500 text-white ring-1 ring-violet-500/20' 
                        : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex flex-col gap-1 pr-3">
                      <span className="text-xs font-semibold flex items-center gap-2">
                        {preset.name}
                        {(preset as any).isPremium && <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-[8px] px-1.5 py-0.5 rounded-sm text-white tracking-wider">PRO</span>}
                      </span>
                      <span className="text-[10px] text-slate-400 leading-normal">{preset.desc}</span>
                    </div>
                    {isActive ? (
                      <div className="h-5 w-5 rounded-full bg-violet-600 flex items-center justify-center text-white shrink-0">
                        <Check className="h-3 w-3" />
                      </div>
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* TAB 2.5: AI MAGIC */}
          {activeTab === 'ai' && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-violet-900/40 to-fuchsia-900/40 rounded-xl border border-violet-500/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-full bg-violet-600/30 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-violet-300" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">AI Background Removal</h3>
                    <p className="text-[10px] text-violet-200/70">Remove backgrounds with high precision.</p>
                  </div>
                </div>
                <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                  Choose between fast on-device removal, or HD cloud-based removal (requires PRO).
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={async () => {
                      if (!originalImage || !imageSrc) return;
                      try {
                        setIsAiProcessing(true);
                        const newSrc = await removeImageBackground(imageSrc);
                        
                        const img = new Image();
                        img.onload = () => {
                          setOriginalImage(img);
                          setOriginalDimensions({ width: img.naturalWidth, height: img.naturalHeight });
                          setTimeout(() => {
                            commitState('AI Background Removal (Fast)', settings, drawings, texts, stickers, newSrc);
                          }, 0);
                          setIsAiProcessing(false);
                        };
                        img.src = newSrc;
                        setImageSrc(newSrc);
                        
                      } catch (err) {
                        console.error(err);
                        alert('Failed to process image. Please try again.');
                        setIsAiProcessing(false);
                      }
                    }}
                    disabled={isAiProcessing || isAiUpscaling}
                    className="w-full relative group overflow-hidden py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all flex flex-col items-center justify-center gap-1"
                  >
                    {isAiProcessing ? <RefreshCw className="h-4 w-4 text-violet-400 animate-spin" /> : <Sparkles className="h-4 w-4 text-violet-400" />}
                    <span className="text-[10px] font-bold text-white relative z-10">Fast (Free)</span>
                  </button>

                  <button
                    onClick={async () => {
                      if (!originalImage || !imageSrc) return;
                      try {
                        setIsAiProcessing(true);
                        const newSrc = await applyMetaSAM(imageSrc);
                        
                        const img = new Image();
                        img.onload = () => {
                          setOriginalImage(img);
                          setOriginalDimensions({ width: img.naturalWidth, height: img.naturalHeight });
                          setTimeout(() => {
                            commitState('Meta SAM Selection', settings, drawings, texts, stickers, newSrc);
                          }, 0);
                          setIsAiProcessing(false);
                        };
                        img.src = newSrc;
                        setImageSrc(newSrc);
                      } catch (err) {
                        console.error(err);
                        alert('Failed to process with Meta SAM.');
                        setIsAiProcessing(false);
                      }
                    }}
                    disabled={isAiProcessing || isAiUpscaling}
                    className="w-full relative group overflow-hidden py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border border-blue-400/30 rounded-xl transition-all flex flex-col items-center justify-center gap-1 shadow-lg shadow-blue-900/20"
                  >
                    {isAiProcessing ? <RefreshCw className="h-4 w-4 text-white animate-spin" /> : <Wand2 className="h-4 w-4 text-white" />}
                    <span className="text-[10px] font-bold text-white relative z-10">Meta SAM (Free)</span>
                  </button>

                  <button
                    onClick={async () => {
                      if (!isPro) {
                        setShowProModal(true);
                        return;
                      }
                      if (!originalImage || !canvasRef.current) return;
                      try {
                        setIsAiProcessing(true);
                        
                        // Get base64 representation of original
                        const tempCanvas = document.createElement('canvas');
                        tempCanvas.width = originalDimensions.width;
                        tempCanvas.height = originalDimensions.height;
                        const ctx = tempCanvas.getContext('2d');
                        if (ctx) ctx.drawImage(originalImage, 0, 0);
                        const base64 = tempCanvas.toDataURL('image/png');

                        const response = await fetch('/resizzy/backend/api/remove_bg.php', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ image: base64 })
                        });
                        
                        const data = await response.json();
                        if (data.success && data.image) {
                          const newSrc = data.image;
                          const img = new Image();
                          img.onload = () => {
                            setOriginalImage(img);
                            setOriginalDimensions({ width: img.naturalWidth, height: img.naturalHeight });
                            setTimeout(() => {
                              commitState('AI Background Removal (HD)', settings, drawings, texts, stickers, newSrc);
                            }, 0);
                            setIsAiProcessing(false);
                          };
                          img.src = newSrc;
                          setImageSrc(newSrc);
                        } else {
                          throw new Error(data.error || 'API failed');
                        }
                      } catch (err) {
                        console.error(err);
                        alert('HD Background removal failed.');
                        setIsAiProcessing(false);
                      }
                    }}
                    disabled={isAiProcessing || isAiUpscaling}
                    className="w-full relative group overflow-hidden py-2 bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 hover:from-violet-600/40 hover:to-fuchsia-600/40 border border-violet-500/50 rounded-xl transition-all flex flex-col items-center justify-center gap-1"
                  >
                    {isAiProcessing ? <RefreshCw className="h-4 w-4 text-fuchsia-400 animate-spin" /> : <Sparkles className="h-4 w-4 text-fuchsia-400" />}
                    <span className="text-[10px] font-bold text-white relative z-10">HD Quality</span>
                    {!isPro && <span className="absolute top-1 right-1 text-[8px] bg-amber-500/20 text-amber-400 px-1 py-0.5 rounded border border-amber-500/30">PRO</span>}
                  </button>
                </div>
              </div>

              {/* AI Upscale */}
              <div className="p-4 bg-gradient-to-br from-blue-900/40 to-cyan-900/40 rounded-xl border border-blue-500/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-full bg-blue-600/30 flex items-center justify-center">
                    <Maximize2 className="h-4 w-4 text-blue-300" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">AI Image Upscaler</h3>
                    <p className="text-[10px] text-blue-200/70">Powered by AI</p>
                  </div>
                </div>
                <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                  Enhance and upscale low-resolution images into high-definition masterpieces without losing detail.
                </p>
                <button
                  onClick={async () => {
                    if (!isPro) {
                      setShowProModal(true);
                      return;
                    }
                    if (!originalImage || !canvasRef.current) return;
                    try {
                      setIsAiUpscaling(true);
                      
                      const tempCanvas = document.createElement('canvas');
                      tempCanvas.width = originalDimensions.width;
                      tempCanvas.height = originalDimensions.height;
                      const ctx = tempCanvas.getContext('2d');
                      if (ctx) ctx.drawImage(originalImage, 0, 0);
                      const base64 = tempCanvas.toDataURL('image/jpeg');

                      const response = await fetch('/resizzy/backend/api/ai_upscale.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ image: base64 })
                      });
                      
                      const data = await response.json();
                      if (data.success && data.url) {
                        const newSrc = data.url;
                        const img = new Image();
                        img.crossOrigin = 'anonymous'; // Important for CORS
                        img.onload = () => {
                          setOriginalImage(img);
                          setOriginalDimensions({ width: img.naturalWidth, height: img.naturalHeight });
                          setTimeout(() => {
                            commitState('AI Upscale', settings, drawings, texts, stickers, newSrc);
                          }, 0);
                          setIsAiUpscaling(false);
                        };
                        img.src = newSrc;
                        setImageSrc(newSrc);
                      } else {
                        throw new Error(data.error || 'API failed');
                      }
                    } catch (err) {
                      console.error(err);
                      alert('AI Upscale failed.');
                      setIsAiUpscaling(false);
                    }
                  }}
                  disabled={isAiProcessing || isAiUpscaling}
                  className="w-full relative group overflow-hidden py-3 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/50 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {isAiUpscaling ? (
                    <>
                      <RefreshCw className="h-4 w-4 text-blue-400 animate-spin" />
                      <span className="text-xs font-bold text-white relative z-10">Upscaling Image...</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="h-4 w-4 text-blue-400" />
                      <span className="text-xs font-bold text-white relative z-10">Enhance Quality (HD)</span>
                      {!isPro && <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/30 uppercase tracking-widest relative z-10">PRO</span>}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2.6: META AI GEN */}
          {activeTab === 'meta-ai' && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-blue-900/40 to-indigo-900/40 rounded-xl border border-blue-500/30">
                <h3 className="text-sm font-bold text-white mb-2">Text-to-Image Generation (Free)</h3>
                <textarea
                  value={metaPrompt}
                  onChange={(e) => setMetaPrompt(e.target.value)}
                  placeholder="Describe the image you want to generate..."
                  className="w-full h-24 bg-slate-950 border border-blue-500/30 rounded-xl p-3 text-xs text-slate-200 resize-none"
                />
                <button
                  onClick={async () => {
                    if (!metaPrompt.trim()) return;
                    setIsMetaGenerating(true);
                    try {
                      const newSrc = await generateMetaImage(metaPrompt);
                      const img = new Image();
                      img.onload = () => {
                        setOriginalImage(img);
                        setOriginalDimensions({ width: img.naturalWidth, height: img.naturalHeight });
                        setImageSrc(newSrc);
                        commitState('Meta AI Gen', settings, [], [], []);
                        setIsMetaGenerating(false);
                      };
                      img.src = newSrc;
                    } catch (err) {
                      console.error(err);
                      alert('Generation failed.');
                      setIsMetaGenerating(false);
                    }
                  }}
                  disabled={isMetaGenerating}
                  className="w-full mt-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
                >
                  {isMetaGenerating ? <RefreshCw className="animate-spin h-4 w-4" /> : 'Generate'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2.7: REMOVE.BG API */}
          {activeTab === 'removebg' && (
            <div className="space-y-4">
              <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20 mb-2">
                <p className="text-xs text-green-300 leading-relaxed font-medium">
                  <strong>Remove.bg API:</strong> Remove image backgrounds automatically using the Remove.bg API. You must configure your free API Key in <code>backend/api/remove_bg.php</code> for this to work.
                </p>
              </div>

              <div className="p-4 bg-gradient-to-br from-[#001e36]/80 to-slate-900 rounded-xl border border-[#31a8ff]/30 shadow-[0_4px_15px_rgba(49,168,255,0.1)]">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-[#001e36] flex items-center justify-center border border-[#31a8ff]">
                    <Sparkles className="text-[#31a8ff] h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Remove Background</h3>
                </div>
                
                <button
                  onClick={async () => {
                    if (!originalImage || !imageSrc) return;
                    if (!isPro) {
                      setShowProModal(true);
                      return;
                    }
                    setIsAdobeProcessing(true);
                    try {
                      const response = await fetch('/resizzy/backend/api/remove_bg.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ image: imageSrc })
                      });
                      const data = await response.json();
                      if (data.success) {
                        setImageSrc(data.url);
                        commitState('Remove Background', settings, [], [], []);
                      } else {
                        alert('Error: ' + data.error);
                      }
                    } catch (err) {
                      alert('Remove.bg API connection failed');
                    }
                    setIsAdobeProcessing(false);
                  }}
                  disabled={isAdobeProcessing}
                  className="w-full relative group overflow-hidden py-2 bg-slate-800 hover:bg-slate-700 border border-[#31a8ff]/30 rounded-xl transition-all flex items-center justify-center gap-2 mb-2"
                >
                  <div className="flex items-center gap-2">
                    {isAdobeProcessing ? <RefreshCw className="h-4 w-4 text-[#31a8ff] animate-spin" /> : <Sparkles className="h-4 w-4 text-[#31a8ff]" />}
                    <span className="text-xs font-bold text-white">Remove Background</span>
                  </div>
                  {!isPro && <span className="absolute right-3 text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/30 uppercase tracking-widest font-bold">PRO</span>}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: CROP & TRANSFORM */}
          {activeTab === 'crop' && (
            <div className="space-y-4">
              <div className="p-3 bg-violet-500/10 rounded-xl border border-violet-500/20 mb-2">
                <p className="text-xs text-violet-300 leading-relaxed font-medium">
                  {isCropMode 
                    ? '⚡ Crop mode is active! Adjust the handles on top of the image and click Apply below.' 
                    : 'Click Enable Crop Mode below to start cropping.'}
                </p>
              </div>

              {/* Crop Mode Switch Button */}
              {!isCropMode ? (
                <button
                  onClick={() => setIsCropMode(true)}
                  className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white font-semibold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Crop className="h-4 w-4" />
                  Enable Crop Mode
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleApplyCrop}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <Check className="h-4 w-4" />
                    Apply Crop
                  </button>
                  <button
                    onClick={() => setIsCropMode(false)}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                </div>
              )}

              {isCropMode && (
                <div className="space-y-3.5 pt-2">
                  <label className="text-xs font-semibold text-slate-300">Preset Crop Aspect Ratio</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'free', label: 'Freeform' },
                      { id: '1:1', label: '1:1 Square' },
                      { id: '4:3', label: '4:3 standard' },
                      { id: '16:9', label: '16:9 widescreen' },
                      { id: '9:16', label: '9:16 portrait' },
                      { id: '2:3', label: '2:3 classic' }
                    ].map((aspect) => (
                      <button
                        key={aspect.id}
                        onClick={() => setCropAspectRatio(aspect.id)}
                        className={`py-1.5 px-2 text-[10px] font-semibold rounded-lg border transition-all ${
                          cropAspectRatio === aspect.id
                            ? 'bg-violet-600/20 border-violet-500 text-violet-400'
                            : 'bg-slate-800/50 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-300'
                        }`}
                      >
                        {aspect.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="h-px bg-slate-800 my-1" />

              {/* FLIP & ROTATION CONTROLS (Always available) */}
              <div className="space-y-4 pt-1">
                <label className="text-xs font-semibold text-slate-300">Quick Transform</label>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      updateSetting('flipH', !settings.flipH);
                      commitState('Flip Horizontal', { ...settings, flipH: !settings.flipH });
                    }}
                    className={`py-2 px-3 text-xs font-medium rounded-xl border flex items-center justify-center gap-2 transition-all ${
                      settings.flipH
                        ? 'bg-violet-600/20 border-violet-500 text-violet-400'
                        : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <RefreshCw className="h-3.5 w-3.5 scale-x-[-1]" />
                    Flip Horizontal
                  </button>
                  <button
                    onClick={() => {
                      updateSetting('flipV', !settings.flipV);
                      commitState('Flip Vertical', { ...settings, flipV: !settings.flipV });
                    }}
                    className={`py-2 px-3 text-xs font-medium rounded-xl border flex items-center justify-center gap-2 transition-all ${
                      settings.flipV
                        ? 'bg-violet-600/20 border-violet-500 text-violet-400'
                        : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <RefreshCw className="h-3.5 w-3.5 rotate-90" />
                    Flip Vertical
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      const nextRot = (settings.rotation - 90 + 360) % 360;
                      updateSetting('rotation', nextRot);
                      commitState('Rotate CCW', { ...settings, rotation: nextRot });
                    }}
                    className="py-2 px-3 text-xs bg-slate-800/40 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 flex items-center justify-center gap-2 transition-all"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Rotate 90° CCW
                  </button>
                  <button
                    onClick={() => {
                      const nextRot = (settings.rotation + 90) % 360;
                      updateSetting('rotation', nextRot);
                      commitState('Rotate CW', { ...settings, rotation: nextRot });
                    }}
                    className="py-2 px-3 text-xs bg-slate-800/40 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 flex items-center justify-center gap-2 transition-all"
                  >
                    <RotateCcw className="h-3.5 w-3.5 scale-x-[-1]" />
                    Rotate 90° CW
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DRAW & PAINT */}
          {activeTab === 'draw' && (
            <div className="space-y-4">
              <div className="p-3 bg-violet-500/10 rounded-xl border border-violet-500/20 mb-2">
                <p className="text-xs text-violet-300 leading-relaxed font-medium">
                  🎨 Click and drag directly on the image to sketch, draw, or erase. Every brush stroke creates an undoable layer!
                </p>
              </div>

              {/* Mode Select */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setBrushMode('brush')}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-2 transition-all ${
                    brushMode === 'brush'
                      ? 'bg-violet-600/20 border-violet-500 text-violet-400'
                      : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-300'
                  }`}
                >
                  <Paintbrush className="h-4 w-4" />
                  Paint Brush
                </button>
                <button
                  onClick={() => setBrushMode('eraser')}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-2 transition-all ${
                    brushMode === 'eraser'
                      ? 'bg-violet-600/20 border-violet-500 text-violet-400'
                      : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-300'
                  }`}
                >
                  <Trash2 className="h-4 w-4" />
                  Eraser Mode
                </button>
              </div>

              {/* Brush Settings */}
              {brushMode === 'brush' && (
                <div className="space-y-4 pt-1">
                  {/* Colors Grid */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Palette className="h-3.5 w-3.5 text-violet-500" />
                      Brush Color
                    </label>
                    <div className="grid grid-cols-6 gap-2">
                      {BRUSH_COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() => setBrushColor(c)}
                          style={{ backgroundColor: c }}
                          className={`h-7 w-7 rounded-full border transition-transform ${
                            brushColor === c 
                              ? 'border-white scale-110 shadow-md ring-2 ring-violet-500/50' 
                              : 'border-slate-800 hover:scale-105'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Custom Hex Color */}
                  <div className="flex items-center gap-2.5">
                    <input 
                      type="color" 
                      value={brushColor} 
                      onChange={(e) => setBrushColor(e.target.value)}
                      className="h-8 w-8 rounded-lg cursor-pointer bg-slate-800 border border-slate-700" 
                    />
                    <div className="flex-1">
                      <input 
                        type="text" 
                        value={brushColor} 
                        onChange={(e) => setBrushColor(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-300"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Size Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-300">Brush Size</label>
                  <span className="text-xs text-slate-400 font-mono">{brushWidth}px</span>
                </div>
                <input 
                  type="range" min="1" max="80" value={brushWidth}
                  onChange={(e) => setBrushWidth(parseInt(e.target.value))}
                  className="w-full accent-violet-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Opacity Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-300">Brush Opacity</label>
                  <span className="text-xs text-slate-400 font-mono">{Math.round(brushOpacity * 100)}%</span>
                </div>
                <input 
                  type="range" min="0.1" max="1.0" step="0.05" value={brushOpacity}
                  onChange={(e) => setBrushOpacity(parseFloat(e.target.value))}
                  className="w-full accent-violet-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Reset/Clear Drawings */}
              {drawings.length > 0 && (
                <button
                  onClick={() => {
                    setDrawings([]);
                    commitState('Clear All Drawings', settings, []);
                  }}
                  className="w-full mt-2 py-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/20 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear Drawings ({drawings.length})
                </button>
              )}
            </div>
          )}

          {/* TAB 5: ADD TEXT */}
          {activeTab === 'text' && (
            <div className="space-y-4">
              <button
                onClick={handleAddText}
                className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white font-semibold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Type className="h-4 w-4" />
                Add Text Layer
              </button>

              {/* Text Layers Management */}
              {texts.length > 0 ? (
                <div className="space-y-4 pt-2">
                  <div className="h-px bg-slate-800" />
                  <label className="text-xs font-semibold text-slate-300 block">Manage Active Texts</label>
                  
                  {texts.map((layer) => (
                    <div key={layer.id} className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl space-y-3.5">
                      {/* Text Input */}
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={layer.text}
                          onChange={(e) => handleUpdateTextProperty(layer.id, 'text', e.target.value)}
                          onBlur={handleTextPropertyBlur}
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
                        />
                        <button
                          onClick={() => handleDeleteText(layer.id)}
                          className="h-7 w-7 rounded-lg bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 flex items-center justify-center border border-rose-500/20 transition-all shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Font Family Dropdown */}
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={layer.fontFamily}
                          onChange={(e) => {
                            handleUpdateTextProperty(layer.id, 'fontFamily', e.target.value);
                            commitState('Change Font');
                          }}
                          className="bg-slate-900 border border-slate-700 rounded-lg text-[10px] px-2 py-1 text-slate-300"
                        >
                          {FONTS.map((f) => (
                            <option key={f.id} value={f.id}>{f.name}</option>
                          ))}
                        </select>

                        {/* Font size */}
                        <div className="flex items-center gap-1">
                          <input 
                            type="number"
                            min="10"
                            max="120"
                            value={layer.fontSize}
                            onChange={(e) => handleUpdateTextProperty(layer.id, 'fontSize', parseInt(e.target.value))}
                            onBlur={handleTextPropertyBlur}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg text-[10px] px-2 py-1 text-slate-300 text-center font-mono"
                          />
                          <span className="text-[10px] text-slate-400 pr-1">px</span>
                        </div>
                      </div>

                      {/* Formatting: Bold, Italic, Color */}
                      <div className="flex items-center justify-between gap-2.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              const newVal = layer.fontWeight === 'bold' ? 'normal' : 'bold';
                              handleUpdateTextProperty(layer.id, 'fontWeight', newVal);
                              commitState('Toggle Bold');
                            }}
                            className={`p-1.5 rounded-lg border transition-all ${
                              layer.fontWeight === 'bold' 
                                ? 'bg-violet-600/20 border-violet-500 text-violet-400' 
                                : 'bg-slate-900 border-slate-700 text-slate-400'
                            }`}
                          >
                            <Bold className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              const newVal = layer.fontStyle === 'italic' ? 'normal' : 'italic';
                              handleUpdateTextProperty(layer.id, 'fontStyle', newVal);
                              commitState('Toggle Italic');
                            }}
                            className={`p-1.5 rounded-lg border transition-all ${
                              layer.fontStyle === 'italic' 
                                ? 'bg-violet-600/20 border-violet-500 text-violet-400' 
                                : 'bg-slate-900 border-slate-700 text-slate-400'
                            }`}
                          >
                            <Italic className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Color Picker swatch */}
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={layer.color}
                            onChange={(e) => handleUpdateTextProperty(layer.id, 'color', e.target.value)}
                            onBlur={handleTextPropertyBlur}
                            className="h-6 w-6 rounded-md cursor-pointer bg-slate-900 border border-slate-700 shrink-0"
                          />
                          <input
                            type="text"
                            value={layer.color}
                            onChange={(e) => handleUpdateTextProperty(layer.id, 'color', e.target.value)}
                            onBlur={handleTextPropertyBlur}
                            className="w-16 text-center bg-slate-900 border border-slate-700 rounded-md text-[10px] py-1 font-mono text-slate-300"
                          />
                        </div>
                      </div>

                      {/* Text Shadow */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] text-slate-400">
                          <span>Text Shadow blur</span>
                          <span>{layer.shadowBlur}px</span>
                        </div>
                        <input
                          type="range" min="0" max="15" value={layer.shadowBlur}
                          onChange={(e) => handleUpdateTextProperty(layer.id, 'shadowBlur', parseInt(e.target.value))}
                          onMouseUp={handleTextPropertyBlur}
                          onTouchEnd={handleTextPropertyBlur}
                          className="w-full accent-violet-500 h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs">
                  No text layers added. Drag-and-drop texts directly in viewport.
                </div>
              )}
            </div>
          )}

          {/* TAB 6: STICKERS */}
          {activeTab === 'stickers' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400 mb-1">Click a sticker or emoji to stamp it onto your artwork:</p>
              
              {/* Emojis grid */}
              <div className="grid grid-cols-5 gap-2.5 p-2 bg-slate-800/30 border border-slate-800/80 rounded-xl max-h-56 overflow-y-auto">
                {EMOJI_STICKERS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleAddSticker(emoji)}
                    className="h-10 text-xl flex items-center justify-center rounded-lg hover:bg-slate-800 active:scale-95 transition-all"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Stickers Layers management */}
              {stickers.length > 0 ? (
                <div className="space-y-4">
                  <div className="h-px bg-slate-800" />
                  <label className="text-xs font-semibold text-slate-300 block">Manage Active Stickers</label>

                  {stickers.map((st) => (
                    <div key={st.id} className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl space-y-3.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{st.emoji}</span>
                          <span className="text-xs font-semibold text-slate-300">Sticker Layer</span>
                        </div>
                        <button
                          onClick={() => handleDeleteSticker(st.id)}
                          className="h-7 w-7 rounded-lg bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 flex items-center justify-center border border-rose-500/20 transition-all shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Size Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] text-slate-400">
                          <span>Size</span>
                          <span>{st.size}px</span>
                        </div>
                        <input
                          type="range" min="16" max="180" value={st.size}
                          onChange={(e) => handleUpdateStickerProperty(st.id, 'size', parseInt(e.target.value))}
                          onMouseUp={() => commitState('Resize Sticker')}
                          onTouchEnd={() => commitState('Resize Sticker')}
                          className="w-full accent-violet-500 h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      {/* Rotation Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] text-slate-400">
                          <span>Rotation</span>
                          <span>{st.rotation}°</span>
                        </div>
                        <input
                          type="range" min="0" max="360" value={st.rotation}
                          onChange={(e) => handleUpdateStickerProperty(st.id, 'rotation', parseInt(e.target.value))}
                          onMouseUp={() => commitState('Rotate Sticker')}
                          onTouchEnd={() => commitState('Rotate Sticker')}
                          className="w-full accent-violet-500 h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-slate-500 text-xs">
                  No active stickers. Stamp emoji items above!
                </div>
              )}
            </div>
          )}

          {/* TAB 7: BORDERS & FRAMES */}
          {activeTab === 'border' && (
            <div className="space-y-4.5">
              {/* Style selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Border / Frame Style</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'none', label: 'No Border' },
                    { id: 'solid', label: 'Solid Minimal' },
                    { id: 'dashed', label: 'Dashed Lines' },
                    { id: 'double', label: 'Elegant Double' },
                    { id: 'polaroid', label: 'Polaroid board' },
                    { id: 'neon', label: 'Modern Glow' },
                    { id: 'vintage', label: 'Vintage Gold' }
                  ].map((style) => (
                    <button
                      key={style.id}
                      onClick={() => {
                        updateSetting('borderStyle', style.id);
                        commitState(`Border Style: ${style.label}`, { ...settings, borderStyle: style.id as any });
                      }}
                      className={`py-2 px-2.5 text-[11px] font-semibold rounded-lg border transition-all ${
                        settings.borderStyle === style.id
                          ? 'bg-violet-600/20 border-violet-500 text-violet-400'
                          : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-300'
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              {settings.borderStyle !== 'none' && (
                <div className="space-y-4 pt-1">
                  {/* Width slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-slate-300">Border Thickness</label>
                      <span className="text-xs text-slate-400 font-mono">{settings.borderWidth}px</span>
                    </div>
                    <input 
                      type="range" min="1" max="60" value={settings.borderWidth}
                      onChange={(e) => updateSetting('borderWidth', parseInt(e.target.value))}
                      onMouseUp={() => handleSliderChangeEnd('Border Width Change')}
                      onTouchEnd={() => handleSliderChangeEnd('Border Width Change')}
                      className="w-full accent-violet-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Border color - if not polaroid */}
                  {settings.borderStyle !== 'polaroid' && settings.borderStyle !== 'vintage' && (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-300">Border Color</label>
                      <div className="flex items-center gap-2.5">
                        <input 
                          type="color" 
                          value={settings.borderColor} 
                          onChange={(e) => updateSetting('borderColor', e.target.value)}
                          onBlur={() => commitState('Border Color Change')}
                          className="h-8 w-8 rounded-lg cursor-pointer bg-slate-800 border border-slate-700" 
                        />
                        <div className="flex-1">
                          <input 
                            type="text" 
                            value={settings.borderColor} 
                            onChange={(e) => updateSetting('borderColor', e.target.value)}
                            onBlur={() => commitState('Border Color Change')}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-300"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 8: TIMELINE HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400 mb-2 leading-relaxed">
                Roll back your project in time. Clicking any state restores all parameters to that exact second.
              </p>
              
              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {history.map((step, index) => {
                  const isActive = index === historyIndex;
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        setHistoryIndex(index);
                        applyHistoryState(step);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                        isActive 
                          ? 'bg-violet-600/10 border-violet-500/80 text-violet-300 ring-1 ring-violet-500/20' 
                          : 'bg-slate-800/40 border-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-300'
                      }`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className={`text-xs font-semibold ${isActive ? 'text-white' : ''}`}>
                          {step.actionName}
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono">
                          {step.timestamp}
                        </span>
                      </div>
                      
                      {isActive && (
                        <span className="text-[10px] font-bold text-violet-400 bg-violet-600/10 px-2 py-0.5 rounded-md border border-violet-500/20">
                          Active
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Ad Placement in Editor Sidebar */}
          <div className="mt-8 mb-4 opacity-70 hover:opacity-100 transition-opacity">
            <AdBanner adSlot="editor-sidebar-bottom" format="rectangle" className="w-full h-[250px]" />
          </div>

        </div>

        {/* BOTTOM METADATA/INFO */}
        <div className="mt-auto border-t border-slate-800 px-5 pt-4 flex flex-col gap-1 text-[11px] text-slate-400">
          <div className="flex justify-between items-center">
            <span>Input Dimensions:</span>
            <span className="font-mono font-medium text-slate-300">
              {originalDimensions.width} × {originalDimensions.height} px
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>Canvas View Size:</span>
            <span className="font-mono font-medium text-slate-300">
              {Math.round(displayDimensions.width)} × {Math.round(displayDimensions.height)} px
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>Timeline Index:</span>
            <span className="font-mono font-medium text-slate-300">
              {historyIndex + 1} / {history.length}
            </span>
          </div>
        </div>
      </aside>

      {/* CENTER WORKSPACE SECTION */}
      <main className="flex-1 flex flex-col bg-slate-950 relative overflow-hidden">
        
        {/* WORKSPACE HEADER BAR */}
        <header className="flex h-14 items-center justify-between border-b border-slate-800/80 bg-slate-900/60 px-6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="resizzy" className="w-7 h-7 rounded-lg shadow-lg shadow-violet-500/30 object-cover" />
            <h1 className="text-base font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300 lowercase">
              resizzy
            </h1>
            <span className="hidden md:inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <p className="hidden md:block text-xs text-slate-400 font-medium">Creative Suite</p>
            
            <div className="ml-4 pl-4 border-l border-slate-700/50 flex items-center gap-2">
              {user ? (
                <button 
                  onClick={() => setShowDashboard(true)}
                  className="text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1.5"
                >
                  <User className="h-3.5 w-3.5" />
                  {user.username}'s Gallery
                </button>
              ) : (
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  Sign In / Register
                </button>
              )}
            </div>
          </div>

          {/* Quick Actions (Undo, Redo, Reset, Zoom Fit, Export) */}
          <div className="flex items-center gap-2.5">
            {/* History Steps Undo/Redo */}
            <div className="flex items-center rounded-xl bg-slate-800 p-0.5 border border-slate-700/40">
              <button
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 active:scale-95 disabled:opacity-40 disabled:hover:bg-transparent disabled:pointer-events-none transition-all"
              >
                <Undo2 className="h-4 w-4" />
              </button>
              <button
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 active:scale-95 disabled:opacity-40 disabled:hover:bg-transparent disabled:pointer-events-none transition-all"
              >
                <Redo2 className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={handleResetAll}
              className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 rounded-xl transition-all border border-slate-700/40 flex items-center gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset All
            </button>

            {/* Scale View fit */}
            <button
              onClick={() => autoFitZoom(displayDimensions.width || originalDimensions.width, displayDimensions.height || originalDimensions.height)}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all border border-slate-700/40"
              title="Fit to Screen"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>

            {/* Upgrade to Pro Button */}
            {!isPro && (
              <div className="flex items-center gap-3 mr-2">
                <div className="flex flex-col items-end justify-center hidden md:flex">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Free Exports</span>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-16 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${projectsCount >= 5 ? 'bg-red-500' : 'bg-amber-500'}`} 
                        style={{ width: `${Math.min(100, (projectsCount / 5) * 100)}%` }}
                      />
                    </div>
                    <span className={`text-xs font-bold ${projectsCount >= 5 ? 'text-red-400' : 'text-amber-400'}`}>
                      {projectsCount}/5
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowProModal(true)}
                  className="py-1.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Upgrade to PRO
                </button>
              </div>
            )}

            {/* Connect Wallet */}
            <ConnectWallet 
              walletAddress={walletAddress}
              onConnect={(address, token, _proStatus) => {
                setWalletAddress(address);
                setSessionToken(token);
              }}
              onDisconnect={() => {
                setWalletAddress(null);
                setSessionToken(null);
              }}
            />

            {/* Save & Share (Cloudinary) */}
            <button
              onClick={handleCloudSave}
              disabled={isCloudSaving}
              className="py-1.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer border border-slate-700"
            >
              {isCloudSaving ? <RefreshCw className="h-3.5 w-3.5 animate-spin text-fuchsia-400" /> : <Upload className="h-3.5 w-3.5 text-fuchsia-400" />}
              Save to Cloud
              {!isPro && <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1 py-0.5 rounded border border-amber-500/30 ml-1">PRO</span>}
            </button>

            {/* Export / Download button */}
            <button
              onClick={handleTriggerExport}
              className="py-1.5 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 active:from-violet-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-violet-500/10 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              Export Photo
            </button>
          </div>
        </header>

        {/* WORKSPACE CENTRAL WORK AREA */}
        <div 
          ref={viewportRef}
          className="flex-1 overflow-auto bg-checkerboard flex p-8 select-none"
        >
          {imageSrc ? (
            /* Canvas Zoom/Scale Wrapper Frame */
            <div 
              className="relative m-auto transition-transform duration-100 ease-out"
              style={{ 
                transform: `scale(${zoom / 100})`, 
                transformOrigin: 'center center',
              }}
            >
              {/* Main editing Canvas */}
              <canvas
                ref={canvasRef}
                className="shadow-2xl select-none relative z-10"
                style={{ 
                  maxWidth: 'none', 
                  maxHeight: 'none',
                  // Map pointer cursor based on active tool
                  cursor: activeTab === 'draw' ? 'crosshair' : activeLayer ? 'grabbing' : 'default',
                }}
              />

              {/* DRAWING CAPTURE OVERLAY LAYER (Renders ONLY in draw mode) */}
              {activeTab === 'draw' && !isCropMode && (
                <div
                  onMouseDown={handleDrawStart}
                  onMouseMove={handleDrawMove}
                  onMouseUp={handleDrawEnd}
                  onTouchStart={handleDrawStart}
                  onTouchMove={handleDrawMove}
                  onTouchEnd={handleDrawEnd}
                  className="absolute inset-0 z-30 cursor-crosshair"
                  style={{
                    // Align perfectly inside image bounds
                    width: displayDimensions.rotatedWidth || displayDimensions.width,
                    height: displayDimensions.rotatedHeight || displayDimensions.height,
                    left: settings.borderStyle === 'polaroid' ? Math.round((displayDimensions.rotatedWidth || displayDimensions.width) * 0.08) : 0,
                    top: settings.borderStyle === 'polaroid' ? Math.round((displayDimensions.rotatedWidth || displayDimensions.width) * 0.08) : 0,
                  }}
                />
              )}

              {/* INTERACTIVE CROP HANDLES OVERLAY LAYER */}
              {isCropMode && (
                <CropOverlay
                  imageWidth={displayDimensions.rotatedWidth || displayDimensions.width}
                  imageHeight={displayDimensions.rotatedHeight || displayDimensions.height}
                  aspectRatio={cropAspectRatio}
                  cropBox={cropBox}
                  onChange={setCropBox}
                />
              )}

              {/* INTERACTIVE DRAGGABLE TEXT LAYERS OVERLAY */}
              {!isCropMode && texts.map((layer) => {
                const isSelected = activeLayer?.type === 'text' && activeLayer.id === layer.id;
                
                // Coordinates offset based on polaroid framing style
                const borderOffset = settings.borderStyle === 'polaroid' 
                  ? Math.round((displayDimensions.rotatedWidth || displayDimensions.width) * 0.08)
                  : 0;
                
                return (
                  <div
                    key={layer.id}
                    onMouseDown={(e) => handleLayerDragStart(e, 'text', layer.id)}
                    onTouchStart={(e) => handleLayerDragStart(e, 'text', layer.id)}
                    onDoubleClick={() => {
                      const newTextVal = prompt('Edit your text:', layer.text);
                      if (newTextVal !== null) {
                        handleUpdateTextProperty(layer.id, 'text', newTextVal);
                        commitState('Edit Text Value');
                      }
                    }}
                    style={{
                      left: `calc(${layer.x}% + ${borderOffset}px)`,
                      top: `calc(${layer.y}% + ${borderOffset}px)`,
                      color: layer.color,
                      fontFamily: `${layer.fontFamily}, sans-serif`,
                      fontSize: `${layer.fontSize * ((displayDimensions.rotatedWidth || displayDimensions.width) / 800)}px`,
                      fontWeight: layer.fontWeight,
                      fontStyle: layer.fontStyle,
                      textShadow: layer.shadowBlur > 0 ? `0 0 ${layer.shadowBlur * ((displayDimensions.rotatedWidth || displayDimensions.width) / 800)}px ${layer.shadowColor}` : 'none',
                    }}
                    className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 select-none text-center cursor-grab active:cursor-grabbing leading-none select-none px-2.5 py-1 whitespace-nowrap rounded-md hover:bg-white/10 hover:outline-dashed hover:outline-1 hover:outline-violet-500/60 ${
                      isSelected ? 'outline-2 outline-violet-500 bg-violet-500/10' : ''
                    }`}
                  >
                    {layer.text}
                  </div>
                );
              })}

              {/* INTERACTIVE DRAGGABLE STICKER LAYERS OVERLAY */}
              {!isCropMode && stickers.map((sticker) => {
                const isSelected = activeLayer?.type === 'sticker' && activeLayer.id === sticker.id;
                
                // Coordinates offset based on polaroid framing style
                const borderOffset = settings.borderStyle === 'polaroid' 
                  ? Math.round((displayDimensions.rotatedWidth || displayDimensions.width) * 0.08)
                  : 0;

                return (
                  <div
                    key={sticker.id}
                    onMouseDown={(e) => handleLayerDragStart(e, 'sticker', sticker.id)}
                    onTouchStart={(e) => handleLayerDragStart(e, 'sticker', sticker.id)}
                    style={{
                      left: `calc(${sticker.x}% + ${borderOffset}px)`,
                      top: `calc(${sticker.y}% + ${borderOffset}px)`,
                      fontSize: `${sticker.size * ((displayDimensions.rotatedWidth || displayDimensions.width) / 800)}px`,
                      transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg)`,
                    }}
                    className={`absolute z-20 select-none cursor-grab active:cursor-grabbing text-center leading-none p-1.5 hover:outline-dashed hover:outline-1 hover:outline-violet-500/60 rounded-md ${
                      isSelected ? 'outline-2 outline-violet-500 bg-violet-500/10' : ''
                    }`}
                  >
                    {sticker.emoji}
                  </div>
                );
              })}
            </div>
          ) : (
            /* EMPTY WORKSPACE: FILE DROP ZONE & TEMPLATES */
            <div className="max-w-2xl text-center space-y-8 py-8 px-6">
              <div 
                onClick={triggerUpload}
                className="border border-dashed border-white/20 hover:border-fuchsia-500 bg-slate-900/40 hover:bg-white/5 backdrop-blur-md p-12 rounded-3xl cursor-pointer transition-all duration-300 flex flex-col items-center gap-4 group shadow-xl hover:shadow-2xl hover:shadow-fuchsia-500/10"
              >
                <div className="h-16 w-16 bg-slate-800/50 group-hover:bg-gradient-to-br group-hover:from-violet-600/20 group-hover:to-fuchsia-600/20 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-fuchsia-500/30 text-slate-400 group-hover:text-fuchsia-400 transition-all duration-300 group-hover:scale-110">
                  <FileImage className="h-8 w-8" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-white tracking-wide">Import a Photo to Edit</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto leading-normal">
                    Drag and drop your image file here, or click to browse files on your device. Supports PNG, JPG, JPEG, and WebP.
                  </p>
                </div>
              </div>

              {/* Presets Grid */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 justify-center">
                  <ImageIcon className="h-3.5 w-3.5" />
                  Or Start with a Premium Stock Template
                </h4>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                  {SAMPLE_IMAGES.map((sample) => (
                    <button
                      key={sample.title}
                      onClick={() => loadImage(sample.url, `Loaded Preset: ${sample.title}`)}
                      className="group flex flex-col rounded-2xl overflow-hidden bg-slate-900/60 backdrop-blur-md border border-white/10 text-left hover:border-fuchsia-500/50 hover:shadow-lg hover:shadow-fuchsia-500/10 transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="h-24 w-full relative overflow-hidden bg-slate-800">
                        <img 
                          src={sample.url} 
                          alt={sample.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-3">
                        <span className="text-xs font-bold text-white group-hover:text-violet-400 transition-colors block truncate">{sample.title}</span>
                        <span className="text-[10px] text-slate-500 truncate block mt-0.5">{sample.description}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* WORKSPACE STATUS BAR & FOOTER */}
        <footer className="m-4 h-12 rounded-2xl border border-white/10 bg-slate-900/60 px-6 flex items-center justify-between text-xs text-slate-400 backdrop-blur-2xl shadow-xl shrink-0">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-violet-500" />
              resizzy Workspace
            </span>
            {imageSrc && (
              <>
                <span className="h-3 w-px bg-slate-800" />
                <span className="font-mono">
                  Aspect: {(originalDimensions.width / originalDimensions.height).toFixed(2)}
                </span>
                <span className="h-3 w-px bg-slate-800" />
                <span>Format: Web-RGB</span>
              </>
            )}
          </div>

          {/* ZOOM SLIDER CONTROL */}
          {imageSrc && (
            <div className="flex items-center gap-3 w-64 justify-end">
              <button 
                onClick={() => setZoom(Math.max(10, zoom - 10))}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <div className="flex-1 flex items-center">
                <input 
                  type="range" min="10" max="250" value={zoom}
                  onChange={(e) => setZoom(parseInt(e.target.value))}
                  className="w-full accent-violet-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <span className="font-mono w-12 text-right text-slate-300 font-semibold">{zoom}%</span>
              <button 
                onClick={() => setZoom(Math.min(250, zoom + 10))}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </footer>
      </main>

      {/* MODAL: HIGH-RESOLUTION EXPORT CONTROLLER */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-slate-900/80 border border-white/10 p-6 shadow-2xl shadow-black/50 backdrop-blur-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Download className="h-4.5 w-4.5 text-violet-500" />
                Export Settings
              </h3>
              <button 
                onClick={() => setShowExportModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* File format */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Export Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['png', 'jpeg', 'webp'] as const).map((format) => {
                    const isProFormat = format === 'jpeg' || format === 'webp';
                    return (
                      <button
                        key={format}
                        onClick={() => {
                          if (isProFormat && !isPro) {
                            setShowExportModal(false);
                            setShowProModal(true);
                            return;
                          }
                          setExportFormat(format);
                        }}
                        className={`relative py-2 px-3 text-xs font-bold rounded-xl border uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${
                          exportFormat === format
                            ? 'bg-violet-600/25 border-violet-500 text-violet-400'
                            : 'bg-slate-800/50 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-300'
                        }`}
                      >
                        {format}
                        {isProFormat && !isPro && (
                          <span className="absolute -top-1.5 -right-1.5 text-[8px] bg-amber-500 text-black px-1 py-0.5 rounded uppercase font-bold tracking-widest shadow-md">PRO</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quality slider - if JPEG/WebP */}
              {exportFormat !== 'png' && (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-400">Compression Quality</label>
                    <span className="text-xs text-slate-300 font-mono font-semibold">{exportQuality}%</span>
                  </div>
                  <input
                    type="range" min="20" max="100" value={exportQuality}
                    onChange={(e) => setExportQuality(parseInt(e.target.value))}
                    className="w-full accent-violet-500 h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              )}

              {/* Dimensions controls */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-400">Export Resolution (Pixels)</label>
                  {!isPro && Math.max(exportWidth, exportHeight) > 1920 && (
                    <span className="text-[9px] bg-amber-500 text-black px-1.5 py-0.5 rounded uppercase font-bold tracking-widest shadow-md">PRO REQUIRED</span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1 relative">
                    <span className="text-[10px] text-slate-500 block font-medium uppercase">Width</span>
                    <input
                      type="number"
                      value={exportWidth}
                      onChange={(e) => handleExportWidthChange(parseInt(e.target.value) || 0)}
                      className={`w-full bg-slate-850 border rounded-xl px-3 py-2 text-xs text-slate-300 font-mono transition-colors ${
                        exportWidth > 1920 && !isPro ? 'border-amber-500/50 focus:border-amber-500' : 'border-slate-800 focus:border-violet-500'
                      }`}
                    />
                  </div>
                  <div className="space-y-1 relative">
                    <span className="text-[10px] text-slate-500 block font-medium uppercase">Height</span>
                    <input
                      type="number"
                      value={exportHeight}
                      onChange={(e) => handleExportHeightChange(parseInt(e.target.value) || 0)}
                      className={`w-full bg-slate-850 border rounded-xl px-3 py-2 text-xs text-slate-300 font-mono transition-colors ${
                        exportHeight > 1920 && !isPro ? 'border-amber-500/50 focus:border-amber-500' : 'border-slate-800 focus:border-violet-500'
                      }`}
                    />
                  </div>
                </div>
                <span className={`text-[10px] block leading-normal mt-1 ${Math.max(exportWidth, exportHeight) > 1920 && !isPro ? 'text-amber-400/80' : 'text-slate-500'}`}>
                  {Math.max(exportWidth, exportHeight) > 1920 && !isPro 
                    ? 'Exporting above 1920px requires a PRO account.' 
                    : 'Aspect ratio is automatically locked to preserve image proportions.'}
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setShowExportModal(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-xs rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveExport}
                disabled={isExporting || exportWidth <= 0}
                className="flex-1 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 active:from-violet-700 active:to-fuchsia-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-fuchsia-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:pointer-events-none hover:scale-[1.02]"
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Rendering...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Save & Download
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLOUDINARY SHARE MODAL */}
      {shareableUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-[420px] max-w-[90vw] bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <button
              onClick={() => setShareableUrl(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                <Check className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Upload Successful!</h3>
                <p className="text-xs text-slate-400">Your image is now saved to the cloud.</p>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center gap-3 mb-6">
              <input 
                type="text" 
                readOnly 
                value={shareableUrl} 
                className="bg-transparent border-none outline-none text-xs text-slate-300 w-full"
              />
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(shareableUrl);
                  alert('Link copied to clipboard!');
                }}
                className="shrink-0 bg-violet-600 hover:bg-violet-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
              >
                Copy
              </button>
            </div>

            <button
              onClick={() => window.open(shareableUrl, '_blank')}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors border border-slate-700"
            >
              Open in New Tab
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {showProModal && <ProModal isOpen={true} onClose={() => setShowProModal(false)} onUnlockPro={() => {}} walletAddress={walletAddress} sessionToken={sessionToken} />}
      
      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)} 
        />
      )}

      {showDashboard && (
        <DashboardModal 
          onClose={() => setShowDashboard(false)} 
          onLoadImage={(url) => loadImage(url, 'Load from Cloud')}
        />
      )}
    </div>
  );
}

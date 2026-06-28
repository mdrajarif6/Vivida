export interface ImageSettings {
  // Basic Adjustments
  brightness: number; // 0 - 200 (100 is default)
  contrast: number; // 0 - 200 (100 is default)
  saturation: number; // 0 - 200 (100 is default)
  grayscale: number; // 0 - 100
  sepia: number; // 0 - 100
  hueRotate: number; // 0 - 360
  blur: number; // 0 - 20
  invert: number; // 0 - 100
  exposure: number; // -100 to 100
  temperature: number; // -100 to 100 (warm/cool tint)
  vignette: number; // 0 - 100
  noise: number; // 0 - 100
  
  // Transform
  rotation: number; // 0, 90, 180, 270 (arbitrary rotation is supported too, but increments are cleanest)
  flipH: boolean;
  flipV: boolean;
  
  // Preset Filter
  filter: string; // 'none', 'vintage', 'cyberpunk', 'dramatic', 'lomo', 'mono', 'warm', 'cool'
  
  // Border Settings
  borderStyle: 'none' | 'solid' | 'dashed' | 'double' | 'polaroid' | 'neon' | 'vintage';
  borderColor: string;
  borderWidth: number; // 0 - 50 px
}

export type TabType = 'adjust' | 'filter' | 'text' | 'draw' | 'stickers' | 'ai' | 'meta-ai' | null;

export interface Point {
  x: number;
  y: number;
}

export interface DrawingPath {
  id: string;
  points: Point[];
  color: string;
  width: number;
  opacity: number;
  mode: 'brush' | 'eraser';
}

export interface TextLayer {
  id: string;
  text: string;
  x: number; // Percentage coordinate (0 to 100) relative to image width
  y: number; // Percentage coordinate (0 to 100) relative to image height
  color: string;
  fontSize: number; // size in px relative to base image
  fontFamily: string;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  shadowColor: string;
  shadowBlur: number;
}

export interface StickerLayer {
  id: string;
  emoji: string;
  x: number; // Percentage coordinate (0 to 100) relative to image width
  y: number; // Percentage coordinate (0 to 100) relative to image height
  size: number; // size in px relative to base image
  rotation: number; // 0 to 360 degrees
}

export interface HistoryState {
  imageSrc: string; // The base image data URL (supports undoing crops!)
  originalDimensions: { width: number; height: number };
  settings: ImageSettings;
  drawings: DrawingPath[];
  texts: TextLayer[];
  stickers: StickerLayer[];
  timestamp: string;
  actionName: string;
}

export interface CropBox {
  x: number; // Percentage (0 to 100)
  y: number; // Percentage (0 to 100)
  width: number; // Percentage (0 to 100)
  height: number; // Percentage (0 to 100)
}

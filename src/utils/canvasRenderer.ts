import { ImageSettings, DrawingPath, TextLayer, StickerLayer } from '../types';

// Pre-generate a noise pattern canvas to keep canvas rendering extremely fast
let noisePatternCanvas: HTMLCanvasElement | null = null;
function getNoisePattern(): CanvasPattern | null {
  if (typeof window === 'undefined') return null;
  
  if (!noisePatternCanvas) {
    noisePatternCanvas = document.createElement('canvas');
    noisePatternCanvas.width = 128;
    noisePatternCanvas.height = 128;
    const ctx = noisePatternCanvas.getContext('2d');
    if (ctx) {
      const imgData = ctx.createImageData(128, 128);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const val = Math.floor(Math.random() * 255);
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
        data[i + 3] = 25; // low base opacity, we can adjust when drawing
      }
      ctx.putImageData(imgData, 0, 0);
    }
  }
  
  const ctx = document.createElement('canvas').getContext('2d');
  if (ctx && noisePatternCanvas) {
    return ctx.createPattern(noisePatternCanvas, 'repeat');
  }
  return null;
}

interface RenderOptions {
  image: HTMLImageElement;
  settings: ImageSettings;
  drawings: DrawingPath[];
  texts: TextLayer[];
  stickers: StickerLayer[];
  exportScale?: number; // scale factor for exporting high resolution
}

export function computeRenderSize(
  imageWidth: number,
  imageHeight: number,
  settings: ImageSettings
): { width: number; height: number; rotatedWidth: number; rotatedHeight: number } {
  const isRotated = settings.rotation % 180 !== 0;
  const rotatedWidth = isRotated ? imageHeight : imageWidth;
  const rotatedHeight = isRotated ? imageWidth : imageHeight;

  let finalWidth = rotatedWidth;
  let finalHeight = rotatedHeight;

  // If Polaroid frame, add extra height for bottom margin and side margins
  if (settings.borderStyle === 'polaroid') {
    const margin = Math.round(rotatedWidth * 0.08); // 8% margins
    finalWidth = rotatedWidth + margin * 2;
    finalHeight = rotatedHeight + margin * 2 + Math.round(rotatedWidth * 0.16); // 16% bottom margin
  }

  return {
    width: finalWidth,
    height: finalHeight,
    rotatedWidth,
    rotatedHeight,
  };
}

export function drawImageWithSettings(
  canvas: HTMLCanvasElement,
  options: RenderOptions
): void {
  const { image, settings, drawings, texts, stickers, exportScale = 1 } = options;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const originalW = image.naturalWidth || image.width;
  const originalH = image.naturalHeight || image.height;

  // 1. Calculate Canvas dimensions based on settings
  const { width: finalW, height: finalH, rotatedWidth: rotW, rotatedHeight: rotH } = 
    computeRenderSize(originalW, originalH, settings);

  // Apply export scale (for high-quality downloads)
  canvas.width = finalW * exportScale;
  canvas.height = finalH * exportScale;

  // Scale context for all subsequent operations to handle export resolution
  ctx.save();
  ctx.scale(exportScale, exportScale);

  // Clear background
  ctx.fillStyle = '#0f172a'; // Default editor background color for workspace, or transparent
  ctx.clearRect(0, 0, finalW, finalH);

  // If Polaroid, draw white background
  let imageOffsetX = 0;
  let imageOffsetY = 0;
  if (settings.borderStyle === 'polaroid') {
    ctx.fillStyle = '#f8fafc'; // polaroid off-white sheet
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 10;
    ctx.fillRect(0, 0, finalW, finalH);
    ctx.shadowBlur = 0; // reset shadow

    imageOffsetX = Math.round(rotW * 0.08);
    imageOffsetY = Math.round(rotW * 0.08);
  }

  // 2. Setup context translation and rotation for Drawing the image
  ctx.save();
  // Center on the *image frame*
  ctx.translate(imageOffsetX + rotW / 2, imageOffsetY + rotH / 2);

  // Apply Rotation
  if (settings.rotation !== 0) {
    ctx.rotate((settings.rotation * Math.PI) / 180);
  }

  // Apply Flips
  const scaleX = settings.flipH ? -1 : 1;
  const scaleY = settings.flipV ? -1 : 1;
  ctx.scale(scaleX, scaleY);

  // 3. Setup CSS Filters
  // We can apply standard filters to the drawImage operation
  const filterString = `
    brightness(${settings.brightness}%)
    contrast(${settings.contrast}%)
    saturate(${settings.saturation}%)
    grayscale(${settings.grayscale}%)
    sepia(${settings.sepia}%)
    hue-rotate(${settings.hueRotate}deg)
    blur(${settings.blur}px)
    invert(${settings.invert}%)
  `.trim().replace(/\s+/g, ' ');

  ctx.filter = filterString;

  // Draw base image centered
  // Since we translated to the center, draw from (-origW/2, -origH/2)
  ctx.drawImage(image, -originalW / 2, -originalH / 2, originalW, originalH);
  ctx.filter = 'none'; // reset filter
  ctx.restore(); // restore from image translation & scaling

  // Let's draw standard adjustment overlays over the image area
  // Image area bounds are:
  const imgX = imageOffsetX;
  const imgY = imageOffsetY;
  const imgW = rotW;
  const imgH = rotH;

  // Create clipping region of the image so exposure/warmth overlays don't bleed outside of image (e.g. into polaroid board)
  ctx.save();
  ctx.beginPath();
  ctx.rect(imgX, imgY, imgW, imgH);
  ctx.clip();

  // A. Simulate Exposure
  if (settings.exposure !== 0) {
    if (settings.exposure > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${(settings.exposure / 100) * 0.35})`;
    } else {
      ctx.fillStyle = `rgba(0, 0, 0, ${(-settings.exposure / 100) * 0.55})`;
    }
    ctx.fillRect(imgX, imgY, imgW, imgH);
  }

  // B. Simulate Temperature (Warm/Cool tint)
  if (settings.temperature !== 0) {
    ctx.save();
    if (settings.temperature > 0) {
      // Warm Amber
      ctx.fillStyle = `rgba(251, 146, 60, ${(settings.temperature / 100) * 0.22})`;
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillRect(imgX, imgY, imgW, imgH);
      ctx.fillStyle = `rgba(253, 186, 116, ${(settings.temperature / 100) * 0.1})`;
      ctx.globalCompositeOperation = 'screen';
      ctx.fillRect(imgX, imgY, imgW, imgH);
    } else {
      // Cool Ocean Blue
      ctx.fillStyle = `rgba(59, 130, 246, ${(-settings.temperature / 100) * 0.22})`;
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillRect(imgX, imgY, imgW, imgH);
      ctx.fillStyle = `rgba(147, 197, 253, ${(-settings.temperature / 100) * 0.1})`;
      ctx.globalCompositeOperation = 'screen';
      ctx.fillRect(imgX, imgY, imgW, imgH);
    }
    ctx.restore();
  }

  // C. Apply Vignette
  if (settings.vignette > 0) {
    ctx.save();
    const centerX = imgX + imgW / 2;
    const centerY = imgY + imgH / 2;
    const outerRadius = Math.max(imgW, imgH) * 0.75;
    const innerRadius = Math.min(imgW, imgH) * 0.15;
    
    const vignetteGrad = ctx.createRadialGradient(
      centerX, centerY, innerRadius,
      centerX, centerY, outerRadius
    );
    vignetteGrad.addColorStop(0, 'rgba(0,0,0,0)');
    vignetteGrad.addColorStop(1, `rgba(0,0,0,${(settings.vignette / 100) * 0.9})`);
    
    ctx.fillStyle = vignetteGrad;
    ctx.fillRect(imgX, imgY, imgW, imgH);
    ctx.restore();
  }

  // D. Film Grain Noise
  if (settings.noise > 0) {
    ctx.save();
    const pattern = getNoisePattern();
    if (pattern) {
      ctx.fillStyle = pattern;
      ctx.globalAlpha = settings.noise / 100 * 0.35;
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillRect(imgX, imgY, imgW, imgH);
    }
    ctx.restore();
  }

  // E. Draw Vector/Manual Drawings
  // Coordinates are saved in percentage of the image bounding box!
  if (drawings.length > 0) {
    ctx.save();
    // Translate drawings relative to the image frame
    ctx.translate(imgX, imgY);

    drawings.forEach((draw) => {
      if (draw.points.length < 1) return;
      
      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      if (draw.mode === 'eraser') {
        // Eraser mode on canvas: if we clipped, we can simulate eraser by drawing clear-rects or source-out,
        // but simple destination-out blend mode works! Note that destination-out will clear everything beneath.
        // If we want destination-out only on this image layer, the clipping context handles it safely!
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = draw.color;
      }

      // scale brush width by canvas size
      const brushWidth = draw.width * (imgW / 800);
      ctx.lineWidth = brushWidth;
      ctx.globalAlpha = draw.opacity;

      const p0 = draw.points[0];
      const startX = (p0.x / 100) * imgW;
      const startY = (p0.y / 100) * imgH;
      ctx.moveTo(startX, startY);

      if (draw.points.length === 1) {
        ctx.lineTo(startX + 0.1, startY);
      } else {
        for (let i = 1; i < draw.points.length; i++) {
          const p = draw.points[i];
          const px = (p.x / 100) * imgW;
          const py = (p.y / 100) * imgH;
          ctx.lineTo(px, py);
        }
      }
      ctx.stroke();
    });
    ctx.restore();
  }

  // F. Draw Stickers
  if (stickers.length > 0) {
    ctx.save();
    ctx.translate(imgX, imgY);
    stickers.forEach((sticker) => {
      const stickerX = (sticker.x / 100) * imgW;
      const stickerY = (sticker.y / 100) * imgH;
      const stickerSize = sticker.size * (imgW / 800);

      ctx.save();
      ctx.translate(stickerX, stickerY);
      ctx.rotate((sticker.rotation * Math.PI) / 180);
      ctx.font = `${stickerSize}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(sticker.emoji, 0, 0);
      ctx.restore();
    });
    ctx.restore();
  }

  // G. Draw Texts
  if (texts.length > 0) {
    ctx.save();
    ctx.translate(imgX, imgY);
    texts.forEach((layer) => {
      const tx = (layer.x / 100) * imgW;
      const ty = (layer.y / 100) * imgH;
      const scaleFontSize = layer.fontSize * (imgW / 800);

      ctx.save();
      ctx.translate(tx, ty);

      ctx.font = `${layer.fontStyle} ${layer.fontWeight} ${scaleFontSize}px ${layer.fontFamily}, sans-serif`;
      ctx.fillStyle = layer.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (layer.shadowBlur > 0) {
        ctx.shadowColor = layer.shadowColor;
        ctx.shadowBlur = layer.shadowBlur * (imgW / 800);
      }

      ctx.fillText(layer.text, 0, 0);
      ctx.restore();
    });
    ctx.restore();
  }

  // End image clipping
  ctx.restore();

  // 4. Draw Borders (drawn on top of everything inside the image box)
  if (settings.borderStyle !== 'none' && settings.borderWidth > 0) {
    ctx.save();
    const borderWidth = settings.borderWidth * (imgW / 800);
    ctx.lineWidth = borderWidth;
    ctx.strokeStyle = settings.borderColor;

    // Draw solid/dashed/double/neon border
    const halfBorder = borderWidth / 2;
    const borderX = imgX + halfBorder;
    const borderY = imgY + halfBorder;
    const borderWidthSize = imgW - borderWidth;
    const borderHeightSize = imgH - borderWidth;

    if (settings.borderStyle === 'dashed') {
      ctx.setLineDash([borderWidth * 2, borderWidth * 1.5]);
    } else if (settings.borderStyle === 'double') {
      // Draw standard inner border and outer border
      ctx.lineWidth = borderWidth / 3;
      ctx.strokeRect(imgX + ctx.lineWidth/2, imgY + ctx.lineWidth/2, imgW - ctx.lineWidth, imgH - ctx.lineWidth);
      ctx.strokeRect(imgX + borderWidth - ctx.lineWidth/2, imgY + borderWidth - ctx.lineWidth/2, imgW - borderWidth * 2 + ctx.lineWidth, imgH - borderWidth * 2 + ctx.lineWidth);
    } else if (settings.borderStyle === 'neon') {
      ctx.strokeStyle = settings.borderColor;
      ctx.shadowColor = settings.borderColor;
      ctx.shadowBlur = borderWidth;
      ctx.strokeRect(borderX, borderY, borderWidthSize, borderHeightSize);
      ctx.shadowBlur = borderWidth / 2;
      ctx.strokeRect(borderX, borderY, borderWidthSize, borderHeightSize);
      ctx.shadowBlur = 0; // reset
    } else if (settings.borderStyle === 'vintage') {
      // Golden ornate style frame
      ctx.strokeStyle = '#d97706'; // gold
      ctx.strokeRect(borderX, borderY, borderWidthSize, borderHeightSize);
      ctx.strokeStyle = '#f59e0b'; // light gold
      ctx.lineWidth = borderWidth / 4;
      ctx.strokeRect(imgX + borderWidth/4, imgY + borderWidth/4, imgW - borderWidth/2, imgH - borderWidth/2);
    }

    if (settings.borderStyle !== 'double' && settings.borderStyle !== 'vintage') {
      ctx.strokeRect(borderX, borderY, borderWidthSize, borderHeightSize);
    }

    ctx.restore();
  }

  // Restore the scale context
  ctx.restore();
}

import React, { useState, useEffect, useRef } from 'react';
import { CropBox } from '../types';

interface CropOverlayProps {
  imageWidth: number; // width on screen (px)
  imageHeight: number; // height on screen (px)
  aspectRatio: string; // 'free' | '1:1' | '4:3' | '16:9' | '9:16' | '2:3'
  cropBox: CropBox;
  onChange: (box: CropBox) => void;
}

type DragHandle = 'nw' | 'ne' | 'sw' | 'se' | 'move' | null;

export default function CropOverlay({
  imageWidth,
  imageHeight,
  aspectRatio,
  cropBox,
  onChange,
}: CropOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeHandle, setActiveHandle] = useState<DragHandle>(null);
  const dragStartRef = useRef<{ x: number; y: number; box: CropBox }>({
    x: 0,
    y: 0,
    box: { x: 0, y: 0, width: 100, height: 100 },
  });

  // Calculate pixel values for rendering
  const pxBox = {
    x: (cropBox.x / 100) * imageWidth,
    y: (cropBox.y / 100) * imageHeight,
    width: (cropBox.width / 100) * imageWidth,
    height: (cropBox.height / 100) * imageHeight,
  };

  // Adjust crop box when aspect ratio changes
  useEffect(() => {
    if (aspectRatio === 'free') return;

    let targetRatio = 1;
    if (aspectRatio === '1:1') targetRatio = 1;
    else if (aspectRatio === '4:3') targetRatio = 4 / 3;
    else if (aspectRatio === '16:9') targetRatio = 16 / 9;
    else if (aspectRatio === '9:16') targetRatio = 9 / 16;
    else if (aspectRatio === '2:3') targetRatio = 2 / 3;

    // Current size of image
    const imgRatio = imageWidth / imageHeight;

    let newWidth = 80; // 80% default
    let newHeight = (newWidth / targetRatio) * imgRatio;

    if (newHeight > 80) {
      newHeight = 80;
      newWidth = (newHeight * targetRatio) / imgRatio;
    }

    const newX = (100 - newWidth) / 2;
    const newY = (100 - newHeight) / 2;

    onChange({
      x: Math.max(0, newX),
      y: Math.max(0, newY),
      width: Math.min(100, newWidth),
      height: Math.min(100, newHeight),
    });
  }, [aspectRatio, imageWidth, imageHeight]);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent, handle: DragHandle) => {
    e.preventDefault();
    e.stopPropagation();

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    setActiveHandle(handle);
    dragStartRef.current = {
      x: clientX,
      y: clientY,
      box: { ...cropBox },
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!activeHandle) return;
      
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - dragStartRef.current.x;
      const deltaY = clientY - dragStartRef.current.y;

      // Convert delta px to percentage
      const pctDeltaX = (deltaX / imageWidth) * 100;
      const pctDeltaY = (deltaY / imageHeight) * 100;

      const originalBox = dragStartRef.current.box;
      const nextBox = { ...originalBox };

      // Helper to compute aspect-ratio-locked height
      const applyRatioLock = (box: CropBox, direction: 'w' | 'h') => {
        if (aspectRatio === 'free') return;

        let ratio = 1;
        if (aspectRatio === '1:1') ratio = 1;
        else if (aspectRatio === '4:3') ratio = 4 / 3;
        else if (aspectRatio === '16:9') ratio = 16 / 9;
        else if (aspectRatio === '9:16') ratio = 9 / 16;
        else if (aspectRatio === '2:3') ratio = 2 / 3;

        const imgRatio = imageWidth / imageHeight;
        // box.height = (box.width / ratio) * imgRatio
        if (direction === 'w') {
          box.height = (box.width / ratio) * imgRatio;
        } else {
          box.width = box.height * ratio / imgRatio;
        }
      };

      if (activeHandle === 'move') {
        nextBox.x = originalBox.x + pctDeltaX;
        nextBox.y = originalBox.y + pctDeltaY;

        // Keep bounds
        if (nextBox.x < 0) nextBox.x = 0;
        if (nextBox.y < 0) nextBox.y = 0;
        if (nextBox.x + nextBox.width > 100) nextBox.x = 100 - nextBox.width;
        if (nextBox.y + nextBox.height > 100) nextBox.y = 100 - nextBox.height;
      } else {
        // Handle resizing
        if (activeHandle.includes('w')) {
          // Dragging left edges
          const proposedWidth = originalBox.width - pctDeltaX;
          const proposedX = originalBox.x + pctDeltaX;
          
          if (proposedWidth > 10 && proposedX >= 0) {
            nextBox.width = proposedWidth;
            nextBox.x = proposedX;
          }
        } else if (activeHandle.includes('e')) {
          // Dragging right edges
          const proposedWidth = originalBox.width + pctDeltaX;
          if (proposedWidth > 10 && originalBox.x + proposedWidth <= 100) {
            nextBox.width = proposedWidth;
          }
        }

        if (activeHandle.includes('n')) {
          // Dragging top edges
          const proposedHeight = originalBox.height - pctDeltaY;
          const proposedY = originalBox.y + pctDeltaY;
          
          if (proposedHeight > 10 && proposedY >= 0) {
            nextBox.height = proposedHeight;
            nextBox.y = proposedY;
          }
        } else if (activeHandle.includes('s')) {
          // Dragging bottom edges
          const proposedHeight = originalBox.height + pctDeltaY;
          if (proposedHeight > 10 && originalBox.y + proposedHeight <= 100) {
            nextBox.height = proposedHeight;
          }
        }

        // Apply aspect ratio lock if active
        if (aspectRatio !== 'free') {
          // Determine major drag direction
          const isHorizontalResize = activeHandle === 'ne' || activeHandle === 'se' || activeHandle === 'nw' || activeHandle === 'sw';
          
          if (isHorizontalResize) {
            // Apply ratio scaling based on width change
            applyRatioLock(nextBox, 'w');
            
            // Re-adjust anchor points if we scaled northward or westward
            if (activeHandle.includes('n')) {
              nextBox.y = originalBox.y + (originalBox.height - nextBox.height);
            }
            if (activeHandle.includes('w')) {
              nextBox.x = originalBox.x + (originalBox.width - nextBox.width);
            }
          }

          // Bound check after lock
          if (nextBox.x < 0 || nextBox.y < 0 || nextBox.x + nextBox.width > 100 || nextBox.y + nextBox.height > 100) {
            // Revert to original if aspect lock goes out of bounds
            return;
          }
        }
      }

      // Final bound checking to make sure crop is valid
      if (nextBox.width >= 5 && nextBox.height >= 5 && nextBox.x >= 0 && nextBox.y >= 0 && nextBox.x + nextBox.width <= 100 && nextBox.y + nextBox.height <= 100) {
        onChange(nextBox);
      }
    };

    const handleMouseUp = () => {
      setActiveHandle(null);
    };

    if (activeHandle) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [activeHandle, cropBox, imageWidth, imageHeight, aspectRatio, onChange]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-20 overflow-hidden cursor-crosshair select-none"
      style={{ width: imageWidth, height: imageHeight }}
    >
      {/* Translucent overlay around the cropping zone */}
      <div
        className="absolute bg-black/60 transition-colors pointer-events-none"
        style={{ left: 0, top: 0, width: imageWidth, height: pxBox.y }}
      />
      <div
        className="absolute bg-black/60 transition-colors pointer-events-none"
        style={{ left: 0, top: pxBox.y, width: pxBox.x, height: pxBox.height }}
      />
      <div
        className="absolute bg-black/60 transition-colors pointer-events-none"
        style={{
          left: pxBox.x + pxBox.width,
          top: pxBox.y,
          width: imageWidth - (pxBox.x + pxBox.width),
          height: pxBox.height,
        }}
      />
      <div
        className="absolute bg-black/60 transition-colors pointer-events-none"
        style={{
          left: 0,
          top: pxBox.y + pxBox.height,
          width: imageWidth,
          height: imageHeight - (pxBox.y + pxBox.height),
        }}
      />

      {/* The Crop Area Box */}
      <div
        className="absolute border border-white/80 shadow-[0_0_0_1px_rgba(0,0,0,0.5)] cursor-move"
        style={{
          left: pxBox.x,
          top: pxBox.y,
          width: pxBox.width,
          height: pxBox.height,
        }}
        onMouseDown={(e) => handleMouseDown(e, 'move')}
        onTouchStart={(e) => handleMouseDown(e, 'move')}
      >
        {/* Rule of Thirds Gridlines */}
        <div className="absolute inset-0 flex pointer-events-none">
          <div className="w-1/3 border-r border-dashed border-white/30 h-full" />
          <div className="w-1/3 border-r border-dashed border-white/30 h-full" />
        </div>
        <div className="absolute inset-0 flex flex-col pointer-events-none">
          <div className="h-1/3 border-b border-dashed border-white/30 w-full" />
          <div className="h-1/3 border-b border-dashed border-white/30 w-full" />
        </div>

        {/* Drag corners */}
        {/* Top-Left */}
        <div
          className="absolute -left-1.5 -top-1.5 w-4 h-4 border-l-4 border-t-4 border-white cursor-nwse-resize z-30"
          onMouseDown={(e) => handleMouseDown(e, 'nw')}
          onTouchStart={(e) => handleMouseDown(e, 'nw')}
        />
        {/* Top-Right */}
        <div
          className="absolute -right-1.5 -top-1.5 w-4 h-4 border-r-4 border-t-4 border-white cursor-nesw-resize z-30"
          onMouseDown={(e) => handleMouseDown(e, 'ne')}
          onTouchStart={(e) => handleMouseDown(e, 'ne')}
        />
        {/* Bottom-Left */}
        <div
          className="absolute -left-1.5 -bottom-1.5 w-4 h-4 border-l-4 border-b-4 border-white cursor-nesw-resize z-30"
          onMouseDown={(e) => handleMouseDown(e, 'sw')}
          onTouchStart={(e) => handleMouseDown(e, 'sw')}
        />
        {/* Bottom-Right */}
        <div
          className="absolute -right-1.5 -bottom-1.5 w-4 h-4 border-r-4 border-b-4 border-white cursor-nwse-resize z-30"
          onMouseDown={(e) => handleMouseDown(e, 'se')}
          onTouchStart={(e) => handleMouseDown(e, 'se')}
        />
      </div>
    </div>
  );
}

import React from 'react';

interface AdBannerProps {
  className?: string;
  adSlot?: string;
  format?: 'auto' | 'fluid' | 'rectangle';
}

export default function AdBanner({ className = '', adSlot = '1234567890', format = 'auto' }: AdBannerProps) {
  return (
    <div className={`relative overflow-hidden flex items-center justify-center bg-slate-900/50 border border-slate-700/50 rounded-xl backdrop-blur-sm ${className}`}>
      {/* 
        This is a placeholder for Google AdSense. 
        Once you have your AdSense client ID, you can replace this visual placeholder 
        with the actual <ins class="adsbygoogle" ...> tag.
      */}
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-800/20 to-slate-700/20 pointer-events-none"></div>
      <div className="flex flex-col items-center justify-center text-slate-500 opacity-70 p-4 text-center">
        <span className="text-[10px] uppercase font-bold tracking-widest mb-1">Advertisement</span>
        <span className="text-xs">Your Ad Here</span>
      </div>
    </div>
  );
}

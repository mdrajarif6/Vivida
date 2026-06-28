import React from 'react';
import { cn } from '../lib/utils';
import { Image as ImageIcon, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
  onStart: () => void;
  onHome?: () => void;
}

export const Navbar = ({ onStart, onHome }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <button onClick={onHome} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <ImageIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">resizzy</span>
          </button>
          
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => { if(onHome) onHome(); setTimeout(() => document.getElementById('features')?.scrollIntoView(), 100); }} className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">Features</button>
            <button onClick={() => { if(onHome) onHome(); setTimeout(() => document.getElementById('pricing')?.scrollIntoView(), 100); }} className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">Pricing</button>
            <button onClick={() => { if(onHome) onHome(); setTimeout(() => document.getElementById('faq')?.scrollIntoView(), 100); }} className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">FAQ</button>
            <button onClick={onStart} className="hidden md:block bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg font-medium transition-colors">
              Open Editor
            </button>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-zinc-400">
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-zinc-900 border-b border-zinc-800 px-4 py-4 flex flex-col gap-4">
          <button onClick={() => { if(onHome) onHome(); setTimeout(() => document.getElementById('features')?.scrollIntoView(), 100); setIsOpen(false); }} className="text-left text-zinc-400 hover:text-white text-sm font-medium py-2">Features</button>
          <button onClick={() => { if(onHome) onHome(); setTimeout(() => document.getElementById('pricing')?.scrollIntoView(), 100); setIsOpen(false); }} className="text-left text-zinc-400 hover:text-white text-sm font-medium py-2">Pricing</button>
          <button onClick={() => { if(onHome) onHome(); setTimeout(() => document.getElementById('faq')?.scrollIntoView(), 100); setIsOpen(false); }} className="text-left text-zinc-400 hover:text-white text-sm font-medium py-2">FAQ</button>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium w-full">
            Get Started Free
          </button>
        </div>
      )}
    </nav>
  );
};

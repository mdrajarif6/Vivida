import React from 'react';
import { cn } from '../lib/utils';
import { Sparkles, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
  onStart: () => void;
}

export const Navbar = ({ onStart }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-violet-600 to-fuchsia-500 p-1.5 rounded-lg shadow-lg shadow-violet-500/30">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">resizzy</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">Features</a>
            <a href="#pricing" className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">Pricing</a>
            <a href="#faq" className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">FAQ</a>
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
          <a href="#features" className="text-zinc-400 hover:text-white text-sm font-medium py-2">Features</a>
          <a href="#pricing" className="text-zinc-400 hover:text-white text-sm font-medium py-2">Pricing</a>
          <a href="#faq" className="text-zinc-400 hover:text-white text-sm font-medium py-2">FAQ</a>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium w-full">
            Get Started Free
          </button>
        </div>
      )}
    </nav>
  );
};

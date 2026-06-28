import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Sparkles, Layers, Crop, Wand2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface HeroProps {
  onStart: () => void;
}

export const Hero = ({ onStart }: HeroProps) => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/20 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-6"
        >
          <Sparkles className="w-3 h-3" />
          <span>New: AI-Powered Background Removal</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl lg:text-7xl font-extrabold text-white tracking-tight mb-6"
        >
          Edit your photos <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
            without the complexity.
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-zinc-400 text-lg lg:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          The professional-grade image editor that lives in your browser. 
          Crop, filter, and enhance your visuals in seconds with AI-powered tools.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
        >
          <button onClick={onStart} className="group bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all active:scale-95 flex items-center gap-2">
            Start Editing Now
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="px-8 py-4 rounded-full font-semibold text-lg text-zinc-300 hover:text-white transition-colors border border-zinc-700 hover:bg-zinc-800">
            View Templates
          </button>
        </motion.div>

        {/* Editor Preview Mockup */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative max-w-5xl mx-auto"
        >
          <div className="relative bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden p-2">
            {/* Mock Editor UI */}
            <div className="bg-zinc-950 rounded-xl border border-zinc-800 h-[500px] flex overflow-hidden">
              {/* Sidebar */}
              <div className="w-16 border-r border-zinc-800 flex flex-col items-center py-4 gap-6">
                <div className="p-2 rounded-lg bg-indigo-600 text-white"><Crop className="w-5 h-5" /></div>
                <div className="p-2 rounded-lg text-zinc-500 hover:text-zinc-300 transition-colors"><Layers className="w-5 h-5" /></div>
                <div className="p-2 rounded-lg text-zinc-500 hover:text-zinc-300 transition-colors"><Wand2 className="w-5 h-5" /></div>
              </div>
              
              {/* Canvas Area */}
              <div className="flex-1 bg-zinc-900 relative flex items-center justify-center p-8">
                <div className="relative w-full max-w-md aspect-video bg-zinc-800 rounded-lg shadow-lg overflow-hidden group">
                  <img 
                    src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80" 
                    alt="Preview" 
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-1/2 h-1/2 border-2 border-indigo-400 border-dashed relative">
                      <div className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-indigo-400" />
                      <div className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-indigo-400" />
                      <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-indigo-400" />
                      <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-indigo-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Properties Panel */}
              <div className="w-64 border-l border-zinc-800 p-4 flex flex-col gap-6">
                <div>
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Adjustments</span>
                  <div className="mt-4 space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-zinc-400"><span>Brightness</span><span>+12</span></div>
                      <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 w-3/4" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-zinc-400"><span>Contrast</span><span>-5</span></div>
                      <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 w-1/2" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-zinc-400"><span>Saturation</span><span>+20</span></div>
                      <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 w-2/3" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-auto">
                  <button className="w-full py-2 bg-zinc-800 text-zinc-300 text-sm rounded-lg hover:bg-zinc-700 transition-colors">
                    Export Image
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-indigo-500/20 blur-2xl rounded-full" />
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-violet-500/20 blur-2xl rounded-full" />
        </motion.div>
      </div>
    </section>
  );
};

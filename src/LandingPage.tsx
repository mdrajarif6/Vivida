import React, { useEffect, useState } from 'react';
import { Sparkles, Palette, Scissors, Download, ChevronRight, Heart, Zap, Layers, Image as ImageIcon } from 'lucide-react';
import logoImg from './assets/logo.png';
import AdBanner from './components/AdBanner';

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen w-screen flex flex-col bg-[#05050a] font-sans text-slate-100 selection:bg-violet-500/30 overflow-hidden relative">
      
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/20 blur-[150px] animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-fuchsia-600/20 blur-[150px] animate-pulse" style={{ animationDuration: '10s' }}></div>
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-blue-600/10 blur-[120px] animate-pulse" style={{ animationDuration: '7s' }}></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5QzkyQzIiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djIwaDJ2LTIwaC0ydm0wdjIwaDJ2LTIwaC0ydm0waC0ydjIwaDJ2LTIwem0wIDBoLTIwdjJoMjB2LTJ6bTAgMGgtMjB2MmgyMHYtMnpNMzQgMzZ2MTBoMnYtMTBoLTJ6bTAgMHYxMGgydi0xMGgtMnpNMTQgMTR2MjBoMnYtMjBoLTJ6bTAgMGgtMnYyMGgydi0yMHptMCAwaC0ydjIwaDJ2LTIwem0tMiAwaDIwdjJoLTIwdi0yem0wIDBoMjB2MmgtMjB2LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
      </div>
      
      {/* Header */}
      <header className={`w-full px-8 py-6 flex items-center justify-between z-20 absolute top-0 transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
        <div className="flex items-center gap-3 group cursor-pointer" onClick={onStart}>
          <img src={logoImg} alt="resizzy Logo" className="w-10 h-10 rounded-xl shadow-lg shadow-violet-500/30 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 object-cover" />
          <span className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 group-hover:from-violet-400 group-hover:to-fuchsia-400 transition-all duration-500 lowercase">
            resizzy
          </span>
        </div>
        
        <button 
          onClick={onStart}
          className="text-sm font-semibold text-slate-300 hover:text-white px-5 py-2 rounded-full border border-slate-700/50 hover:border-violet-500/50 hover:bg-slate-800/50 transition-all backdrop-blur-md"
        >
          Open Editor
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center relative w-full z-10 pt-32 pb-12">
        
        {/* Hero Section */}
        <div className={`text-center max-w-4xl mx-auto space-y-8 px-6 transition-all duration-1000 delay-100 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 text-violet-300 text-sm font-semibold shadow-lg shadow-violet-500/10 backdrop-blur-md hover:border-violet-500/40 transition-colors cursor-default">
            <Zap className="h-4 w-4 text-fuchsia-400" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-300 to-fuchsia-300">Now with AI-Powered Magic Tools</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[1.1]">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">Design Without</span> <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-500 to-orange-500 drop-shadow-sm">Boundaries.</span>
          </h1>
          
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
            Professional-grade photo editing directly in your browser. Remove backgrounds with AI, upscale instantly, and create stunning visual masterpieces.
          </p>
          
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={onStart}
              className="group relative flex items-center justify-center px-10 py-5 text-lg font-bold text-white transition-all duration-300 ease-out bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl shadow-2xl shadow-violet-600/25 hover:shadow-violet-600/40 hover:-translate-y-1 overflow-hidden w-full sm:w-auto"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-b from-white/10 to-transparent"></span>
              <span className="absolute right-0 w-8 h-32 -mt-12 transition-all duration-1000 transform translate-x-12 bg-white opacity-10 rotate-12 group-hover:-translate-x-40 ease"></span>
              <span className="relative flex items-center gap-2">
                Launch Studio 
                <ChevronRight className="h-6 w-6 group-hover:translate-x-1.5 transition-transform" />
              </span>
            </button>
          </div>
        </div>

        {/* Abstract UI Showcase Mockup */}
        <div className={`mt-24 w-full max-w-5xl mx-auto px-4 relative transition-all duration-1000 delay-300 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
          <div className="relative rounded-2xl overflow-hidden border border-slate-700/60 bg-slate-900/50 backdrop-blur-xl shadow-2xl shadow-violet-900/20 flex flex-col" style={{ aspectRatio: '16/10' }}>
            {/* Mock Top Bar */}
            <div className="h-12 border-b border-slate-700/50 bg-slate-800/50 flex items-center justify-between px-4">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-6 w-24 bg-slate-700/50 rounded-md"></div>
                <div className="h-6 w-16 bg-violet-600/50 rounded-md"></div>
              </div>
            </div>
            
            <div className="flex flex-1 overflow-hidden">
              {/* Mock Sidebar */}
              <div className="w-20 md:w-56 border-r border-slate-700/50 bg-slate-800/30 p-4 flex flex-col gap-4">
                <div className="h-8 w-full max-w-[120px] rounded-lg bg-slate-700/50 hidden md:block"></div>
                <div className="h-8 w-8 rounded-lg bg-slate-700/50 md:hidden"></div>
                
                <div className="space-y-3 mt-4">
                  <div className="h-4 w-full max-w-[140px] rounded bg-slate-700/30 hidden md:block"></div>
                  <div className="h-4 w-full max-w-[100px] rounded bg-slate-700/30 hidden md:block"></div>
                  <div className="h-4 w-full max-w-[160px] rounded bg-slate-700/30 hidden md:block"></div>
                </div>
                
                <div className="mt-auto grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="aspect-square rounded-xl bg-slate-700/40 border border-slate-600/30"></div>
                  <div className="aspect-square rounded-xl bg-slate-700/40 border border-slate-600/30 hidden md:block"></div>
                  <div className="aspect-square rounded-xl bg-slate-700/40 border border-slate-600/30 hidden md:block"></div>
                  <div className="aspect-square rounded-xl bg-slate-700/40 border border-slate-600/30 hidden md:block"></div>
                </div>
              </div>
              
              {/* Mock Canvas Area */}
              <div className="flex-1 flex items-center justify-center relative p-4 md:p-8 overflow-hidden bg-[#0b0c10]">
                {/* Checkerboard Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(45deg,#1e293b_25%,transparent_25%,transparent_75%,#1e293b_75%,#1e293b),linear-gradient(45deg,#1e293b_25%,transparent_25%,transparent_75%,#1e293b_75%,#1e293b)] bg-[length:20px_20px] bg-[position:0_0,10px_10px] opacity-[0.15]"></div>
                
                {/* Mock Image Content */}
                <div className="w-full h-full max-w-lg max-h-[80%] bg-gradient-to-tr from-indigo-900/40 to-fuchsia-900/40 rounded-xl border border-slate-600/50 shadow-2xl flex items-center justify-center relative group overflow-hidden">
                  <ImageIcon className="h-16 w-16 md:h-24 md:w-24 text-slate-600 group-hover:scale-110 transition-transform duration-700 ease-out" />
                  
                  {/* Sweep Effect */}
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-[shimmer_2s_infinite]"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative floating badges */}
          <div className="absolute top-16 -left-2 md:-left-6 lg:-left-12 bg-slate-800/90 backdrop-blur-xl border border-slate-600/50 p-2 md:p-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-[float_4s_ease-in-out_infinite] z-20">
            <div className="bg-emerald-500/20 p-2 rounded-xl text-emerald-400 border border-emerald-500/20">
              <Scissors className="h-4 w-4 md:h-5 md:w-5" />
            </div>
            <div className="hidden md:block pr-2">
              <p className="text-xs text-slate-400 font-medium leading-none mb-1">AI Tool</p>
              <p className="text-sm font-bold text-slate-200 leading-none">Background Remove</p>
            </div>
          </div>
          
          <div className="absolute bottom-24 -right-2 md:-right-6 lg:-right-12 bg-slate-800/90 backdrop-blur-xl border border-slate-600/50 p-2 md:p-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-[float_5s_ease-in-out_infinite_1s] z-20">
            <div className="hidden md:block pl-2 text-right">
              <p className="text-xs text-slate-400 font-medium leading-none mb-1">Editing</p>
              <p className="text-sm font-bold text-slate-200 leading-none">Layers & Textures</p>
            </div>
            <div className="bg-amber-500/20 p-2 rounded-xl text-amber-400 border border-amber-500/20">
              <Layers className="h-4 w-4 md:h-5 md:w-5" />
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className={`mt-32 max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 w-full transition-all duration-1000 delay-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
          
          {/* Feature 1 */}
          <div className="flex flex-col gap-5 p-8 rounded-[2rem] bg-slate-900/30 border border-slate-700/50 backdrop-blur-xl transition-all duration-300 hover:-translate-y-3 hover:border-violet-500/50 hover:bg-slate-800/50 hover:shadow-2xl hover:shadow-violet-500/10 group">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center border border-violet-500/30 text-violet-300 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-inner">
              <Zap className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-100">AI Superpowers</h3>
            <p className="text-base text-slate-400 leading-relaxed font-medium">
              Magically remove backgrounds with one click or upscale images instantly. The power of advanced AI models right in your browser.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col gap-5 p-8 rounded-[2rem] bg-slate-900/30 border border-slate-700/50 backdrop-blur-xl transition-all duration-300 hover:-translate-y-3 hover:border-fuchsia-500/50 hover:bg-slate-800/50 hover:shadow-2xl hover:shadow-fuchsia-500/10 group">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-fuchsia-500/20 to-pink-500/20 flex items-center justify-center border border-fuchsia-500/30 text-fuchsia-300 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300 shadow-inner">
              <Palette className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-100">Pro Adjustments</h3>
            <p className="text-base text-slate-400 leading-relaxed font-medium">
              Take complete control with sliders for brightness, contrast, saturation, and custom filters. Achieve the perfect look effortlessly.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col gap-5 p-8 rounded-[2rem] bg-slate-900/30 border border-slate-700/50 backdrop-blur-xl transition-all duration-300 hover:-translate-y-3 hover:border-blue-500/50 hover:bg-slate-800/50 hover:shadow-2xl hover:shadow-blue-500/10 group">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-500/30 text-blue-300 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-inner">
              <Download className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-100">Cloud Sync & Export</h3>
            <p className="text-base text-slate-400 leading-relaxed font-medium">
              Export in stunning high resolution up to 4K. Create an account to save your portfolio to your personal cloud dashboard automatically.
            </p>
          </div>

        </div>

        {/* Integrations Section */}
        <div className={`mt-32 max-w-6xl mx-auto px-6 w-full transition-all duration-1000 delay-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-100 mb-4">Extensible Creative Cloud products and services</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Many Creative Cloud apps and services are extensible through APIs, SDKs, and Events. Choose your favorite to get started.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Photoshop */}
            <div className="flex flex-col h-full p-8 rounded-2xl bg-slate-900/40 border border-slate-700/50 backdrop-blur-sm transition-all duration-300 hover:bg-slate-800/60 hover:border-blue-500/50 group">
              <div className="h-12 w-12 rounded-xl bg-[#001e36] flex items-center justify-center border-2 border-[#31a8ff] shadow-[0_0_15px_rgba(49,168,255,0.3)] mb-6">
                <span className="text-[#31a8ff] font-bold text-xl">Ps</span>
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-3">Photoshop</h3>
              <p className="text-sm text-slate-400 mb-8 flex-grow">
                With Photoshop APIs and SDKs, build plugins and integrations that harness the power of the world's best image editing software to transform creative workflows.
              </p>
              <a href="https://developer.adobe.com/photoshop/" target="_blank" rel="noopener noreferrer" className="w-fit px-6 py-2 rounded-full border border-slate-600 text-slate-300 font-medium text-sm transition-all hover:bg-slate-700 hover:text-white group-hover:border-blue-500/50">
                Learn more
              </a>
            </div>

            {/* Card 2: InDesign */}
            <div className="flex flex-col h-full p-8 rounded-2xl bg-slate-900/40 border border-slate-700/50 backdrop-blur-sm transition-all duration-300 hover:bg-slate-800/60 hover:border-pink-500/50 group">
              <div className="h-12 w-12 rounded-xl bg-[#2a0014] flex items-center justify-center border-2 border-[#ff3366] shadow-[0_0_15px_rgba(255,51,102,0.3)] mb-6">
                <span className="text-[#ff3366] font-bold text-xl">Id</span>
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-3">InDesign</h3>
              <p className="text-sm text-slate-400 mb-8 flex-grow">
                Give your InDesign users the power to streamline their editorial and publishing workflows.
              </p>
              <a href="https://developer.adobe.com/indesign/" target="_blank" rel="noopener noreferrer" className="w-fit px-6 py-2 rounded-full border border-slate-600 text-slate-300 font-medium text-sm transition-all hover:bg-slate-700 hover:text-white group-hover:border-pink-500/50">
                Learn more
              </a>
            </div>

            {/* Card 3: Premiere Pro */}
            <div className="flex flex-col h-full p-8 rounded-2xl bg-slate-900/40 border border-slate-700/50 backdrop-blur-sm transition-all duration-300 hover:bg-slate-800/60 hover:border-purple-500/50 group">
              <div className="h-12 w-12 rounded-xl bg-[#000033] flex items-center justify-center border-2 border-[#9999ff] shadow-[0_0_15px_rgba(153,153,255,0.3)] mb-6">
                <span className="text-[#9999ff] font-bold text-xl">Pr</span>
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-3">Premiere Pro</h3>
              <p className="text-sm text-slate-400 mb-8 flex-grow">
                Automate complex tasks, communicate with external hardware, add support for new codecs, and more.
              </p>
              <a href="https://developer.adobe.com/premiere-pro/" target="_blank" rel="noopener noreferrer" className="w-fit px-6 py-2 rounded-full border border-slate-600 text-slate-300 font-medium text-sm transition-all hover:bg-slate-700 hover:text-white group-hover:border-purple-500/50">
                Learn more
              </a>
            </div>

            {/* Card 4: Lightroom Services */}
            <div className="flex flex-col h-full p-8 rounded-2xl bg-slate-900/40 border border-slate-700/50 backdrop-blur-sm transition-all duration-300 hover:bg-slate-800/60 hover:border-cyan-500/50 group">
              <div className="h-12 w-12 rounded-xl bg-[#001e36] flex items-center justify-center border-2 border-[#31a8ff] shadow-[0_0_15px_rgba(49,168,255,0.3)] mb-6">
                <span className="text-[#31a8ff] font-bold text-xl">Lr</span>
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-3">Lightroom Services</h3>
              <p className="text-sm text-slate-400 mb-8 flex-grow">
                Streamline photography workflows for customers with content in Lightroom, through RESTful APIs.
              </p>
              <a href="https://developer.adobe.com/lightroom/" target="_blank" rel="noopener noreferrer" className="w-fit px-6 py-2 rounded-full border border-slate-600 text-slate-300 font-medium text-sm transition-all hover:bg-slate-700 hover:text-white group-hover:border-cyan-500/50">
                Learn more
              </a>
            </div>

            {/* Card 5: Lightroom Classic */}
            <div className="flex flex-col h-full p-8 rounded-2xl bg-slate-900/40 border border-slate-700/50 backdrop-blur-sm transition-all duration-300 hover:bg-slate-800/60 hover:border-cyan-500/50 group">
              <div className="h-12 w-12 rounded-xl bg-[#001e36] flex items-center justify-center border-2 border-[#31a8ff] shadow-[0_0_15px_rgba(49,168,255,0.3)] mb-6">
                <span className="text-[#31a8ff] font-bold text-xl">LrC</span>
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-3">Lightroom Classic</h3>
              <p className="text-sm text-slate-400 mb-8 flex-grow">
                Create effects, define presets and brushes, manipulate metadata, and much more in Lightroom.
              </p>
              <a href="https://developer.adobe.com/lightroom-classic/" target="_blank" rel="noopener noreferrer" className="w-fit px-6 py-2 rounded-full border border-slate-600 text-slate-300 font-medium text-sm transition-all hover:bg-slate-700 hover:text-white group-hover:border-cyan-500/50">
                Learn more
              </a>
            </div>

            {/* Card 6: After Effects */}
            <div className="flex flex-col h-full p-8 rounded-2xl bg-slate-900/40 border border-slate-700/50 backdrop-blur-sm transition-all duration-300 hover:bg-slate-800/60 hover:border-indigo-500/50 group">
              <div className="h-12 w-12 rounded-xl bg-[#000033] flex items-center justify-center border-2 border-[#9999ff] shadow-[0_0_15px_rgba(153,153,255,0.3)] mb-6">
                <span className="text-[#9999ff] font-bold text-xl">Ae</span>
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-3">After Effects</h3>
              <p className="text-sm text-slate-400 mb-8 flex-grow">
                Create stunning visual effects, manipulate project elements, and automate complex tasks in After Effects.
              </p>
              <a href="https://developer.adobe.com/after-effects/" target="_blank" rel="noopener noreferrer" className="w-fit px-6 py-2 rounded-full border border-slate-600 text-slate-300 font-medium text-sm transition-all hover:bg-slate-700 hover:text-white group-hover:border-indigo-500/50">
                Learn more
              </a>
            </div>
          </div>
        </div>

        {/* Ad Placement */}
        <div className={`w-full mt-24 max-w-4xl mx-auto transition-all duration-1000 delay-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          <AdBanner className="w-full h-[90px] rounded-2xl overflow-hidden shadow-2xl" adSlot="landing-page-top" />
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 text-center z-20 relative mt-auto border-t border-slate-800/50 bg-slate-900/20 backdrop-blur-md">
        <div className="flex flex-col items-center justify-center gap-4">
          <a 
            href="https://buymeacoffee.com/arif" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-700 hover:border-pink-500/50 text-slate-300 hover:text-pink-300 transition-all text-sm font-semibold shadow-lg"
          >
            <Heart className="w-4 h-4 text-pink-500" />
            Support Developer - Buy me a coffee
          </a>
          <p className="text-xs text-slate-500 font-medium">© {new Date().getFullYear()} resizzy. All rights reserved.</p>
        </div>
      </footer>
      
    </div>
  );
}

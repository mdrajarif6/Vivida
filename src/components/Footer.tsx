import { Image as ImageIcon, Share2, MessageCircle, Globe, Link as LinkIcon } from 'lucide-react';

interface FooterProps {
  onNavigate?: (pageId: string) => void;
}

export const Footer = ({ onNavigate }: FooterProps) => {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <ImageIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">resizzy</span>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6 max-w-xs">
              Empowering creators with professional image editing tools, right in the browser. 
              Fast, simple, and powerful.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-zinc-500 hover:text-white transition-colors"><Share2 className="w-5 h-5" /></a>
              <a href="#" className="text-zinc-500 hover:text-white transition-colors"><MessageCircle className="w-5 h-5" /></a>
              <a href="#" className="text-zinc-500 hover:text-white transition-colors"><Globe className="w-5 h-5" /></a>
              <a href="#" className="text-zinc-500 hover:text-white transition-colors"><LinkIcon className="w-5 h-5" /></a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6">Product</h4>
            <ul className="space-y-4 text-sm text-zinc-400">
              <li><button onClick={() => { setTimeout(() => document.getElementById('features')?.scrollIntoView(), 100); onNavigate?.(''); }} className="hover:text-white transition-colors">Features</button></li>
              <li><button onClick={() => { setTimeout(() => document.getElementById('pricing')?.scrollIntoView(), 100); onNavigate?.(''); }} className="hover:text-white transition-colors">Pricing</button></li>
              <li><button onClick={() => onNavigate?.('templates')} className="hover:text-white transition-colors">Templates</button></li>
              <li><button onClick={() => onNavigate?.('api')} className="hover:text-white transition-colors">API</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-zinc-400">
              <li><button onClick={() => onNavigate?.('about')} className="hover:text-white transition-colors">About Us</button></li>
              <li><button onClick={() => onNavigate?.('careers')} className="hover:text-white transition-colors">Careers</button></li>
              <li><button onClick={() => onNavigate?.('blog')} className="hover:text-white transition-colors">Blog</button></li>
              <li><button onClick={() => onNavigate?.('contact')} className="hover:text-white transition-colors">Contact</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6">Legal</h4>
            <ul className="space-y-4 text-sm text-zinc-400">
              <li><button onClick={() => onNavigate?.('privacy')} className="hover:text-white transition-colors">Privacy Policy</button></li>
              <li><button onClick={() => onNavigate?.('terms')} className="hover:text-white transition-colors">Terms of Service</button></li>
              <li><button onClick={() => onNavigate?.('cookies')} className="hover:text-white transition-colors">Cookie Policy</button></li>
              <li><button onClick={() => onNavigate?.('gdpr')} className="hover:text-white transition-colors">GDPR</button></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-zinc-800 text-center">
          <p className="text-zinc-500 text-sm">
            © {new Date().getFullYear()} resizzy Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

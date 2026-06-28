import { ArrowLeft } from 'lucide-react';
import { pageContent } from '../lib/pageContent';

interface ContentPageProps {
  pageId: string;
  onBack: () => void;
}

export const ContentPage = ({ pageId, onBack }: ContentPageProps) => {
  const page = pageContent[pageId];

  if (!page) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Page Not Found</h2>
          <button 
            onClick={onBack}
            className="text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 bg-zinc-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <button 
          onClick={onBack}
          className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2 mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
          Back to Home
        </button>
        
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 md:p-12 shadow-xl">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-8 border-b border-zinc-800 pb-8">
            {page.title}
          </h1>
          
          <div 
            className="prose prose-invert max-w-none text-zinc-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </div>
      </div>
    </div>
  );
};

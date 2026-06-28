import { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { Pricing } from './components/Pricing';
import { FAQ } from './components/FAQ';
import { Footer } from './components/Footer';
import { ContentPage } from './components/ContentPage';

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  const [mounted, setMounted] = useState(false);
  const [activePage, setActivePage] = useState<string | null>(null);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-indigo-500/30 font-sans w-screen overflow-x-hidden">
      <Navbar onStart={onStart} onHome={() => setActivePage(null)} />
      
      {activePage ? (
        <ContentPage pageId={activePage} onBack={() => setActivePage(null)} />
      ) : (
        <main>
          <Hero onStart={onStart} />
          <Features />
          <Pricing />
          <FAQ />
        </main>
      )}
      
      <Footer onNavigate={(pageId) => setActivePage(pageId)} />
    </div>
  );
}

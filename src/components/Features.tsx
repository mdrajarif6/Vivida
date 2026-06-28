import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  ShieldCheck, 
  Smartphone, 
  Cpu, 
  Globe, 
  Clock, 
  Layers, 
  Palette 
} from 'lucide-react';

const features = [
  {
    title: 'AI-Powered Enhancements',
    description: 'One-click improvements for lighting, color, and sharpness using advanced neural networks.',
    icon: Cpu,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
  },
  {
    title: 'Non-Destructive Editing',
    description: 'All your changes are saved as layers. Go back and refine any adjustment at any time.',
    icon: Layers,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
  },
  {
    title: 'Cloud Synchronization',
    description: 'Start editing on your desktop and finish on your tablet. Your projects sync instantly.',
    icon: Globe,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    title: 'Lightning Fast Performance',
    description: 'Optimized for the browser. No lag, no waiting for renders, just pure creativity.',
    icon: Zap,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
  },
  {
    title: 'Advanced Color Grading',
    description: 'Professional color wheels and LUTs to give your photos a cinematic look and feel.',
    icon: Palette,
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
  },
  {
    title: 'Enterprise Grade Security',
    description: 'Your images are encrypted and stored safely. We never sell your data to third parties.',
    icon: ShieldCheck,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
            Everything you need to <br />
            <span className="text-indigo-500">create stunning visuals</span>
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            We've combined professional power with intuitive design to make photo editing accessible to everyone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 transition-all group"
            >
              <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center mb-6 transition-transform group-hover:scale-110", feature.bg)}>
                <feature.icon className={cn("w-6 h-6", feature.color)} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-zinc-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

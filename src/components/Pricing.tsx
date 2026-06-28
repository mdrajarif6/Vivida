import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '0',
    description: 'Perfect for hobbyists and occasional editing.',
    features: [
      'Basic photo enhancements',
      'Standard filters',
      'Up to 5 projects per month',
      'Export in JPG/PNG',
      'Community support',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '19',
    description: 'For creators who need professional tools.',
    features: [
      'Everything in Free',
      'Unlimited projects',
      'AI Background Removal',
      'Advanced Color Grading',
      'Priority support',
      'RAW file support',
    ],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: '49',
    description: 'For agencies and high-volume teams.',
    features: [
      'Everything in Pro',
      'Team collaboration tools',
      'Shared asset library',
      'Custom API access',
      'Dedicated account manager',
      'SSO & SAML',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

export const Pricing = () => {
  return (
    <section id="pricing" className="py-20 lg:py-32 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
            Simple, transparent <br />
            <span className="text-indigo-500">pricing plans</span>
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Choose the plan that fits your creative needs. Scale up as your projects grow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={cn(
                "relative p-8 rounded-3xl border transition-all",
                plan.highlighted 
                  ? "bg-zinc-900 border-indigo-500 shadow-2xl shadow-indigo-500/10 scale-105 z-10" 
                  : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
              )}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Most Popular
                </div>
              )}
              
              <div className="mb-8 text-center">
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1 mb-4">
                  <span className="text-4xl font-extrabold text-white">${plan.price}</span>
                  <span className="text-zinc-500 text-sm">/month</span>
                </div>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {plan.description}
                </p>
              </div>

              <div className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm text-zinc-300">
                    <div className="bg-indigo-500/20 p-0.5 rounded-full">
                      <Check className="w-3 h-3 text-indigo-400" />
                    </div>
                    {feature}
                  </div>
                ))}
              </div>

              <button className={cn(
                "w-full py-3 rounded-xl font-semibold transition-all active:scale-95",
                plan.highlighted 
                  ? "bg-indigo-600 text-white hover:bg-indigo-500" 
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              )}>
                {plan.cta}
              </button>
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

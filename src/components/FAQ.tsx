import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    question: "Do I need to install any software?",
    answer: "No, resizzy is a completely browser-based image editor. You can access all its features from any modern web browser without downloading anything.",
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We use end-to-end encryption for all your uploads and projects. Your images are stored securely and we never share or sell your data.",
  },
  {
    question: "Can I export in high resolution?",
    answer: "Yes, we support high-resolution exports in various formats including JPG, PNG, and WEBP. Pro users can also export in TIFF and RAW formats.",
  },
  {
    question: "How does the AI background removal work?",
    answer: "Our AI is trained on millions of images to intelligently distinguish between the subject and the background, allowing for precise removal with one click.",
  },
];

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 lg:py-32">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
            Frequently Asked <span className="text-indigo-500">Questions</span>
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
            >
              <button 
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full p-6 text-left flex items-center justify-between text-white font-medium hover:bg-zinc-800/50 transition-colors"
              >
                <span>{faq.question}</span>
                {openIndex === index ? <Minus className="w-5 h-5 text-zinc-500" /> : <Plus className="w-5 h-5 text-zinc-500" />}
              </button>
              {openIndex === index && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="px-6 pb-6 text-zinc-400 text-sm leading-relaxed"
                >
                  {faq.answer}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

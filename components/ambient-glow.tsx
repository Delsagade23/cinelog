'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCineStore } from '@/lib/store';

export const AmbientGlow = () => {
  const { activeMedia } = useCineStore();
  const color = activeMedia?.dominant_color || '#e28834';

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 transition-opacity duration-1000">
      <AnimatePresence mode="wait">
        <motion.div
          key={color}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.38, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute -top-[25%] -left-[15%] w-[85vw] h-[85vw] max-w-[1200px] max-h-[1200px] rounded-full blur-[140px]"
          style={{
            background: `radial-gradient(circle, ${color} 0%, rgba(13, 15, 21, 0.4) 60%, transparent 80%)`,
          }}
        />
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${color}-secondary`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.22 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          className="absolute top-[40%] -right-[10%] w-[65vw] h-[65vw] max-w-[900px] max-h-[900px] rounded-full blur-[160px]"
          style={{
            background: `radial-gradient(circle, ${color} 0%, rgba(99, 102, 241, 0.2) 50%, transparent 75%)`,
          }}
        />
      </AnimatePresence>

      {/* Subtle vignette layer */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#07080a_90%)]" />
    </div>
  );
};

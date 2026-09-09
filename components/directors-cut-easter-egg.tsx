'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clapperboard, X, Volume2, Film } from 'lucide-react';
import { useCineStore } from '@/lib/store';
import { sound } from '@/lib/sound';

const KONAMI_CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a'
];

export const DirectorsCutEasterEgg = () => {
  const { directorsCut, setDirectorsCut } = useCineStore();
  const [keySequence, setKeySequence] = useState<string[]>([]);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when typing in inputs/textareas
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.key === 'Escape' && directorsCut) {
        setDirectorsCut(false);
        setShowBanner(false);
        return;
      }

      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      const expectedKey = KONAMI_CODE[keySequence.length];

      if (key === (expectedKey.length === 1 ? expectedKey.toLowerCase() : expectedKey)) {
        const nextSequence = [...keySequence, key];
        setKeySequence(nextSequence);

        if (nextSequence.length === KONAMI_CODE.length) {
          // KONAMI CODE TRIGGERED!
          sound.playProjectorReel();
          setDirectorsCut(prev => !prev);
          setShowBanner(true);
          setKeySequence([]);
          setTimeout(() => setShowBanner(false), 5000);
        }
      } else {
        // Reset if key doesn't match next step
        setKeySequence(key === 'ArrowUp' ? ['ArrowUp'] : []);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keySequence, directorsCut, setDirectorsCut]);

  if (!directorsCut) {
    return (
      <AnimatePresence>
        {/* Subtle Konami Progress Indicator if user is entering keys */}
        {keySequence.length > 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-6 z-50 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 backdrop-blur-md text-amber-300 text-xs font-mono flex items-center gap-2 pointer-events-none"
          >
            <Film className="w-3.5 h-3.5 animate-spin" />
            <span>DIRECTOR'S CUT SEQUENCE: {keySequence.length}/{KONAMI_CODE.length}</span>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <>
      {/* 2.39:1 Anamorphic Letterbox Top Bar */}
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: '7.5vh' }}
        exit={{ height: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-[100] bg-black pointer-events-none border-b border-white/[0.05]"
      />

      {/* 2.39:1 Anamorphic Letterbox Bottom Bar */}
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: '7.5vh' }}
        exit={{ height: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed bottom-0 left-0 right-0 z-[100] bg-black pointer-events-none border-t border-white/[0.05]"
      />

      {/* 35mm Heavy Film Grain & Monochrome/Sepia Grading Layer */}
      <div 
        className="fixed inset-0 z-[90] pointer-events-none directors-cut-grain"
        style={{
          backdropFilter: 'grayscale(60%) sepia(25%) contrast(115%)',
          WebkitBackdropFilter: 'grayscale(60%) sepia(25%) contrast(115%)'
        }}
      />

      {/* Retro HUD Banner / Exit Button */}
      <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[110] flex items-center gap-3 px-4 py-2 rounded-full bg-black/90 border border-amber-500/60 backdrop-blur-xl shadow-2xl text-amber-300 font-mono text-xs">
        <Clapperboard className="w-4 h-4 text-amber-400 animate-pulse" />
        <span className="font-bold tracking-wider">DIRECTOR'S CUT MODE • 2.39:1 ANAMORPHIC</span>
        <button
          onClick={() => setDirectorsCut(false)}
          className="ml-2 p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          title="Exit Director's Cut (Press Esc)"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </>
  );
};

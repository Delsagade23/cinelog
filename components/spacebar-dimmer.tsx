'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Clock, Film, X, Sparkles } from 'lucide-react';
import { useCineStore } from '@/lib/store';
import { sound } from '@/lib/sound';

export const SpacebarDimmer = () => {
  const { theaterMode, setTheaterMode, activeMedia, setDetailMedia } = useCineStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if inside input/textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        sound.playTactileClick(500);
        setTheaterMode(prev => !prev);
      } else if (e.key === 'Escape' && theaterMode) {
        setTheaterMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [theaterMode, setTheaterMode]);

  if (!theaterMode || !activeMedia) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 z-50 bg-[#060709]/95 flex flex-col justify-between p-6 md:p-12 overflow-hidden"
      >
        {/* Full-bleed 4K Backdrop Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={activeMedia.backdrop_url}
            alt={activeMedia.title}
            fill
            className="object-cover object-center opacity-40 scale-105 transition-transform duration-1000"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060709] via-[#060709]/60 to-[#060709]/40" />
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#060709]/60 to-[#060709]" />
        </div>

        {/* Top Header Bar */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 border border-white/10 text-xs font-mono text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>CINEMA DIMMER FOCUS</span>
          </div>

          <button
            onClick={() => setTheaterMode(false)}
            className="p-2.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-slate-300 hover:text-white transition-colors"
            title="Exit Dimmer (Spacebar or Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Center Editorial Marquee */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="relative z-10 max-w-4xl mx-auto text-center space-y-6"
        >
          {/* Rating & Stats Pill */}
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-black/70 border border-amber-500/30 text-xs text-slate-300">
            <span className="flex items-center gap-1 text-amber-400 font-bold">
              <Star className="w-4 h-4 fill-amber-400" />
              {activeMedia.personal_rating.toFixed(1)} / 10
            </span>
            <span>•</span>
            <span>{activeMedia.release_year}</span>
            <span>•</span>
            <span>{activeMedia.runtime_minutes} mins</span>
            <span>•</span>
            <span className="text-slate-400 font-medium">Dir. {activeMedia.director}</span>
          </div>

          {/* Title in Grand Editorial Serif */}
          <h1 className="font-editorial text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight drop-shadow-2xl">
            {activeMedia.title}
          </h1>

          {/* Punchy Gut Reaction in Highlight Banner */}
          <div className="p-6 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-md max-w-2xl mx-auto shadow-2xl">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-widest mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gut Reaction</span>
            </div>
            <p className="font-editorial text-lg sm:text-xl italic text-amber-200/95 leading-relaxed">
              "{activeMedia.gut_reaction}"
            </p>
          </div>

          {/* Action Trigger */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              onClick={() => {
                setTheaterMode(false);
                setDetailMedia(activeMedia);
              }}
              className="px-6 py-3 rounded-xl bg-amber-500 text-black font-bold text-sm hover:bg-amber-400 transition-transform active:scale-95 shadow-xl shadow-amber-500/25"
            >
              Read Full Analytical Review
            </button>
          </div>
        </motion.div>

        {/* Bottom Hint */}
        <div className="relative z-10 text-center text-xs font-mono text-slate-500">
          Press <kbd className="px-2 py-0.5 rounded bg-white/10 text-slate-300">Spacebar</kbd> or <kbd className="px-2 py-0.5 rounded bg-white/10 text-slate-300">Esc</kbd> to return to curation grid
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

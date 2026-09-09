'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Star, Film, Tv, Info, Compass, Filter } from 'lucide-react';
import { MediaLog } from '@/lib/types';
import { useCineStore } from '@/lib/store';
import { sound } from '@/lib/sound';

export const MoodMatrix = () => {
  const { mediaLogs, setDetailMedia, setActiveMedia } = useCineStore();
  const [hoveredMedia, setHoveredMedia] = useState<MediaLog | null>(null);
  const [selectedQuadrant, setSelectedQuadrant] = useState<string | null>(null);

  // Quadrant categorization
  const getQuadrant = (x: number, y: number) => {
    if (x <= 0 && y >= 0) return 'transcendence'; // Cerebral + Uplifting
    if (x > 0 && y >= 0) return 'kinetic_joy';   // Fun + Uplifting
    if (x <= 0 && y < 0) return 'abyss';         // Cerebral + Dark
    return 'pulp_chaos';                         // Fun + Dark
  };

  const filteredLogs = selectedQuadrant
    ? mediaLogs.filter(m => getQuadrant(m.mood_coordinates.x, m.mood_coordinates.y) === selectedQuadrant)
    : mediaLogs;

  const handleNodeHover = (media: MediaLog) => {
    setHoveredMedia(media);
    setActiveMedia(media);
    sound.playTactileClick(1000);
  };

  const handleNodeClick = (media: MediaLog) => {
    sound.playTactileClick(700);
    setDetailMedia(media);
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto flex flex-col space-y-6">
      
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold tracking-wider uppercase">
            <Compass className="w-4 h-4" />
            <span>2D Emotional Coordinates</span>
          </div>
          <h2 className="font-editorial text-2xl md:text-3xl font-bold text-white mt-1">
            The Mood Matrix
          </h2>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            Explore watched films and series mapped by psychological depth (Cerebral vs. Pure Fun) and emotional tone (Soul-Crushing vs. Uplifting).
          </p>
        </div>

        {/* Quadrant Filter Pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedQuadrant(null)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              selectedQuadrant === null
                ? 'bg-amber-500 text-black font-semibold shadow-lg shadow-amber-500/25'
                : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.06]'
            }`}
          >
            All Coordinates ({mediaLogs.length})
          </button>
          <button
            onClick={() => setSelectedQuadrant('abyss')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              selectedQuadrant === 'abyss'
                ? 'bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-500/25'
                : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.06]'
            }`}
          >
            3 AM Abyss (Cerebral & Dark)
          </button>
          <button
            onClick={() => setSelectedQuadrant('transcendence')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              selectedQuadrant === 'transcendence'
                ? 'bg-emerald-500 text-black font-semibold shadow-lg shadow-emerald-500/25'
                : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.06]'
            }`}
          >
            Transcendence (Cerebral & Uplifting)
          </button>
          <button
            onClick={() => setSelectedQuadrant('kinetic_joy')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              selectedQuadrant === 'kinetic_joy'
                ? 'bg-amber-400 text-black font-semibold shadow-lg shadow-amber-400/25'
                : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.06]'
            }`}
          >
            Kinetic Joy (Fun & Uplifting)
          </button>
          <button
            onClick={() => setSelectedQuadrant('pulp_chaos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              selectedQuadrant === 'pulp_chaos'
                ? 'bg-rose-500 text-white font-semibold shadow-lg shadow-rose-500/25'
                : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.06]'
            }`}
          >
            Dark Pulp & Chaos (Fun & Dark)
          </button>
        </div>
      </div>

      {/* The 2D Quadrant Canvas */}
      <div className="relative w-full aspect-[4/3] md:aspect-[16/10] bg-[#0c0e14]/95 rounded-3xl border border-white/[0.1] shadow-2xl overflow-hidden select-none">
        
        {/* Background Grid & Axis Lines */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Quadrant Background Tints */}
          <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-emerald-500/[0.02]" />
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-amber-500/[0.02]" />
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-indigo-500/[0.03]" />
          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-rose-500/[0.02]" />

          {/* Grid lines */}
          <svg className="w-full h-full opacity-20">
            <defs>
              <pattern id="matrix-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#matrix-grid)" />
          </svg>

          {/* Center Axes */}
          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gradient-to-b from-transparent via-white/30 to-transparent" />
          <div className="absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

          {/* Concentric Coordinate Rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[35%] h-[35%] rounded-full border border-white/[0.06] border-dashed" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] rounded-full border border-white/[0.04]" />

          {/* Axis Labels */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 border border-white/10 text-[11px] font-bold text-emerald-400 tracking-wider uppercase">
            ▲ Uplifting / Life-Affirming
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 border border-white/10 text-[11px] font-bold text-rose-400 tracking-wider uppercase">
            ▼ Soul-Crushing / Bleak
          </div>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 -rotate-90 px-3 py-1 rounded-full bg-black/60 border border-white/10 text-[11px] font-bold text-indigo-400 tracking-wider uppercase">
            ◀ Cerebral / Analytical
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 px-3 py-1 rounded-full bg-black/60 border border-white/10 text-[11px] font-bold text-amber-400 tracking-wider uppercase">
            ▶ Pure Visceral Fun
          </div>

          {/* Quadrant Watermark Labels */}
          <div className="absolute top-10 left-10 text-emerald-500/20 font-editorial text-2xl font-bold tracking-tight">
            Transcendence
          </div>
          <div className="absolute top-10 right-10 text-amber-500/20 font-editorial text-2xl font-bold tracking-tight text-right">
            Kinetic Joy
          </div>
          <div className="absolute bottom-10 left-10 text-indigo-500/20 font-editorial text-2xl font-bold tracking-tight">
            3 AM Abyss
          </div>
          <div className="absolute bottom-10 right-10 text-rose-500/20 font-editorial text-2xl font-bold tracking-tight text-right">
            Dark Pulp
          </div>
        </div>

        {/* Media Plot Nodes */}
        <div className="absolute inset-12 z-20">
          {filteredLogs.map((media) => {
            // Map -100..+100 to 0%..100%
            const leftPercent = ((media.mood_coordinates.x + 100) / 200) * 100;
            const topPercent = ((100 - media.mood_coordinates.y) / 200) * 100;
            const isHovered = hoveredMedia?.id === media.id;

            return (
              <motion.div
                key={media.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.35, zIndex: 50 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                onMouseEnter={() => handleNodeHover(media)}
                onMouseLeave={() => setHoveredMedia(null)}
                onClick={() => handleNodeClick(media)}
                style={{
                  left: `${leftPercent}%`,
                  top: `${topPercent}%`,
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              >
                {/* Glowing Node Avatar */}
                <div 
                  className={`relative w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 transition-all duration-300 shadow-xl ${
                    isHovered 
                      ? 'border-amber-400 ring-4 ring-amber-400/30 scale-110' 
                      : 'border-white/30 hover:border-white'
                  }`}
                  style={{
                    boxShadow: isHovered 
                      ? `0 0 25px ${media.dominant_color || '#eab308'}`
                      : '0 4px 15px rgba(0,0,0,0.6)'
                  }}
                >
                  <Image
                    src={media.poster_url || 'https://image.tmdb.org/t/p/w780/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg'}
                    alt={media.title}
                    fill
                    sizes="48px"
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                </div>

                {/* Pulsing Core Indicator */}
                <div 
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-amber-400 shadow-md"
                  style={{ backgroundColor: media.dominant_color || '#eab308' }}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Live Hover Popover Card */}
        <AnimatePresence>
          {hoveredMedia && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-6 right-6 z-40 w-80 glass-panel p-4 rounded-2xl border border-amber-500/30 shadow-2xl bg-[#0c0e14]/95 pointer-events-none"
            >
              <div className="flex gap-3">
                <div className="relative w-16 h-24 rounded-lg overflow-hidden shrink-0 border border-white/10">
                  <Image
                    src={hoveredMedia.poster_url || 'https://image.tmdb.org/t/p/w780/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg'}
                    alt={hoveredMedia.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                      {hoveredMedia.media_type === 'movie' ? 'Movie' : hoveredMedia.media_type === 'anime' ? 'Anime' : hoveredMedia.media_type === 'kdrama' ? 'K-Drama' : 'Series'} • {hoveredMedia.release_year}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-300">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {hoveredMedia.personal_rating.toFixed(1)}
                    </span>
                  </div>
                  <h4 className="font-editorial text-base font-bold text-white truncate mt-0.5">
                    {hoveredMedia.title}
                  </h4>
                  <p className="text-xs text-slate-400 truncate">
                    Dir. {hoveredMedia.director}
                  </p>
                  
                  <div className="mt-2 text-[11px] text-amber-200/90 font-editorial italic line-clamp-2 leading-tight bg-white/[0.03] p-1.5 rounded border border-white/[0.05]">
                    "{hoveredMedia.gut_reaction}"
                  </div>
                </div>
              </div>

              {/* Coordinates breakdown */}
              <div className="mt-3 pt-2 border-t border-white/[0.08] flex items-center justify-between text-[10px] text-slate-400">
                <span>X (Depth): <strong>{hoveredMedia.mood_coordinates.x > 0 ? `+${hoveredMedia.mood_coordinates.x} Fun` : `${hoveredMedia.mood_coordinates.x} Cerebral`}</strong></span>
                <span>Y (Tone): <strong>{hoveredMedia.mood_coordinates.y > 0 ? `+${hoveredMedia.mood_coordinates.y} Uplift` : `${hoveredMedia.mood_coordinates.y} Bleak`}</strong></span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

    </div>
  );
};

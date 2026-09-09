'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { X, Ticket, Sparkles, Star, RefreshCw, Scissors, Film, Clock, HeartHandshake } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCineStore } from '@/lib/store';
import { MediaLog } from '@/lib/types';
import { sound } from '@/lib/sound';

export const BlindTicketModal = () => {
  const { ticketModalOpen, setTicketModalOpen, mediaLogs, setDetailMedia } = useCineStore();
  
  const [runtimeFilter, setRuntimeFilter] = useState<'all' | 'short' | 'standard' | 'epic'>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [isTorn, setIsTorn] = useState(false);
  const [recommendedMedia, setRecommendedMedia] = useState<MediaLog | null>(null);

  // Drag physics for tear gesture
  const dragY = useMotionValue(0);
  const tearOpacity = useTransform(dragY, [0, 100], [1, 0.2]);
  const tearRotate = useTransform(dragY, [0, 100], [0, 15]);

  const generateRecommendation = () => {
    let pool = [...mediaLogs];

    if (runtimeFilter === 'short') {
      pool = pool.filter(m => (m.runtime_minutes || 120) < 105);
    } else if (runtimeFilter === 'standard') {
      pool = pool.filter(m => (m.runtime_minutes || 120) >= 105 && (m.runtime_minutes || 120) <= 140);
    } else if (runtimeFilter === 'epic') {
      pool = pool.filter(m => (m.runtime_minutes || 120) > 140);
    }

    if (selectedTag !== 'all') {
      pool = pool.filter(m => m.custom_tags.includes(selectedTag));
    }

    if (pool.length === 0) {
      pool = [...mediaLogs];
    }

    const randomPick = pool[Math.floor(Math.random() * pool.length)];
    setRecommendedMedia(randomPick);
  };

  const handleTear = () => {
    if (isTorn) return;

    sound.playTicketTear();
    generateRecommendation();
    setIsTorn(true);

    // Celebration Confetti
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#eab308', '#f59e0b', '#f43f5e', '#38bdf8', '#ffffff']
      });
    } catch {}
  };

  const handleReset = () => {
    sound.playTactileClick(800);
    setIsTorn(false);
    setRecommendedMedia(null);
    dragY.set(0);
  };

  const handleOpenDetail = () => {
    if (recommendedMedia) {
      setTicketModalOpen(false);
      setDetailMedia(recommendedMedia);
    }
  };

  if (!ticketModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        
        {/* Modal Backdrop click to close */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setTicketModalOpen(false)}
          className="absolute inset-0"
        />

        {/* Ticket Modal Box */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative z-10 w-full max-w-lg glass-panel rounded-3xl border border-amber-500/30 shadow-2xl p-6 overflow-hidden bg-[#0c0e14]/95 text-slate-100"
        >
          {/* Close button */}
          <button
            onClick={() => setTicketModalOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Title Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Ticket className="w-3.5 h-3.5" />
              <span>Vintage Blind Cinema Ticket</span>
            </div>
            <h3 className="font-editorial text-2xl font-bold text-white">
              Tear for a Blind Recommendation
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Can't decide what to watch? Set your parameters and tear the stub for a hand-picked personal curation.
            </p>
          </div>

          {/* Filter Customizer (Before Tearing) */}
          {!isTorn && (
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Runtime Duration:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'all', label: 'Any' },
                    { id: 'short', label: '<105m' },
                    { id: 'standard', label: '105-140m' },
                    { id: 'epic', label: '>140m' },
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setRuntimeFilter(f.id as any)}
                      className={`py-1.5 rounded-xl text-xs font-medium border transition-all ${
                        runtimeFilter === f.id
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                          : 'bg-white/[0.03] text-slate-400 border-white/[0.06] hover:text-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Desired Vibe:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {['all', 'Mind-Melting', '3 AM Melancholy', 'Comfort Rewatch', 'Pure Action', 'Existential Catharsis'].map(t => (
                    <button
                      key={t}
                      onClick={() => setSelectedTag(t)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                        selectedTag === t
                          ? 'bg-amber-500 text-black border-amber-500 font-bold'
                          : 'bg-white/[0.03] text-slate-400 border-white/[0.06] hover:text-white'
                      }`}
                    >
                      {t === 'all' ? 'Any Vibe' : t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* The Vintage Perforated Ticket Graphic */}
          <div className="relative">
            {!isTorn ? (
              // Untorn Ticket with Tear-Off Stub
              <div className="relative rounded-2xl bg-gradient-to-br from-[#1a1c24] to-[#12141c] border-2 border-dashed border-amber-500/40 p-5 shadow-inner">
                <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4 text-xs font-mono text-amber-400/80">
                  <span>ADMIT ONE • CINELOG NO. {Math.floor(Math.random() * 89999 + 10000)}</span>
                  <span>ROW A • SEAT 14</span>
                </div>

                <div className="text-center py-4 space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Scissors className="w-6 h-6 animate-pulse" />
                  </div>
                  <h4 className="font-editorial text-lg font-bold text-amber-200">
                    Mystery Vault Selection
                  </h4>
                  <p className="text-xs text-slate-400">
                    Click or drag the perforated strip below to rip open your ticket.
                  </p>
                </div>

                {/* Perforated Rip Bar */}
                <motion.div
                  drag="y"
                  dragConstraints={{ top: 0, bottom: 120 }}
                  dragElastic={0.4}
                  style={{ y: dragY, opacity: tearOpacity, rotate: tearRotate }}
                  onDragEnd={(_, info) => {
                    if (info.offset.y > 60) {
                      handleTear();
                    }
                  }}
                  onClick={handleTear}
                  className="mt-4 p-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-xs uppercase tracking-wider text-center cursor-grab active:cursor-grabbing shadow-lg shadow-amber-500/30 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                >
                  <Scissors className="w-4 h-4" />
                  <span>Rip & Tear Stub to Reveal</span>
                </motion.div>
              </div>
            ) : (
              // Torn Ticket: Revealed Recommendation!
              recommendedMedia && (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative rounded-2xl bg-gradient-to-br from-[#161a24] to-[#0e111a] border-2 border-amber-400 p-5 shadow-2xl space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-amber-500/20 pb-2 text-[11px] font-mono text-amber-400">
                    <span>★ TICKET REVEALED ★</span>
                    <span>RUNTIME: {recommendedMedia.runtime_minutes}m</span>
                  </div>

                  <div className="flex gap-4 items-center">
                    <div className="relative w-20 h-28 rounded-xl overflow-hidden shrink-0 border border-white/20 shadow-lg">
                      <Image
                        src={recommendedMedia.poster_url || 'https://image.tmdb.org/t/p/w780/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg'}
                        alt={recommendedMedia.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold mb-0.5">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{recommendedMedia.personal_rating.toFixed(1)} / 10</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-300">{recommendedMedia.release_year}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-amber-300/90 uppercase text-[10px] font-semibold">
                          {recommendedMedia.media_type === 'movie' ? 'Movie' : recommendedMedia.media_type === 'anime' ? 'Anime' : recommendedMedia.media_type === 'kdrama' ? 'K-Drama' : 'Series'}
                        </span>
                      </div>

                      <h4 className="font-editorial text-xl font-bold text-white leading-tight">
                        {recommendedMedia.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Dir. {recommendedMedia.director}
                      </p>

                      <div className="mt-2 text-xs font-editorial italic text-amber-200/90 line-clamp-2 bg-amber-500/[0.06] p-2 rounded-lg border border-amber-500/20">
                        "{recommendedMedia.gut_reaction}"
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={handleOpenDetail}
                      className="flex-1 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
                    >
                      Read Full Review
                    </button>
                    <button
                      onClick={handleReset}
                      className="px-3 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-xs font-medium transition-colors flex items-center gap-1.5"
                      title="Tear Another Ticket"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Reroll</span>
                    </button>
                  </div>
                </motion.div>
              )
            )}
          </div>

        </motion.div>

      </div>
    </AnimatePresence>
  );
};

'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Star, 
  Clock, 
  Film, 
  Tv, 
  Calendar, 
  RotateCw, 
  Sparkles, 
  Compass, 
  Edit2, 
  Trash2,
  Users,
  Flame,
  Heart
} from 'lucide-react';
import { useCineStore } from '@/lib/store';
import { sound } from '@/lib/sound';

export const ReviewDetailModal = () => {
  const { 
    detailMedia, 
    setDetailMedia, 
    setEditingMedia, 
    deleteLog, 
    isAdmin 
  } = useCineStore();

  if (!detailMedia) return null;

  const handleClose = () => {
    sound.playTactileClick(600);
    setDetailMedia(null);
  };

  const handleEdit = () => {
    setEditingMedia(detailMedia);
  };

  const handleDelete = () => {
    if (confirm(`Delete "${detailMedia.title}"?`)) {
      deleteLog(detailMedia.id);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-lg overflow-y-auto">
        
        {/* Backdrop click to close */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.93, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.93, opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative z-10 w-full max-w-3xl glass-panel rounded-3xl border border-white/10 shadow-2xl overflow-hidden bg-[#0c0e14] my-8"
        >
          {/* Header Backdrop Banner */}
          <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-black">
            <Image
              src={detailMedia.backdrop_url || detailMedia.poster_url || 'https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5200fr.jpg'}
              alt={detailMedia.title}
              fill
              className="object-cover object-center"
              priority
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e14] via-[#0c0e14]/50 to-black/40" />

            {/* Top Close & Admin Actions */}
            <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
              {isAdmin && (
                <>
                  <button
                    onClick={handleEdit}
                    className="p-2 rounded-full bg-black/70 border border-white/20 text-slate-300 hover:text-amber-400 hover:border-amber-400 transition-colors"
                    title="Edit Log"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-2 rounded-full bg-black/70 border border-white/20 text-slate-300 hover:text-rose-400 hover:border-rose-400 transition-colors"
                    title="Delete Log"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
              <button
                onClick={handleClose}
                className="p-2 rounded-full bg-black/70 border border-white/20 text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Poster & Header Overlay */}
            <div className="absolute bottom-4 left-6 right-6 flex gap-5 items-end z-10">
              <div className="relative w-24 sm:w-32 aspect-[2/3] rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl shrink-0 hidden xs:block">
                <Image
                  src={detailMedia.poster_url || 'https://image.tmdb.org/t/p/w780/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg'}
                  alt={detailMedia.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
                  <span className="flex items-center gap-1 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {detailMedia.personal_rating.toFixed(1)} / 10
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-300">{detailMedia.release_year}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-300 inline-flex items-center gap-1">
                    {detailMedia.media_type === 'movie' ? (
                      <>
                        <Film className="w-3 h-3 text-amber-400" />
                        <span>Film</span>
                      </>
                    ) : detailMedia.media_type === 'anime' ? (
                      <>
                        <Flame className="w-3 h-3 text-fuchsia-400" />
                        <span>Anime</span>
                      </>
                    ) : detailMedia.media_type === 'kdrama' ? (
                      <>
                        <Heart className="w-3 h-3 text-rose-400 fill-rose-400/30" />
                        <span>K-Drama</span>
                      </>
                    ) : (
                      <>
                        <Tv className="w-3 h-3 text-cyan-400" />
                        <span>Series</span>
                      </>
                    )}
                  </span>
                </div>

                <h2 className="font-editorial text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  {detailMedia.title}
                </h2>
                
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  Directed by <strong className="text-white font-semibold">{detailMedia.director}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Modal Content Body */}
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Gut Reaction Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/[0.08] via-amber-500/[0.04] to-transparent border border-amber-500/30">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>One-Sentence Gut Reaction</span>
              </div>
              <p className="font-editorial text-lg sm:text-xl italic text-amber-100/95 leading-relaxed">
                "{detailMedia.gut_reaction}"
              </p>
            </div>

            {/* Analytical Full Review */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                Analytical Curation Notes & Full Review
              </h3>
              <div className="prose prose-invert max-w-none text-slate-200 text-sm sm:text-base leading-relaxed space-y-3 font-normal">
                <p>{detailMedia.full_review}</p>
              </div>
            </div>

            {/* Cast & Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/[0.08]">
              
              {/* Cast & Specs */}
              <div className="space-y-3">
                {detailMedia.cast && detailMedia.cast.length > 0 && (
                  <div>
                    <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium mb-1">
                      <Users className="w-3.5 h-3.5 text-amber-400" />
                      Key Cast:
                    </span>
                    <p className="text-xs text-slate-200 font-medium">
                      {detailMedia.cast.join(', ')}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Logged: {detailMedia.watched_date}
                  </span>
                  {detailMedia.runtime_minutes && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {detailMedia.runtime_minutes} mins
                    </span>
                  )}
                  {detailMedia.rewatch_count && detailMedia.rewatch_count > 1 && (
                    <span className="flex items-center gap-1 text-amber-400 font-medium">
                      <RotateCw className="w-3.5 h-3.5" />
                      Rewatch #{detailMedia.rewatch_count}
                    </span>
                  )}
                </div>
              </div>

              {/* Mood Matrix Coordinates & Tags */}
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium mb-1.5">
                    <Compass className="w-3.5 h-3.5 text-amber-400" />
                    Mood Matrix Coordinates:
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-slate-300">
                      X: {detailMedia.mood_coordinates.x > 0 ? `+${detailMedia.mood_coordinates.x} (Fun)` : `${detailMedia.mood_coordinates.x} (Cerebral)`}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-slate-300">
                      Y: {detailMedia.mood_coordinates.y > 0 ? `+${detailMedia.mood_coordinates.y} (Uplifting)` : `${detailMedia.mood_coordinates.y} (Dark)`}
                    </span>
                  </div>
                </div>

                {/* Custom Tags */}
                <div>
                  <div className="flex flex-wrap gap-1.5">
                    {detailMedia.custom_tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/25"
                      >
                        #{tag}
                      </span>
                    ))}
                    {detailMedia.genres.map((genre, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/[0.06] text-slate-300 border border-white/[0.08]"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

            </div>

          </div>
        </motion.div>

      </div>
    </AnimatePresence>
  );
};

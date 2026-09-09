'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Star, Film, Tv, Clock, Edit2, Trash2, Eye, Sparkles, MessageSquare, Flame, Heart } from 'lucide-react';
import { MediaLog } from '@/lib/types';
import { useCineStore } from '@/lib/store';
import { sound } from '@/lib/sound';

interface MovieCardProps {
  media: MediaLog;
  index: number;
}

export const MovieCard = ({ media, index }: MovieCardProps) => {
  const { 
    setActiveMedia, 
    setDetailMedia, 
    setEditingMedia, 
    deleteLog, 
    isAdmin 
  } = useCineStore();

  const [showGutReactionOnly, setShowGutReactionOnly] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Mouse coordinate physics for 3D perspective tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 350, damping: 25 });
  const mouseYSpring = useSpring(y, { stiffness: 350, damping: 25 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['9deg', '-9deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-9deg', '9deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);

    // CSS variables for specular sheen gradient
    cardRef.current.style.setProperty('--mouse-x', `${mouseX}px`);
    cardRef.current.style.setProperty('--mouse-y', `${mouseY}px`);
  };

  const handleMouseEnter = () => {
    setActiveMedia(media);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const toggleGutReaction = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playTactileClick(900);
    setShowGutReactionOnly(prev => !prev);
  };

  const openDetail = () => {
    sound.playTactileClick(600);
    setDetailMedia(media);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playTactileClick(750);
    setEditingMedia(media);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${media.title}" from your watch log?`)) {
      deleteLog(media.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      style={{ perspective: 1000 }}
      className="group relative select-none"
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={openDetail}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className="relative cursor-pointer rounded-2xl overflow-hidden glass-panel border border-white/[0.08] hover:border-amber-500/40 transition-shadow duration-500 shadow-2xl bg-[#0c0e14]/90 flex flex-col h-full"
      >
        {/* Specular Sheen Highlight Layer */}
        <div className="card-sheen" />

        {/* Poster Media Frame */}
        <div className="relative aspect-[2/3] w-full overflow-hidden bg-black/60">
          <Image
            src={media.poster_url || 'https://image.tmdb.org/t/p/w780/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg'}
            alt={media.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            priority={index < 4}
            unoptimized
          />
          
          {/* Subtle gradient vignette over poster */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e14] via-[#0c0e14]/20 to-transparent" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
            {/* Media Type & Year */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-medium text-slate-300">
              {media.media_type === 'movie' ? (
                <Film className="w-3 h-3 text-amber-400" />
              ) : media.media_type === 'anime' ? (
                <Flame className="w-3 h-3 text-fuchsia-400" />
              ) : media.media_type === 'kdrama' ? (
                <Heart className="w-3 h-3 text-rose-400 fill-rose-400/30" />
              ) : (
                <Tv className="w-3 h-3 text-cyan-400" />
              )}
              <span>{media.release_year}</span>
            </div>

            {/* Rating Score */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 backdrop-blur-md border border-amber-500/40 text-amber-300 font-bold text-xs shadow-lg shadow-amber-500/10">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{media.personal_rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Admin Edit / Delete Floating Controls */}
          {isAdmin && (
            <div className="absolute top-12 right-3 flex flex-col gap-1.5 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={handleEdit}
                title="Edit entry"
                className="p-2 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-slate-200 hover:text-amber-400 hover:border-amber-400 transition-colors shadow-lg"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleDelete}
                title="Delete entry"
                className="p-2 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-slate-200 hover:text-rose-400 hover:border-rose-400 transition-colors shadow-lg"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Gut Reaction Quick Overlay Button */}
          <div className="absolute bottom-3 left-3 right-3 z-10">
            <button
              onClick={toggleGutReaction}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 hover:border-amber-500/50 text-xs text-slate-300 hover:text-amber-300 transition-all shadow-md group/btn"
            >
              <span className="flex items-center gap-1.5 font-medium">
                <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                {showGutReactionOnly ? 'Hide Gut Reaction' : 'Quick Gut Reaction'}
              </span>
              <span className="text-[10px] text-slate-400 group-hover/btn:text-amber-200">
                {showGutReactionOnly ? '▲' : '▼'}
              </span>
            </button>
          </div>
        </div>

        {/* Card Body & Metadata */}
        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
          <div>
            <h3 className="font-editorial text-lg font-bold text-white tracking-tight leading-snug line-clamp-1 group-hover:text-amber-300 transition-colors">
              {media.title}
            </h3>
            
            <div className="flex items-center justify-between mt-1 text-xs text-slate-400">
              <span className="truncate pr-2 font-medium text-slate-300">
                Dir. {media.director}
              </span>
              {media.runtime_minutes && (
                <span className="flex items-center gap-1 shrink-0 text-slate-400">
                  <Clock className="w-3 h-3" />
                  {media.runtime_minutes}m
                </span>
              )}
            </div>
          </div>

          {/* Gut Reaction vs Analytical Excerpt */}
          <div className="relative overflow-hidden rounded-lg bg-white/[0.03] border border-white/[0.05] p-3 text-xs min-h-[64px] flex items-center">
            {showGutReactionOnly ? (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-editorial italic text-amber-200/90 leading-relaxed"
              >
                "{media.gut_reaction}"
              </motion.div>
            ) : (
              <p className="text-slate-300 line-clamp-2 leading-relaxed">
                {media.full_review}
              </p>
            )}
          </div>

          {/* Tag Pills */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {media.custom_tags.slice(0, 2).map((tag, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/[0.06] text-slate-300 border border-white/[0.08]"
              >
                #{tag}
              </span>
            ))}
            {media.genres.slice(0, 1).map((genre, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-300/90 border border-amber-500/20"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

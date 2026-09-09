'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Sparkles, 
  Star, 
  Calendar, 
  Clock, 
  Compass, 
  Loader2, 
  Tag, 
  Edit3,
  Upload,
  Image as ImageIcon,
  Link2,
  Layers,
  RotateCcw,
  Trash2
} from 'lucide-react';
import { useCineStore } from '@/lib/store';
import { MediaType } from '@/lib/types';
import { sound } from '@/lib/sound';

export const EditMediaModal = () => {
  const { editingMedia, setEditingMedia, updateLog, deleteLog } = useCineStore();

  const [title, setTitle] = useState('');
  const [mediaType, setMediaType] = useState<MediaType>('movie');
  const [releaseYear, setReleaseYear] = useState<number>(2024);
  const [runtimeMinutes, setRuntimeMinutes] = useState<number>(120);
  const [director, setDirector] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [backdropUrl, setBackdropUrl] = useState('');
  const [posterMode, setPosterMode] = useState<'url' | 'upload'>('url');
  const [isDraggingPoster, setIsDraggingPoster] = useState(false);
  const posterFileInputRef = useRef<HTMLInputElement>(null);
  const backdropFileInputRef = useRef<HTMLInputElement>(null);
  const [watchedDate, setWatchedDate] = useState<string>('');
  const [personalRating, setPersonalRating] = useState<number>(9.0);
  const [gutReaction, setGutReaction] = useState('');
  const [fullReview, setFullReview] = useState('');
  const [moodCoordinates, setMoodCoordinates] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const matrixPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editingMedia) {
      setTitle(editingMedia.title);
      setMediaType(editingMedia.media_type);
      setReleaseYear(editingMedia.release_year);
      setRuntimeMinutes(editingMedia.runtime_minutes || 120);
      setDirector(editingMedia.director);
      setPosterUrl(editingMedia.poster_url || '');
      setBackdropUrl(editingMedia.backdrop_url || '');
      setWatchedDate(editingMedia.watched_date);
      setPersonalRating(editingMedia.personal_rating);
      setGutReaction(editingMedia.gut_reaction);
      setFullReview(editingMedia.full_review);
      setMoodCoordinates(editingMedia.mood_coordinates);
      setCustomTags(editingMedia.custom_tags);
    }
  }, [editingMedia]);

  const handlePosterFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WEBP, AVIF, GIF).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        sound.playTactileClick(900);
        setPosterUrl(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBackdropFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WEBP, AVIF, GIF).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        sound.playTactileClick(900);
        setBackdropUrl(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePosterDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingPoster(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePosterFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleMatrixClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!matrixPickerRef.current) return;
    const rect = matrixPickerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const xCoord = Math.round((clickX / rect.width) * 200 - 100);
    const yCoord = Math.round(100 - (clickY / rect.height) * 200);

    sound.playTactileClick(900);
    setMoodCoordinates({
      x: Math.max(-100, Math.min(100, xCoord)),
      y: Math.max(-100, Math.min(100, yCoord))
    });
  };

  const handleAddTag = (tag: string) => {
    if (!tag.trim() || customTags.includes(tag.trim())) return;
    setCustomTags([...customTags, tag.trim()]);
    setNewTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    setCustomTags(customTags.filter(t => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMedia) return;

    setIsSubmitting(true);
    sound.playTactileClick(1000);

    try {
      await updateLog(editingMedia.id, {
        title,
        media_type: mediaType,
        release_year: releaseYear,
        runtime_minutes: runtimeMinutes,
        director,
        poster_url: posterUrl || editingMedia.poster_url,
        backdrop_url: backdropUrl || editingMedia.backdrop_url,
        watched_date: watchedDate,
        personal_rating: Number(personalRating),
        gut_reaction: gutReaction,
        full_review: fullReview,
        mood_coordinates: moodCoordinates,
        custom_tags: customTags
      });

      setEditingMedia(null);
    } catch (err) {
      console.error('Failed to update entry', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!editingMedia) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-lg overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setEditingMedia(null)}
          className="fixed inset-0"
        />

        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 20 }}
          className="relative z-10 w-full max-w-3xl glass-panel rounded-3xl border border-white/10 shadow-2xl overflow-hidden bg-[#0c0e14] my-8 p-6 sm:p-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Edit3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-editorial text-xl font-bold text-white">Edit Curation Log</h3>
                <p className="text-xs text-slate-400">Update rating, gut reaction, review, or mood matrix placement</p>
              </div>
            </div>
            <button
              onClick={() => setEditingMedia(null)}
              className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {/* Title, Year, Type */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-slate-300">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300">Media Type</label>
                <select
                  value={mediaType}
                  onChange={e => setMediaType(e.target.value as MediaType)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-[#12151f] border border-white/10 text-sm text-white focus:border-amber-400 focus:outline-none cursor-pointer"
                >
                  <option value="movie">Movie</option>
                  <option value="tv">TV Series</option>
                  <option value="anime">Anime</option>
                  <option value="kdrama">K-Drama</option>
                </select>
              </div>
            </div>

            {/* Director, Rating, Date */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-300">Director</label>
                <input
                  type="text"
                  value={director}
                  onChange={e => setDirector(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                  <span>Rating</span>
                  <span className="text-amber-400 font-bold">{personalRating.toFixed(1)}</span>
                </label>
                <input
                  type="range"
                  min="1.0"
                  max="10.0"
                  step="0.1"
                  value={personalRating}
                  onChange={e => setPersonalRating(parseFloat(e.target.value))}
                  className="w-full mt-2.5 accent-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300">Watch Date</label>
                <input
                  type="date"
                  value={watchedDate}
                  onChange={e => setWatchedDate(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-[#12151f] border border-white/10 text-sm text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Custom Poster & Artwork Studio Section */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span>Custom Poster & Visual Artwork Studio</span>
                </label>
                <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-white/10 text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playTactileClick(800);
                      setPosterMode('url');
                    }}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      posterMode === 'url' ? 'bg-amber-500 text-black font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Image URL
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playTactileClick(800);
                      setPosterMode('upload');
                    }}
                    className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                      posterMode === 'upload' ? 'bg-amber-500 text-black font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Upload className="w-3 h-3" />
                    Upload File
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-start">
                {/* Visual Poster Preview */}
                <div className="sm:col-span-1 flex flex-col items-center">
                  <div className="relative aspect-[2/3] w-24 rounded-xl overflow-hidden bg-black/60 border border-white/20 shadow-lg group">
                    {posterUrl ? (
                      <Image
                        src={posterUrl}
                        alt="Poster Preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center text-slate-500 text-[10px]">
                        <ImageIcon className="w-5 h-5 mb-1 text-slate-600" />
                        <span>No Poster</span>
                      </div>
                    )}
                    {posterUrl && (
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => setPosterUrl('')}
                          className="px-2 py-1 rounded bg-rose-500/80 text-white text-[10px] font-bold"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1">Poster Preview</span>
                </div>

                {/* Input & Upload Controls */}
                <div className="sm:col-span-3 space-y-3">
                  {posterMode === 'url' ? (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-medium text-slate-400">Direct Poster URL:</span>
                        {editingMedia && (
                          <button
                            type="button"
                            onClick={() => setPosterUrl(editingMedia.poster_url)}
                            className="text-amber-400 hover:underline text-[10px] flex items-center gap-1"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                            Reset
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type="url"
                          value={posterUrl}
                          onChange={e => setPosterUrl(e.target.value)}
                          placeholder="https://example.com/custom-poster.jpg"
                          className="w-full px-3 py-2 pl-8 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:border-amber-400 focus:outline-none placeholder-slate-500"
                        />
                        <Link2 className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        ref={posterFileInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={e => {
                          if (e.target.files?.[0]) handlePosterFileUpload(e.target.files[0]);
                        }}
                      />
                      <div
                        onDragOver={e => {
                          e.preventDefault();
                          setIsDraggingPoster(true);
                        }}
                        onDragLeave={() => setIsDraggingPoster(false)}
                        onDrop={handlePosterDrop}
                        onClick={() => posterFileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                          isDraggingPoster
                            ? 'border-amber-400 bg-amber-500/10'
                            : 'border-white/15 hover:border-amber-500/50 bg-white/[0.02]'
                        }`}
                      >
                        <Upload className="w-5 h-5 mx-auto mb-1 text-amber-400" />
                        <p className="text-xs text-slate-200 font-medium">
                          Click to browse image or drag & drop here
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          PNG, JPG, WEBP, AVIF (Loaded directly into your vault)
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Backdrop URL row */}
                  <div className="pt-2 border-t border-white/[0.06]">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                        <Layers className="w-3 h-3 text-slate-400" />
                        <span>Hero Backdrop Image:</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => backdropFileInputRef.current?.click()}
                        className="text-amber-400 hover:underline text-[10px] flex items-center gap-1"
                      >
                        <Upload className="w-2.5 h-2.5" />
                        Upload Backdrop
                      </button>
                    </div>
                    <input
                      type="file"
                      ref={backdropFileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        if (e.target.files?.[0]) handleBackdropFileUpload(e.target.files[0]);
                      }}
                    />
                    <input
                      type="url"
                      value={backdropUrl}
                      onChange={e => setBackdropUrl(e.target.value)}
                      placeholder="https://image.tmdb.org/... or upload local backdrop"
                      className="w-full px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:border-amber-400 focus:outline-none placeholder-slate-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Gut Reaction */}
            <div>
              <label className="text-xs font-medium text-amber-400 flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>One-Sentence Gut Reaction:</span>
              </label>
              <input
                type="text"
                required
                value={gutReaction}
                onChange={e => setGutReaction(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-amber-100 font-editorial italic focus:border-amber-400 focus:outline-none"
              />
            </div>

            {/* Review */}
            <div>
              <label className="text-xs font-medium text-slate-300 mb-1 block">
                Analytical Curation Review:
              </label>
              <textarea
                required
                rows={3}
                value={fullReview}
                onChange={e => setFullReview(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-slate-200 focus:border-amber-400 focus:outline-none"
              />
            </div>

            {/* Mood Matrix Picker */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-amber-400" />
                  <span>Mood Matrix Coordinates (Click to reposition):</span>
                </label>
                <span className="text-xs text-amber-400 font-mono font-bold">
                  X: {moodCoordinates.x} | Y: {moodCoordinates.y}
                </span>
              </div>

              <div
                ref={matrixPickerRef}
                onClick={handleMatrixClick}
                className="relative w-full h-32 rounded-xl bg-[#090b10] border border-white/10 cursor-crosshair overflow-hidden select-none"
              >
                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/20" />
                <div className="absolute left-0 right-0 top-1/2 h-px bg-white/20" />

                <div
                  style={{
                    left: `${((moodCoordinates.x + 100) / 200) * 100}%`,
                    top: `${((100 - moodCoordinates.y) / 200) * 100}%`,
                  }}
                  className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400 ring-4 ring-amber-400/40 shadow-lg pointer-events-none"
                />
              </div>
            </div>

            {/* Custom Tags */}
            <div>
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5 mb-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                <span>Custom Tags:</span>
              </label>
              
              <div className="flex flex-wrap gap-1.5 mb-2">
                {customTags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-rose-400"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={e => setNewTagInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag(newTagInput);
                    }
                  }}
                  placeholder="Add custom tag..."
                  className="flex-1 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleAddTag(newTagInput)}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-xs font-semibold text-slate-200"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Submit & Delete Actions */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Are you sure you want to permanently delete "${editingMedia.title}"?`)) {
                    sound.playTactileClick(500);
                    deleteLog(editingMedia.id);
                  }
                }}
                className="px-3.5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 text-xs font-semibold border border-rose-500/30 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Entry</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingMedia(null)}
                  className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/25 flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

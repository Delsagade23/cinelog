'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Search, 
  Film, 
  Tv, 
  Sparkles, 
  Star, 
  Calendar, 
  Clock, 
  Compass, 
  Check, 
  Plus, 
  Loader2,
  Tag,
  Upload,
  Image as ImageIcon,
  Link2,
  RotateCcw,
  FileImage,
  Layers
} from 'lucide-react';
import { useCineStore } from '@/lib/store';
import { TMDbSearchResult, TMDbDetails, MediaType } from '@/lib/types';
import { sound } from '@/lib/sound';

export const AddMediaModal = () => {
  const { addModalOpen, setAddModalOpen, addLog } = useCineStore();

  // TMDb Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TMDbSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState<TMDbDetails | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [mediaType, setMediaType] = useState<MediaType>('movie');
  const [releaseYear, setReleaseYear] = useState<number>(new Date().getFullYear());
  const [runtimeMinutes, setRuntimeMinutes] = useState<number>(120);
  const [posterUrl, setPosterUrl] = useState('');
  const [backdropUrl, setBackdropUrl] = useState('');
  const [posterMode, setPosterMode] = useState<'url' | 'upload'>('url');
  const [isDraggingPoster, setIsDraggingPoster] = useState(false);
  const posterFileInputRef = useRef<HTMLInputElement>(null);
  const backdropFileInputRef = useRef<HTMLInputElement>(null);
  const [director, setDirector] = useState('');
  const [cast, setCast] = useState<string[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [watchedDate, setWatchedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [personalRating, setPersonalRating] = useState<number>(9.0);
  const [gutReaction, setGutReaction] = useState('');
  const [fullReview, setFullReview] = useState('');
  const [moodCoordinates, setMoodCoordinates] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [customTags, setCustomTags] = useState<string[]>(['Mind-Melting']);
  const [newTagInput, setNewTagInput] = useState('');
  const [dominantColor, setDominantColor] = useState('#eab308');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const matrixPickerRef = useRef<HTMLDivElement>(null);

  // Debounced TMDb Search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results || []);
        }
      } catch (err) {
        console.error('TMDb search error', err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle selecting a TMDb search result
  const handleSelectResult = async (item: TMDbSearchResult) => {
    sound.playTactileClick(800);
    setIsSearching(true);
    try {
      const type = item.media_type === 'tv' ? 'tv' : 'movie';
      const res = await fetch(`/api/tmdb/details?id=${item.id}&type=${type}`);
      if (res.ok) {
        const data = await res.json();
        const details: TMDbDetails = data.details;
        setSelectedDetails(details);

        // Autofill form
        setTitle(details.title);
        setMediaType(details.media_type);
        setReleaseYear(details.release_year);
        setRuntimeMinutes(details.runtime_minutes);
        setPosterUrl(details.poster_url);
        setBackdropUrl(details.backdrop_url);
        setDirector(details.director);
        setCast(details.cast);
        setGenres(details.genres);

        // Auto guess a dominant accent color based on genres
        if (details.genres.includes('Science Fiction')) setDominantColor('#06b6d4');
        else if (details.genres.includes('Drama')) setDominantColor('#f59e0b');
        else if (details.genres.includes('Animation')) setDominantColor('#ec4899');
        else if (details.genres.includes('Action')) setDominantColor('#f43f5e');
      }
    } catch (err) {
      console.error('Failed to fetch TMDb details', err);
    } finally {
      setIsSearching(false);
      setSearchResults([]);
    }
  };

  // Interactive 2D Mood Matrix Coordinate Picker
  const handleMatrixClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!matrixPickerRef.current) return;
    const rect = matrixPickerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert pixels to -100..+100 coordinates
    const xCoord = Math.round((clickX / rect.width) * 200 - 100);
    const yCoord = Math.round(100 - (clickY / rect.height) * 200);

    sound.playTactileClick(900);
    setMoodCoordinates({
      x: Math.max(-100, Math.min(100, xCoord)),
      y: Math.max(-100, Math.min(100, yCoord))
    });
  };

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
    if (!title.trim() || !gutReaction.trim() || !fullReview.trim()) {
      alert('Please fill out the title, gut reaction, and full review.');
      return;
    }

    setIsSubmitting(true);
    sound.playTactileClick(1000);

    try {
      await addLog({
        tmdb_id: selectedDetails?.id || Math.floor(Math.random() * 900000) + 100000,
        title,
        media_type: mediaType,
        release_year: releaseYear,
        runtime_minutes: runtimeMinutes,
        poster_url: posterUrl || 'https://image.tmdb.org/t/p/w780/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
        backdrop_url: backdropUrl || 'https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5200fr.jpg',
        director: director || 'Unknown Director',
        cast,
        genres: genres.length > 0 ? genres : ['Cinema'],
        watched_date: watchedDate,
        personal_rating: Number(personalRating),
        gut_reaction: gutReaction,
        full_review: fullReview,
        mood_coordinates: moodCoordinates,
        custom_tags: customTags,
        dominant_color: dominantColor,
        rewatch_count: 1
      });

      setAddModalOpen(false);
      // Reset form
      setTitle('');
      setGutReaction('');
      setFullReview('');
      setSelectedDetails(null);
    } catch (err) {
      console.error('Failed to submit entry', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!addModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-lg overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setAddModalOpen(false)}
          className="fixed inset-0"
        />

        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 20 }}
          className="relative z-10 w-full max-w-3xl glass-panel rounded-3xl border border-amber-500/40 shadow-2xl overflow-hidden bg-[#0c0e14] my-8 p-6 sm:p-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500 text-black">
                <Plus className="w-4 h-4 stroke-[3]" />
              </div>
              <div>
                <h3 className="font-editorial text-xl font-bold text-white">Add Watch Log Entry</h3>
                <p className="text-xs text-slate-400">Search TMDb to auto-populate metadata or enter manually</p>
              </div>
            </div>
            <button
              onClick={() => setAddModalOpen(false)}
              className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* TMDb Live Search Bar */}
          <div className="relative mt-4">
            <label className="text-xs font-semibold text-amber-400 flex items-center gap-1.5 mb-1.5">
              <Search className="w-3.5 h-3.5" />
              <span>TMDb Autocomplete Search:</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Type movie or TV title (e.g., Dune, Oppenheimer, Severance)..."
                className="w-full px-4 py-2.5 pl-10 rounded-xl bg-white/[0.04] border border-white/10 focus:border-amber-400 focus:outline-none text-sm text-white placeholder-slate-500"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              {isSearching && (
                <Loader2 className="w-4 h-4 text-amber-400 animate-spin absolute right-3.5 top-3" />
              )}
            </div>

            {/* Dropdown Results */}
            {searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 z-30 max-h-64 overflow-y-auto rounded-2xl bg-[#12151f] border border-white/10 shadow-2xl p-2 space-y-1">
                {searchResults.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectResult(item)}
                    className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-amber-500/10 text-left transition-colors group"
                  >
                    <div className="relative w-10 h-14 rounded-lg overflow-hidden bg-black/60 shrink-0">
                      {item.poster_path ? (
                        <Image
                          src={`https://image.tmdb.org/t/p/w185${item.poster_path}`}
                          alt={item.title || item.name || ''}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <Film className="w-5 h-5 m-auto text-slate-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
                        <span>{item.media_type === 'anime' ? 'Anime' : item.media_type === 'kdrama' ? 'K-Drama' : item.media_type === 'tv' ? 'TV Series' : 'Movie'}</span>
                        <span>•</span>
                        <span>{item.release_date || item.first_air_date || 'Unknown'}</span>
                      </div>
                      <h5 className="font-editorial text-sm font-bold text-white truncate group-hover:text-amber-300">
                        {item.title || item.name}
                      </h5>
                      <p className="text-xs text-slate-400 truncate">{item.overview}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {/* Title, Year, Type Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-slate-300">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white focus:border-amber-400 focus:outline-none"
                  placeholder="Movie or series title"
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

            {/* Director, Rating, Date Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-300">Director / Creator</label>
                <input
                  type="text"
                  value={director}
                  onChange={e => setDirector(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white focus:border-amber-400 focus:outline-none"
                  placeholder="e.g. Denis Villeneuve"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                  <span>Rating (0-10)</span>
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
                        <span>No Poster Selected</span>
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
                        <span className="text-[11px] font-medium text-slate-400">Direct Poster URL (Letterboxd, Imgur, Unsplash, etc.):</span>
                        {selectedDetails && (
                          <button
                            type="button"
                            onClick={() => setPosterUrl(selectedDetails.poster_url)}
                            className="text-amber-400 hover:underline text-[10px] flex items-center gap-1"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                            Reset TMDb Poster
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
                        <span>Hero Backdrop Image (Optional):</span>
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
                <span>One-Sentence Gut Reaction (Punchy Take):</span>
              </label>
              <input
                type="text"
                required
                value={gutReaction}
                onChange={e => setGutReaction(e.target.value)}
                placeholder="e.g., A cathedral of monolithic sound and sand that made my teeth vibrate..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-amber-100 font-editorial italic focus:border-amber-400 focus:outline-none"
              />
            </div>

            {/* Analytical Full Review */}
            <div>
              <label className="text-xs font-medium text-slate-300 mb-1 block">
                Analytical Curation Review:
              </label>
              <textarea
                required
                rows={3}
                value={fullReview}
                onChange={e => setFullReview(e.target.value)}
                placeholder="Write your in-depth editorial review and observations..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-slate-200 focus:border-amber-400 focus:outline-none"
              />
            </div>

            {/* Interactive Mood Coordinates Picker */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-amber-400" />
                  <span>Interactive Mood Matrix Placement (Click to plot):</span>
                </label>
                <span className="text-xs text-amber-400 font-mono font-bold">
                  X: {moodCoordinates.x > 0 ? `+${moodCoordinates.x}` : moodCoordinates.x} | Y: {moodCoordinates.y > 0 ? `+${moodCoordinates.y}` : moodCoordinates.y}
                </span>
              </div>

              <div
                ref={matrixPickerRef}
                onClick={handleMatrixClick}
                className="relative w-full h-32 rounded-xl bg-[#090b10] border border-white/10 cursor-crosshair overflow-hidden select-none"
              >
                {/* Axes */}
                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/20" />
                <div className="absolute left-0 right-0 top-1/2 h-px bg-white/20" />

                {/* Axis indicators */}
                <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[9px] text-emerald-400 uppercase font-semibold">▲ Uplifting</span>
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] text-rose-400 uppercase font-semibold">▼ Bleak</span>
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] text-indigo-400 uppercase font-semibold">◀ Cerebral</span>
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-amber-400 uppercase font-semibold">▶ Fun</span>

                {/* Plotted Target Point */}
                <div
                  style={{
                    left: `${((moodCoordinates.x + 100) / 200) * 100}%`,
                    top: `${((100 - moodCoordinates.y) / 200) * 100}%`,
                  }}
                  className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400 ring-4 ring-amber-400/40 shadow-lg pointer-events-none transition-all duration-150"
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

              {/* Tag Input & Quick Suggestions */}
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
                  placeholder="Add custom tag (press enter)..."
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

            {/* Submit Action */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/25 active:scale-95 flex items-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Save to Archive</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

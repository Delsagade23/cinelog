'use client';

import React, { useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Key, 
  ArrowLeft, 
  Check, 
  Plus, 
  Sparkles,
  AlertCircle,
  Image as ImageIcon,
  Upload,
  Link2,
  Film,
  Tv,
  Search,
  Layers,
  Edit2,
  Trash2,
  CheckCircle2,
  SlidersHorizontal,
  X,
  RefreshCw,
  Flame,
  Heart
} from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { useCineStore } from '@/lib/store';
import { MediaLog, MediaType } from '@/lib/types';
import { sound } from '@/lib/sound';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export default function AdminPage() {
  const router = useRouter();
  const { 
    mediaLogs, 
    updateLog, 
    deleteLog, 
    resetToSeed,
    isAdmin, 
    setIsAdmin, 
    setAddModalOpen,
    setEditingMedia
  } = useCineStore();

  // Auth form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Poster Studio Management State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMediaType, setSelectedMediaType] = useState<'all' | 'movie' | 'tv' | 'anime' | 'kdrama'>('all');
  const [selectedMovieForPoster, setSelectedMovieForPoster] = useState<MediaLog | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  
  // Custom Poster Editor Modal State
  const [customPosterUrl, setCustomPosterUrl] = useState('');
  const [customBackdropUrl, setCustomBackdropUrl] = useState('');
  const [posterInputMode, setPosterInputMode] = useState<'url' | 'upload'>('url');
  const [isDraggingPoster, setIsDraggingPoster] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);
  const [isSavingPoster, setIsSavingPoster] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const backdropFileInputRef = useRef<HTMLInputElement>(null);

  // Filtered movies list in admin
  const filteredMedia = useMemo(() => {
    return mediaLogs.filter(item => {
      if (selectedMediaType !== 'all' && item.media_type !== selectedMediaType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDirector = item.director.toLowerCase().includes(q);
        const matchesTags = item.custom_tags.some(t => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDirector && !matchesTags) return false;
      }
      return true;
    });
  }, [mediaLogs, searchQuery, selectedMediaType]);

  const ADMIN_EMAIL = 'chandrasekharmadhabdas2006@gmail.com';
  const ADMIN_PASSWORD = 'Monolith@123';

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedEmail = email.trim().toLowerCase();
    if (trimmedEmail !== ADMIN_EMAIL.toLowerCase() || password !== ADMIN_PASSWORD) {
      sound.playTactileClick(400);
      setErrorMessage('Invalid admin credentials. Access restricted to authorized administrator.');
      return;
    }

    setIsLoggingIn(true);
    sound.playTactileClick(1000);
    setIsAdmin(true);

    // Optional background Supabase session sync
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD
        });
        if (error) {
          // If the account doesn't exist yet in Supabase auth, attempt signup
          await supabase.auth.signUp({
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
          }).catch(() => {});
        }
      } catch {
        // Silently catch to avoid blocking authorized admin session
      }
    }

    setIsLoggingIn(false);
  };

  const handleLogout = () => {
    sound.playTactileClick(500);
    if (supabase) {
      supabase.auth.signOut().catch(() => {});
    }
    setIsAdmin(false);
    setSelectedMovieForPoster(null);
  };

  // Open poster customizer for a specific movie
  const handleOpenPosterStudio = (movie: MediaLog) => {
    sound.playTactileClick(750);
    setSelectedMovieForPoster(movie);
    setCustomPosterUrl(movie.poster_url || '');
    setCustomBackdropUrl(movie.backdrop_url || '');
    setSaveSuccessMsg(false);
  };

  // Handle local image file upload via FileReader
  const handlePosterFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WEBP, AVIF, GIF).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        sound.playTactileClick(950);
        setCustomPosterUrl(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBackdropFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WEBP, AVIF, GIF).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        sound.playTactileClick(950);
        setCustomBackdropUrl(e.target.result as string);
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

  // Save updated custom poster
  const handleSaveCustomPoster = async () => {
    if (!selectedMovieForPoster) return;
    setIsSavingPoster(true);
    sound.playTactileClick(1000);

    try {
      await updateLog(selectedMovieForPoster.id, {
        poster_url: customPosterUrl || selectedMovieForPoster.poster_url,
        backdrop_url: customBackdropUrl || selectedMovieForPoster.backdrop_url
      });

      setSaveSuccessMsg(true);
      setTimeout(() => {
        setSaveSuccessMsg(false);
        setSelectedMovieForPoster(null);
      }, 1200);
    } catch (err) {
      console.error('Failed to update poster:', err);
    } finally {
      setIsSavingPoster(false);
    }
  };

  // Delete a movie
  const handleDeleteMovie = async (id: string, title: string) => {
    sound.playTactileClick(500);
    await deleteLog(id);
    setConfirmDeleteId(null);
    if (selectedMovieForPoster?.id === id) {
      setSelectedMovieForPoster(null);
    }
  };

  const handleRestoreDefaults = () => {
    if (confirm('Are you sure you want to restore the default movie vault? This will reload the curated seed archive.')) {
      sound.playTactileClick(850);
      resetToSeed();
    }
  };


  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Cinema Feed</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              isAdmin
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-white/[0.05] text-slate-400 border border-white/10'
            }`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isAdmin ? 'Curator Mode Active' : 'Read-Only Mode'}</span>
            </span>

            {isAdmin && (
              <button
                onClick={handleLogout}
                className="px-3 py-1 rounded-full bg-white/[0.04] hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 text-xs font-medium border border-white/[0.08] transition-colors"
              >
                Log Out
              </button>
            )}
          </div>
        </div>

        {/* Top Header Card */}
        <section className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#0e111a]/95 via-[#0c0e14]/90 to-[#07080a]/95 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Curation & Custom Poster Studio</span>
            </div>
            
            <h1 className="font-editorial text-3xl sm:text-4xl font-extrabold text-white">
              Admin Section & Movie Management
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Upload custom movie posters, paste alternative artwork links, edit entries, or delete titles from your archive with full administrative control.
            </p>
          </div>

          {/* Quick Actions Row */}
          <div className="flex flex-wrap items-center gap-3 pt-5">
            {isAdmin ? (
              <>
                <button
                  onClick={() => setAddModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/25 active:scale-95"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Add New Title with Custom Poster</span>
                </button>

                <button
                  onClick={handleRestoreDefaults}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-white font-medium text-xs transition-all"
                  title="Reset vault to default seed movies"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Restore Default Seed Vault</span>
                </button>
              </>
            ) : (
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-medium text-slate-400">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Sign in below with authorized admin credentials</span>
              </div>
            )}
          </div>
        </section>

        {/* Main Admin Content: Custom Poster Studio & Management Grid */}
        {isAdmin ? (
          <section className="space-y-6">
            
            {/* Toolbar Header */}
            <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-white/[0.08] bg-[#0c0e14]/95 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-editorial text-xl font-bold text-white">
                      Archive Management & Custom Posters
                    </h2>
                    <p className="text-xs text-slate-400">
                      Customize posters, edit metadata, or delete titles from your archive
                    </p>
                  </div>
                </div>

                <div className="text-xs text-slate-400 font-medium">
                  <strong>{filteredMedia.length}</strong> of <strong>{mediaLogs.length}</strong> titles
                </div>
              </div>

              {/* Search & Media Type Filter */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center pt-2">
                <div className="md:col-span-6 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search titles or directors to customize or delete..."
                    className="w-full px-4 py-2 pl-10 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:border-amber-400 focus:outline-none placeholder-slate-500"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-3" />
                </div>

                <div className="md:col-span-6 flex items-center p-1 rounded-xl bg-white/[0.03] border border-white/10 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'all', label: 'All', icon: SlidersHorizontal },
                    { id: 'movie', label: 'Movies', icon: Film },
                    { id: 'tv', label: 'Series', icon: Tv },
                    { id: 'anime', label: 'Anime', icon: Flame },
                    { id: 'kdrama', label: 'K-Drama', icon: Heart },
                  ].map(t => {
                    const Icon = t.icon;
                    const active = selectedMediaType === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          sound.playTactileClick(800);
                          setSelectedMediaType(t.id as any);
                        }}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                          active
                            ? 'bg-amber-500 text-black shadow-md'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Icon className="w-3 h-3 shrink-0" />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Movie Poster Cards Grid */}
            {filteredMedia.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredMedia.map(item => {
                  const isDataUrl = item.poster_url?.startsWith('data:');
                  const isConfirmingDelete = confirmDeleteId === item.id;

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleOpenPosterStudio(item)}
                      className={`group relative cursor-pointer glass-panel p-3 rounded-2xl border transition-all duration-300 bg-[#0c0e14]/90 flex flex-col justify-between ${
                        isConfirmingDelete
                          ? 'border-rose-500/80 bg-rose-950/20'
                          : 'border-white/[0.08] hover:border-amber-500/50 hover:scale-[1.02]'
                      }`}
                    >
                      <div>
                        {/* Poster Image Frame */}
                        <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-black/60 border border-white/10 shadow-md mb-2.5">
                          <Image
                            src={item.poster_url || 'https://image.tmdb.org/t/p/w780/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg'}
                            alt={item.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            unoptimized
                          />

                          {/* Custom Poster Indicator Badge */}
                          {isDataUrl && (
                            <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-amber-500/90 text-black font-bold text-[9px] shadow">
                              Custom Upload
                            </div>
                          )}

                          {/* Top-Right Direct Delete Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              sound.playTactileClick(600);
                              setConfirmDeleteId(isConfirmingDelete ? null : item.id);
                            }}
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/80 hover:bg-rose-600 text-slate-300 hover:text-white border border-white/20 transition-all shadow-md z-20"
                            title="Delete this movie"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Hover Overlay Button */}
                          {!isConfirmingDelete && (
                            <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2 text-center pointer-events-none">
                              <Upload className="w-5 h-5 text-amber-400" />
                              <span className="text-[11px] font-bold text-white">Change Poster</span>
                              <span className="text-[9px] text-slate-300">Click to customize</span>
                            </div>
                          )}

                          {/* Inline Delete Confirmation Overlay */}
                          {isConfirmingDelete && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute inset-0 bg-black/95 p-3 flex flex-col items-center justify-center text-center gap-2 z-30 animate-fadeIn"
                            >
                              <Trash2 className="w-6 h-6 text-rose-400 animate-pulse" />
                              <span className="text-[11px] font-bold text-rose-200">Delete title?</span>
                              <div className="flex gap-1.5 w-full mt-1">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteMovie(item.id, item.title);
                                  }}
                                  className="flex-1 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] shadow"
                                >
                                  Yes, Delete
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirmDeleteId(null);
                                  }}
                                  className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 text-[10px]"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Title & Metadata */}
                        <h4 className="font-editorial text-xs font-bold text-white line-clamp-1 group-hover:text-amber-300 transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                          {item.release_year} • Dir. {item.director}
                        </p>
                      </div>

                      {/* Quick Edit & Delete Action Bar */}
                      <div className="mt-3 pt-2 border-t border-white/[0.06] flex items-center justify-between gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            sound.playTactileClick(700);
                            setEditingMedia(item);
                          }}
                          className="text-[10px] text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenPosterStudio(item);
                            }}
                            className="px-2 py-0.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[10px] font-semibold border border-amber-500/30"
                          >
                            Poster
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDeleteId(isConfirmingDelete ? null : item.id);
                            }}
                            className="p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 rounded-3xl glass-panel border border-white/[0.08] space-y-4">
                <Film className="w-10 h-10 mx-auto text-slate-600" />
                <div className="space-y-1">
                  <h3 className="font-editorial text-lg font-bold text-slate-300">
                    {mediaLogs.length === 0 ? 'Your media archive is currently empty' : 'No matching titles found'}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {mediaLogs.length === 0 
                      ? 'You can add fresh titles with custom posters or restore the default sample archive.'
                      : 'Try adjusting your search query or media filter.'}
                  </p>
                </div>
                {mediaLogs.length === 0 && (
                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      onClick={() => setAddModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition-all shadow"
                    >
                      + Add New Title
                    </button>
                    <button
                      onClick={handleRestoreDefaults}
                      className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-slate-300 text-xs font-semibold transition-all"
                    >
                      Restore Sample Movies
                    </button>
                  </div>
                )}
              </div>
            )}

          </section>
        ) : (
          /* Authentication Section for Non-authenticated users */
          <div className="max-w-md mx-auto w-full">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/[0.08] bg-[#0c0e14]/95 space-y-6 shadow-2xl">
              <div className="space-y-1 text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold uppercase tracking-wider">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Admin Authentication</span>
                </div>
                <h2 className="font-editorial text-2xl font-bold text-white">
                  Curator Access
                </h2>
                <p className="text-xs text-slate-400">
                  Enter authorized administrator credentials to access the custom poster studio and archive management.
                </p>
              </div>

              <div className="space-y-4">
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Email / Password Form */}
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-300 font-medium">Admin Email</label>
                    <div className="relative mt-1">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full px-3 py-2.5 pl-9 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:border-amber-400 focus:outline-none"
                      />
                      <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 font-medium">Password</label>
                    <div className="relative mt-1">
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2.5 pl-9 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:border-amber-400 focus:outline-none placeholder:text-slate-600"
                      />
                      <Key className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-lg shadow-amber-500/20 active:scale-[0.99] disabled:opacity-50"
                  >
                    {isLoggingIn ? 'Authenticating...' : 'Sign In as Admin'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Interactive Custom Poster Studio Drawer */}
        <AnimatePresence>
          {selectedMovieForPoster && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-lg overflow-y-auto">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedMovieForPoster(null)}
                className="fixed inset-0"
              />

              <motion.div
                initial={{ scale: 0.94, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.94, opacity: 0, y: 20 }}
                className="relative z-10 w-full max-w-2xl glass-panel rounded-3xl border border-amber-500/40 shadow-2xl overflow-hidden bg-[#0c0e14] my-8 p-6 sm:p-8 space-y-6"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500 text-black">
                      <ImageIcon className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div>
                      <h3 className="font-editorial text-xl font-bold text-white">
                        Customize Poster Artwork
                      </h3>
                      <p className="text-xs text-slate-400">
                        {selectedMovieForPoster.title} ({selectedMovieForPoster.release_year})
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedMovieForPoster(null)}
                    className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Success Message Alert */}
                {saveSuccessMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Custom poster saved and applied across your entire CineLog archive!</span>
                  </motion.div>
                )}

                {/* Side-by-Side Visual Comparison */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Current Active Poster */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex flex-col items-center text-center">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Current Poster
                    </span>
                    <div className="relative aspect-[2/3] w-32 rounded-xl overflow-hidden bg-black/60 border border-white/20 shadow-md">
                      <Image
                        src={selectedMovieForPoster.poster_url || 'https://image.tmdb.org/t/p/w780/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg'}
                        alt="Current Poster"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-2 font-mono truncate max-w-[160px]">
                      {selectedMovieForPoster.poster_url?.startsWith('data:') ? 'Custom Uploaded Image' : 'Remote Image Link'}
                    </span>
                  </div>

                  {/* New Custom Poster Preview */}
                  <div className="p-4 rounded-2xl bg-amber-500/[0.05] border border-amber-500/30 flex flex-col items-center text-center">
                    <span className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider mb-2">
                      New Custom Preview
                    </span>
                    <div className="relative aspect-[2/3] w-32 rounded-xl overflow-hidden bg-black/60 border-2 border-amber-500/50 shadow-xl ring-4 ring-amber-500/10">
                      {customPosterUrl ? (
                        <Image
                          src={customPosterUrl}
                          alt="New Poster Preview"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-3 text-slate-500 text-xs">
                          <ImageIcon className="w-6 h-6 mb-1 text-slate-600" />
                          <span>No Image</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-amber-400 mt-2 font-medium">
                      {customPosterUrl === selectedMovieForPoster.poster_url ? 'No Changes Yet' : 'Custom Poster Ready'}
                    </span>
                  </div>
                </div>

                {/* Poster Source Toggle */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">
                      Select Custom Poster Source:
                    </label>
                    <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/10 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          sound.playTactileClick(800);
                          setPosterInputMode('url');
                        }}
                        className={`px-3 py-1 rounded-lg transition-all ${
                          posterInputMode === 'url' ? 'bg-amber-500 text-black font-bold' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Image URL Link
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          sound.playTactileClick(800);
                          setPosterInputMode('upload');
                        }}
                        className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                          posterInputMode === 'upload' ? 'bg-amber-500 text-black font-bold' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Local File Upload
                      </button>
                    </div>
                  </div>

                  {/* Mode 1: URL Input */}
                  {posterInputMode === 'url' ? (
                    <div className="space-y-2">
                      <div className="relative">
                        <input
                          type="url"
                          value={customPosterUrl}
                          onChange={e => setCustomPosterUrl(e.target.value)}
                          placeholder="Paste image link from Letterboxd, Imgur, Fanart.tv, Unsplash, etc."
                          className="w-full px-4 py-2.5 pl-10 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:border-amber-400 focus:outline-none placeholder-slate-500"
                        />
                        <Link2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Tip: You can copy direct image links from any website and paste them directly.
                      </p>
                    </div>
                  ) : (
                    /* Mode 2: Local File Upload & Dropzone */
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
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
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                          isDraggingPoster
                            ? 'border-amber-400 bg-amber-500/10'
                            : 'border-white/15 hover:border-amber-500/50 bg-white/[0.02]'
                        }`}
                      >
                        <Upload className="w-6 h-6 mx-auto mb-2 text-amber-400" />
                        <p className="text-xs text-slate-200 font-semibold">
                          Click to browse image or drag and drop here
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          PNG, JPG, WEBP, AVIF, GIF supported
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Backdrop Banner Customizer */}
                  <div className="pt-3 border-t border-white/[0.08] space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-amber-400" />
                        <span>Customize Hero Backdrop Banner (Optional):</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => backdropFileInputRef.current?.click()}
                        className="text-amber-400 hover:underline text-xs flex items-center gap-1"
                      >
                        <Upload className="w-3 h-3" />
                        Upload Backdrop File
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
                      value={customBackdropUrl}
                      onChange={e => setCustomBackdropUrl(e.target.value)}
                      placeholder="https://image.tmdb.org/... or paste custom banner URL"
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:border-amber-400 focus:outline-none placeholder-slate-500"
                    />
                  </div>
                </div>

                {/* Modal Footer Actions: Reset, Delete, Cancel, Save */}
                <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Are you sure you want to permanently delete "${selectedMovieForPoster.title}" from your archive?`)) {
                          handleDeleteMovie(selectedMovieForPoster.id, selectedMovieForPoster.title);
                        }
                      }}
                      className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Title</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedMovieForPoster(null)}
                      className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-slate-300 transition-colors"
                    >
                      Cancel
                    </button>
                    
                    <button
                      type="button"
                      disabled={isSavingPoster || !customPosterUrl}
                      onClick={handleSaveCustomPoster}
                      className="px-6 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/25 active:scale-95 flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSavingPoster ? (
                        <span>Saving...</span>
                      ) : (
                        <>
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Apply Custom Poster</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}

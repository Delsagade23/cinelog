'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { 
  Clapperboard, 
  Sparkles, 
  Search, 
  SlidersHorizontal, 
  Star, 
  Film, 
  Tv, 
  Compass, 
  Ticket, 
  Moon, 
  ArrowUpDown, 
  Grid3X3,
  Flame,
  Heart,
  Clock
} from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { MovieCard } from '@/components/movie-card';
import { useCineStore } from '@/lib/store';
import { GENRE_LIST, TAG_LIST } from '@/lib/mock-data';
import { sound } from '@/lib/sound';

export default function HomePage() {
  const { 
    mediaLogs, 
    filterState, 
    setFilterState, 
    setTicketModalOpen, 
    setTheaterMode 
  } = useCineStore();

  // Filter & Sort Engine
  const filteredLogs = useMemo(() => {
    return mediaLogs.filter(item => {
      // 1. Search Query Match
      if (filterState.searchQuery.trim()) {
        const q = filterState.searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDirector = item.director.toLowerCase().includes(q);
        const matchesGut = item.gut_reaction.toLowerCase().includes(q);
        const matchesReview = item.full_review.toLowerCase().includes(q);
        const matchesTag = item.custom_tags.some(t => t.toLowerCase().includes(q));
        const matchesGenre = item.genres.some(g => g.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDirector && !matchesGut && !matchesReview && !matchesTag && !matchesGenre) {
          return false;
        }
      }

      // 2. Media Type Filter
      if (filterState.mediaType !== 'all' && item.media_type !== filterState.mediaType) {
        return false;
      }

      // 3. Genre Filter
      if (filterState.selectedGenre && filterState.selectedGenre !== 'All') {
        if (!item.genres.includes(filterState.selectedGenre)) {
          return false;
        }
      }

      // 4. Custom Tag Filter
      if (filterState.selectedTag && filterState.selectedTag !== 'All') {
        if (!item.custom_tags.includes(filterState.selectedTag)) {
          return false;
        }
      }

      // 5. Min Rating
      if (item.personal_rating < filterState.minRating) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (filterState.sortBy === 'watched_date_desc') {
        return new Date(b.watched_date).getTime() - new Date(a.watched_date).getTime();
      }
      if (filterState.sortBy === 'watched_date_asc') {
        return new Date(a.watched_date).getTime() - new Date(b.watched_date).getTime();
      }
      if (filterState.sortBy === 'rating_desc') {
        return b.personal_rating - a.personal_rating;
      }
      if (filterState.sortBy === 'year_desc') {
        return b.release_year - a.release_year;
      }
      if (filterState.sortBy === 'title_asc') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [mediaLogs, filterState]);

  return (
    <div className="flex-1 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Editorial Hero Header */}
        <section className="relative rounded-3xl overflow-hidden glass-panel p-6 sm:p-10 border border-white/[0.08] shadow-2xl bg-gradient-to-br from-[#0e111a]/95 via-[#0a0c12]/90 to-[#07080a]/95">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personal Watch Archive & Critical Curation</span>
            </div>

            <h1 className="font-editorial text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
              Obsessive Cinema, <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-600">
                Raw Gut Reactions & Moods
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              A bespoke, zero-filler personal log of films and television that left a crater in my psyche. Explore via punchy one-liners, full analytical reviews, or the 2D emotional Mood Matrix.
            </p>

            {/* Quick Interactive Badges & Triggers */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/matrix"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold hover:bg-amber-500/25 transition-all"
              >
                <Compass className="w-4 h-4 text-amber-400" />
                <span>Explore Mood Matrix View</span>
              </Link>

              <button
                onClick={() => {
                  sound.playTicketTear();
                  setTicketModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 hover:border-amber-500/40 text-slate-300 hover:text-white text-xs font-semibold transition-all"
              >
                <Ticket className="w-4 h-4 text-amber-400" />
                <span>Tear a Blind Ticket</span>
              </button>

              <button
                onClick={() => {
                  sound.playTactileClick(600);
                  setTheaterMode(true);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 text-slate-400 hover:text-white text-xs font-medium transition-all"
              >
                <Moon className="w-4 h-4" />
                <span>Spacebar Theater Mode</span>
              </button>
            </div>
          </div>
        </section>

        {/* Filter, Search & Sorter Bar */}
        <section className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
            
            {/* Search Input */}
            <div className="lg:col-span-4 relative">
              <input
                type="text"
                value={filterState.searchQuery}
                onChange={e => setFilterState(prev => ({ ...prev, searchQuery: e.target.value }))}
                placeholder="Search by title, director, gut reaction, or tags..."
                className="w-full px-4 py-2.5 pl-10 rounded-2xl bg-[#0c0e14]/90 border border-white/[0.08] focus:border-amber-500/60 focus:outline-none text-sm text-white placeholder-slate-500 shadow-md"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            </div>

            {/* Media Type Toggle */}
            <div className="lg:col-span-5 flex items-center p-1 rounded-2xl bg-[#0c0e14]/90 border border-white/[0.08] overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'All', icon: Clapperboard },
                { id: 'movie', label: 'Movies', icon: Film },
                { id: 'tv', label: 'Series', icon: Tv },
                { id: 'anime', label: 'Anime', icon: Flame },
                { id: 'kdrama', label: 'K-Drama', icon: Heart },
              ].map(t => {
                const Icon = t.icon;
                const isActive = filterState.mediaType === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      sound.playTactileClick(750);
                      setFilterState(prev => ({ ...prev, mediaType: t.id as any }));
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Sorter Dropdown */}
            <div className="lg:col-span-3 flex items-center gap-2">
              <div className="relative flex-1">
                <select
                  value={filterState.sortBy}
                  onChange={e => {
                    sound.playTactileClick(700);
                    setFilterState(prev => ({ ...prev, sortBy: e.target.value as any }));
                  }}
                  className="w-full px-3 py-2.5 rounded-2xl bg-[#0c0e14]/90 border border-white/[0.08] text-xs text-slate-200 focus:border-amber-500/60 focus:outline-none"
                >
                  <option value="watched_date_desc">Sort: Watched Date (Newest)</option>
                  <option value="watched_date_asc">Sort: Watched Date (Oldest)</option>
                  <option value="rating_desc">Sort: Personal Rating (Highest)</option>
                  <option value="year_desc">Sort: Release Year (Newest)</option>
                  <option value="title_asc">Sort: Title (A-Z)</option>
                </select>
              </div>

              {/* Min Rating Filter */}
              <div className="relative flex items-center">
                <select
                  value={filterState.minRating}
                  onChange={e => {
                    sound.playTactileClick(700);
                    setFilterState(prev => ({ ...prev, minRating: parseFloat(e.target.value) }));
                  }}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#0c0e14]/90 border border-white/[0.08] text-xs text-amber-300 font-bold focus:border-amber-500/60 focus:outline-none cursor-pointer"
                >
                  <option value="0" className="bg-[#0c0e14] text-slate-200">★ All Ratings</option>
                  <option value="9.0" className="bg-[#0c0e14] text-amber-300">★ 9.0+ Masterpieces</option>
                  <option value="9.5" className="bg-[#0c0e14] text-amber-300">★ 9.5+ All-Time Peaks</option>
                </select>
              </div>
            </div>

          </div>

          {/* Genre & Vibe Tag Pill Rails */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 shrink-0">
              Vibes:
            </span>
            {TAG_LIST.map(tag => {
              const isActive = (tag === 'All' && !filterState.selectedTag) || filterState.selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => {
                    sound.playTactileClick(850);
                    setFilterState(prev => ({
                      ...prev,
                      selectedTag: tag === 'All' ? null : tag
                    }));
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-all border ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-semibold'
                      : 'bg-white/[0.02] text-slate-400 border-white/[0.06] hover:text-white hover:border-white/20'
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        </section>

        {/* Curation Count & Active Filter Indicator */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/[0.06]">
          <span>
            Displaying <strong>{filteredLogs.length}</strong> of <strong>{mediaLogs.length}</strong> curated logs
          </span>
          {(filterState.searchQuery || filterState.selectedGenre || filterState.selectedTag || filterState.mediaType !== 'all' || filterState.minRating > 0) && (
            <button
              onClick={() => {
                sound.playTactileClick(500);
                setFilterState({
                  searchQuery: '',
                  mediaType: 'all',
                  selectedGenre: null,
                  selectedTag: null,
                  minRating: 0,
                  sortBy: 'watched_date_desc'
                });
              }}
              className="text-amber-400 hover:underline font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Responsive Grid of 3D Tilt Cards */}
        {filteredLogs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredLogs.map((media, index) => (
              <MovieCard key={media.id} media={media} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 rounded-3xl glass-panel border border-white/[0.08] space-y-3">
            <Film className="w-10 h-10 mx-auto text-slate-600 animate-pulse" />
            <h3 className="font-editorial text-xl font-bold text-slate-300">No matching watch logs found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try loosening your search filters or browse by all vibes.
            </p>
          </div>
        )}

        {/* Interactive Secrets & Easter Egg Hints Footer */}
        <footer className="mt-16 py-8 border-t border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-editorial text-slate-400 font-bold text-sm">CineLog Archive</span>
            <span>•</span>
            <span>Designed for pure cinema lovers</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>Konami Code: <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300">↑↑↓↓←→←→BA</kbd> for Director's Cut</span>
            <span>•</span>
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300">Spacebar</kbd> for Theater Dimmer</span>
          </div>
        </footer>

      </main>
    </div>
  );
}

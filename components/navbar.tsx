'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Clapperboard, 
  Compass, 
  Sparkles, 
  Tv, 
  Film, 
  Moon, 
  Ticket, 
  ShieldCheck, 
  Lock, 
  Plus, 
  Grid3X3,
  Search
} from 'lucide-react';
import { useCineStore } from '@/lib/store';
import { sound } from '@/lib/sound';

export const Navbar = () => {
  const pathname = usePathname();
  const { 
    mediaLogs, 
    isAdmin, 
    setTheaterMode, 
    setTicketModalOpen, 
    setAddModalOpen,
    setTotoroEasterEggOpen,
    filterState,
    setFilterState
  } = useCineStore();

  const [logoClicks, setLogoClicks] = useState(0);
  const clickResetTimer = useRef<NodeJS.Timeout | null>(null);

  const handleLogoClick = (e: React.MouseEvent) => {
    // If clicking rapidly or already on home, prevent default reload/navigation
    if (pathname === '/' || logoClicks > 0) {
      e.preventDefault();
    }

    const nextCount = logoClicks + 1;
    setLogoClicks(nextCount);

    if (clickResetTimer.current) {
      clearTimeout(clickResetTimer.current);
    }

    const pitches = [600, 750, 900, 1100, 1400];
    const pitch = pitches[Math.min(nextCount - 1, pitches.length - 1)];
    sound.playTactileClick(pitch);

    if (nextCount >= 5) {
      e.preventDefault();
      sound.playMagicSparkle();
      setTotoroEasterEggOpen(true);
      setLogoClicks(0);
    } else {
      clickResetTimer.current = setTimeout(() => {
        setLogoClicks(0);
      }, 2500);
    }
  };

  const totalTitles = mediaLogs.length;
  const avgRating = totalTitles > 0 
    ? (mediaLogs.reduce((acc, curr) => acc + curr.personal_rating, 0) / totalTitles).toFixed(1)
    : '0.0';

  const handleTicketClick = () => {
    sound.playTicketTear();
    setTicketModalOpen(true);
  };

  const handleTheaterToggle = () => {
    sound.playTactileClick(600);
    setTheaterMode(prev => !prev);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#07080a]/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand & Logo */}
        <div className="flex items-center gap-6">
          <Link 
            href="/"
            onClick={handleLogoClick}
            className="flex items-center gap-2.5 group relative cursor-pointer"
            title="CineLog Archive"
          >
            <div className={`p-2 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-black shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-all ${
              logoClicks > 0 ? 'scale-110 ring-2 ring-amber-400/60' : ''
            }`}>
              <Clapperboard className="w-5 h-5 fill-black stroke-black" />
            </div>
            <div className="flex items-center">
              <span className="font-editorial text-xl font-bold tracking-tight text-white group-hover:text-amber-300 transition-colors">
                CineLog
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] tracking-widest uppercase font-semibold text-slate-400 bg-white/[0.06] px-2 py-0.5 rounded-full border border-white/[0.08]">
                ARCHIVE
              </span>

              {/* Secret click progress hint */}
              {logoClicks >= 2 && logoClicks < 5 && (
                <span className="ml-2 text-[10px] text-amber-400 font-mono font-bold bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/40 animate-pulse">
                  ✨ {logoClicks}/5
                </span>
              )}
            </div>
          </Link>

          {/* View Mode Links */}
          <nav className="hidden md:flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.06]">
            <Link
              href="/"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                pathname === '/'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              Feed Grid
            </Link>

            <Link
              href="/matrix"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                pathname === '/matrix'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Mood Matrix
            </Link>
          </nav>
        </div>

        {/* Action Controls & Easter Egg Triggers */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          
          {/* Tearable Blind Ticket Trigger */}
          <button
            onClick={handleTicketClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-600/10 border border-amber-500/40 text-amber-300 text-xs font-semibold hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/20 transition-all active:scale-95"
            title="Tear a vintage Blind Ticket for a mystery recommendation"
          >
            <Ticket className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Blind Ticket</span>
          </button>

          {/* Spacebar Dimmer Toggle */}
          <button
            onClick={handleTheaterToggle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-white/20 text-slate-300 text-xs font-medium hover:text-white transition-all"
            title="Toggle Cinema Dimmer Mode (or press Spacebar)"
          >
            <Moon className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden lg:inline text-slate-400 text-[11px]">Spacebar</span>
          </button>

          {/* Admin Action Button / Login */}
          {isAdmin ? (
            <button
              onClick={() => setAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 text-black font-semibold text-xs hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/25 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Add Title</span>
            </button>
          ) : (
            <Link
              href="/admin"
              className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-slate-400 hover:text-slate-200 hover:border-white/20 transition-all"
              title="Admin Login"
            >
              <Lock className="w-3.5 h-3.5" />
            </Link>
          )}

          {/* Minimal Stats Pill */}
          <div className="hidden xl:flex items-center gap-2 pl-2 border-l border-white/[0.08] text-xs text-slate-400">
            <span><strong>{totalTitles}</strong> Logged</span>
            <span>•</span>
            <span className="text-amber-400 font-semibold">★ {avgRating}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

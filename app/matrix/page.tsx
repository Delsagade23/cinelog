'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Compass, Info } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { MoodMatrix } from '@/components/mood-matrix';
import { sound } from '@/lib/sound';

export default function MatrixPage() {
  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col justify-center space-y-6">
        
        {/* Back navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            onClick={() => sound.playTactileClick(600)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Curation Feed</span>
          </Link>
        </div>

        {/* 2D Mood Matrix Quadrant View */}
        <MoodMatrix />

        {/* Matrix Legend / Guide */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          <div className="p-4 rounded-2xl bg-emerald-500/[0.04] border border-emerald-500/20 text-xs">
            <h4 className="font-bold text-emerald-400 mb-1">Transcendence (Top-Left)</h4>
            <p className="text-slate-400">High cerebral complexity paired with life-affirming catharsis (e.g. EEAAO, Spirited Away).</p>
          </div>
          <div className="p-4 rounded-2xl bg-amber-500/[0.04] border border-amber-500/20 text-xs">
            <h4 className="font-bold text-amber-400 mb-1">Kinetic Joy (Top-Right)</h4>
            <p className="text-slate-400">Pure visceral entertainment and adrenaline-injected optimism (e.g. Spider-Verse, Fury Road).</p>
          </div>
          <div className="p-4 rounded-2xl bg-indigo-500/[0.04] border border-indigo-500/20 text-xs">
            <h4 className="font-bold text-indigo-400 mb-1">3 AM Abyss (Bottom-Left)</h4>
            <p className="text-slate-400">Deep existential melancholy, heavy philosophical weight, and bleak atmosphere (e.g. Blade Runner 2049, Aftersun, The Zone of Interest).</p>
          </div>
          <div className="p-4 rounded-2xl bg-rose-500/[0.04] border border-rose-500/20 text-xs">
            <h4 className="font-bold text-rose-400 mb-1">Dark Pulp & Chaos (Bottom-Right)</h4>
            <p className="text-slate-400">High-octane entertainment with cynical bite, vicious drama, or dark humor (e.g. Succession).</p>
          </div>
        </div>

      </main>
    </div>
  );
}

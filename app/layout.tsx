import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Shrikhand, Calistoga } from 'next/font/google';
import './globals.css';
import { CineStoreProvider } from '@/lib/store';
import { AmbientGlow } from '@/components/ambient-glow';
import { SpacebarDimmer } from '@/components/spacebar-dimmer';
import { DirectorsCutEasterEgg } from '@/components/directors-cut-easter-egg';
import { BlindTicketModal } from '@/components/blind-ticket-modal';
import { AddMediaModal } from '@/components/admin/add-media-modal';
import { EditMediaModal } from '@/components/admin/edit-media-modal';
import { ReviewDetailModal } from '@/components/review-detail-modal';
import { TotoroEasterEggModal } from '@/components/totoro-easter-egg-modal';

const sansFont = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const retroFont = Shrikhand({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-retro',
  display: 'swap',
});

const calistogaFont = Calistoga({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CineLog — Personal Cinematic Curation & Watch Archive',
  description: 'An interactive, atmospheric archive of personal film logs, editorial reviews, mood matrix discovery, and cinema easter eggs.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sansFont.variable} ${retroFont.variable} ${calistogaFont.variable} dark`}>
      <body
        suppressHydrationWarning
        className="bg-[#07080a] text-slate-100 min-h-screen antialiased selection:bg-amber-500 selection:text-black film-grain relative">
        <CineStoreProvider>
          {/* Dynamic Ambient Background Glow */}
          <AmbientGlow />

          {/* Main App Content */}
          <div className="relative z-10 flex flex-col min-h-screen">
            {children}
          </div>

          {/* Global Interactive Modals */}
          <ReviewDetailModal />
          <BlindTicketModal />
          <AddMediaModal />
          <EditMediaModal />

          {/* Easter Eggs & Immersive Overlays */}
          <DirectorsCutEasterEgg />
          <TotoroEasterEggModal />
          <SpacebarDimmer />
        </CineStoreProvider>
      </body>
    </html>
  );
}

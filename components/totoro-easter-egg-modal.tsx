'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  X, 
  Sparkles, 
  Film,
  SkipForward,
  SkipBack
} from 'lucide-react';
import { useCineStore } from '@/lib/store';
import { sound } from '@/lib/sound';

interface Scene {
  id: number;
  title: string;
  actName: string;
  image: string;
  duration: number; // in seconds
  subtitle: string;
  caption: string;
}

const SCENES: Scene[] = [
  {
    id: 1,
    title: 'The Enchanted Reel Trick',
    actName: 'Act I: The Forest Mystery',
    image: '/totoro-easter-egg/scene1.jpg',
    duration: 6,
    subtitle: 'Deep in the camphor woods, Totoro twirls a glowing 35mm cinema reel into the midnight air...',
    caption: 'Totoro performs his magical golden reel levitation with soot sprites cheering around him.'
  },
  {
    id: 2,
    title: 'The Celestial Spinning Top',
    actName: 'Act II: The Sky Flight',
    image: '/totoro-easter-egg/scene2.jpg',
    duration: 6,
    subtitle: 'Balancing upon a roaring celestial top, Totoro soars across starry constellations above the quiet forest canopy...',
    caption: 'With his little leaf umbrella, Totoro rides the glowing wooden top through the constellations.'
  },
  {
    id: 3,
    title: 'The Curator’s Greeting',
    actName: 'Act III: The Heartfelt Thanks',
    image: '/totoro-easter-egg/scene3.jpg',
    duration: 7,
    subtitle: 'Totoro beams his iconic grand smile, holding up a mossy forest slate crafted especially for you...',
    caption: '“THANK YOU FOR VISITING CINELOG! May great cinema always inspire and move you.”'
  }
];

const TOTAL_DURATION = SCENES.reduce((acc, s) => acc + s.duration, 0);

export const TotoroEasterEggModal = () => {
  const { totoroEasterEggOpen, setTotoroEasterEggOpen } = useCineStore();
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isEnded, setIsEnded] = useState(false);

  const stopAudioRef = useRef<(() => void) | null>(null);

  const startMusic = useCallback(() => {
    if (stopAudioRef.current) {
      stopAudioRef.current();
      stopAudioRef.current = null;
    }
    if (!isMuted) {
      stopAudioRef.current = sound.playTotoroMelody();
    }
  }, [isMuted]);

  const stopMusic = useCallback(() => {
    if (stopAudioRef.current) {
      stopAudioRef.current();
      stopAudioRef.current = null;
    }
  }, []);

  // When modal opens or closes
  useEffect(() => {
    if (totoroEasterEggOpen) {
      setIsPlaying(true);
      setCurrentSceneIndex(0);
      setElapsedTime(0);
      setIsEnded(false);
      sound.playMagicSparkle();
      startMusic();
    } else {
      stopMusic();
    }
    return () => {
      stopMusic();
    };
  }, [totoroEasterEggOpen, startMusic, stopMusic]);

  // Handle Mute toggle
  const toggleMute = () => {
    sound.playTactileClick(700);
    setIsMuted(prev => {
      const next = !prev;
      if (next) {
        stopMusic();
      } else {
        stopAudioRef.current = sound.playTotoroMelody();
      }
      return next;
    });
  };

  // Keyboard controls: Space to play/pause, Esc to close
  useEffect(() => {
    if (!totoroEasterEggOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        sound.playTactileClick(500);
        setTotoroEasterEggOpen(false);
      } else if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(p => !p);
      } else if (e.key === 'ArrowRight') {
        handleNextScene();
      } else if (e.key === 'ArrowLeft') {
        handlePrevScene();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totoroEasterEggOpen, currentSceneIndex, setTotoroEasterEggOpen]);

  // Playback timer
  useEffect(() => {
    if (!totoroEasterEggOpen || !isPlaying || isEnded) return;

    const interval = setInterval(() => {
      setElapsedTime(prev => {
        const nextTime = prev + 0.1;
        if (nextTime >= TOTAL_DURATION) {
          setIsPlaying(false);
          setIsEnded(true);
          return TOTAL_DURATION;
        }

        // Calculate which scene we are on
        let accumulated = 0;
        for (let i = 0; i < SCENES.length; i++) {
          accumulated += SCENES[i].duration;
          if (nextTime < accumulated) {
            if (currentSceneIndex !== i) {
              setCurrentSceneIndex(i);
              sound.playMagicSparkle();
            }
            break;
          }
        }

        return nextTime;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [totoroEasterEggOpen, isPlaying, isEnded, currentSceneIndex]);

  const handleNextScene = () => {
    if (currentSceneIndex < SCENES.length - 1) {
      sound.playTactileClick(850);
      let newTime = 0;
      for (let i = 0; i <= currentSceneIndex; i++) {
        newTime += SCENES[i].duration;
      }
      setCurrentSceneIndex(prev => prev + 1);
      setElapsedTime(newTime + 0.05);
      setIsEnded(false);
    }
  };

  const handlePrevScene = () => {
    if (currentSceneIndex > 0) {
      sound.playTactileClick(700);
      let newTime = 0;
      for (let i = 0; i < currentSceneIndex - 1; i++) {
        newTime += SCENES[i].duration;
      }
      setCurrentSceneIndex(prev => prev - 1);
      setElapsedTime(newTime);
      setIsEnded(false);
    }
  };

  const handleReplay = () => {
    sound.playTactileClick(900);
    setCurrentSceneIndex(0);
    setElapsedTime(0);
    setIsEnded(false);
    setIsPlaying(true);
    startMusic();
  };

  const handleJumpToScene = (index: number) => {
    sound.playTactileClick(800);
    let newTime = 0;
    for (let i = 0; i < index; i++) {
      newTime += SCENES[i].duration;
    }
    setCurrentSceneIndex(index);
    setElapsedTime(newTime + 0.05);
    setIsEnded(false);
    setIsPlaying(true);
  };

  // Format timecode display
  const formatTimecode = (sec: number) => {
    const s = Math.floor(sec);
    const ms = Math.floor((sec - s) * 24);
    return `00:00:${s.toString().padStart(2, '0')}:${ms.toString().padStart(2, '0')}`;
  };

  if (!totoroEasterEggOpen) return null;

  const currentScene = SCENES[currentSceneIndex];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-8 bg-black/95 backdrop-blur-2xl select-none overflow-hidden">
        {/* Animated background stars & ambient motes */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-950/25 via-[#070b12] to-black opacity-80 pointer-events-none" />

        {/* Ambient Floating Dust Bunnies & Fireflies */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(14)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-amber-400/40 blur-[1px]"
              initial={{
                x: `${(i * 7) % 100}vw`,
                y: '105vh',
                opacity: 0.2
              }}
              animate={{
                y: '-10vh',
                opacity: [0.1, 0.7, 0.2],
                x: `calc(${(i * 7) % 100}vw + ${Math.sin(i) * 60}px)`
              }}
              transition={{
                duration: 9 + (i % 6) * 2,
                repeat: Infinity,
                ease: 'linear',
                delay: i * 0.4
              }}
            />
          ))}
        </div>

        {/* Cinematic Projector Container */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="relative z-10 w-full max-w-5xl rounded-3xl border border-amber-500/30 bg-[#08090d] shadow-[0_0_80px_rgba(245,158,11,0.18)] overflow-hidden flex flex-col"
        >
          {/* Top Cinema Letterbox Bar / Info Header */}
          <div className="px-4 sm:px-6 py-3 bg-black/80 border-b border-white/[0.08] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Film className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-editorial text-sm font-bold text-white tracking-wide">
                  My Neighbor Totoro
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  Secret Cinema Easter Egg
                </span>
              </div>
            </div>

            {/* Timecode & Controls */}
            <div className="flex items-center gap-3">
              <div className="font-mono text-[11px] text-amber-300/80 bg-black/60 px-2.5 py-1 rounded-md border border-white/10 hidden sm:block">
                REC ● {formatTimecode(elapsedTime)}
              </div>

              {/* Mute / Unmute Button */}
              <button
                onClick={toggleMute}
                className="p-1.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                title={isMuted ? 'Unmute Ghibli Music' : 'Mute Music'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
              </button>

              {/* Close Button */}
              <button
                onClick={() => {
                  sound.playTactileClick(500);
                  setTotoroEasterEggOpen(false);
                }}
                className="p-1.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                title="Close Cinema (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Visual Cinematic Frame (16:9 Screen) */}
          <div className="relative aspect-video w-full bg-black overflow-hidden group">
            {/* Animated Scene Projection with Ken-Burns Motion */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentScene.id}
                initial={{ opacity: 0, scale: 1.06 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0"
              >
                <Image
                  src={currentScene.image}
                  alt={currentScene.title}
                  fill
                  priority
                  className="object-cover object-center"
                />

                {/* Subtle Cinematic Vignette and Film Lighting */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 pointer-events-none" />
                <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] pointer-events-none" />
              </motion.div>
            </AnimatePresence>

            {/* Act Badge on Top Left of Frame */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white font-medium text-[11px] shadow-lg">
                {currentScene.actName}
              </span>
            </div>

            {/* End of Film Curtain Card */}
            {isEnded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-30 bg-black/75 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4"
              >
                <motion.div
                  initial={{ scale: 0.8, y: 10 }}
                  animate={{ scale: 1, y: 0 }}
                  className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400"
                >
                  <Sparkles className="w-8 h-8 animate-pulse" />
                </motion.div>

                <div className="space-y-1">
                  <h3 className="font-editorial text-2xl sm:text-3xl font-extrabold text-white">
                    Thank You For Visiting CineLog!
                  </h3>
                  <p className="text-xs sm:text-sm text-amber-200/80 max-w-md mx-auto">
                    Totoro and the soot sprites wish you wonderful cinematic journeys through films, stories, and emotions.
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleReplay}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-lg shadow-amber-500/30 transition-all active:scale-95"
                  >
                    <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Replay Movie Trick</span>
                  </button>

                  <button
                    onClick={() => setTotoroEasterEggOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-white text-xs font-semibold border border-white/10 transition-colors"
                  >
                    Back to CineLog Feed
                  </button>
                </div>
              </motion.div>
            )}

            {/* Subtitle / Narrative Overlay Bar */}
            <div className="absolute bottom-4 inset-x-4 sm:inset-x-8 z-20 pointer-events-none">
              <motion.div 
                key={currentScene.subtitle}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-black/70 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/10 text-center shadow-2xl max-w-2xl mx-auto"
              >
                <p className="font-editorial text-sm sm:text-base font-semibold text-amber-300 drop-shadow-md">
                  {currentScene.caption}
                </p>
                <p className="text-[11px] text-slate-300 mt-0.5 hidden sm:block">
                  {currentScene.subtitle}
                </p>
              </motion.div>
            </div>
          </div>

          {/* Bottom Player Controller Bar */}
          <div className="p-4 sm:p-5 bg-[#06070a] border-t border-white/[0.08] space-y-3">
            {/* Timeline Progress Track */}
            <div className="relative w-full h-2 bg-white/10 rounded-full overflow-hidden cursor-pointer">
              <motion.div
                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300"
                style={{ width: `${(elapsedTime / TOTAL_DURATION) * 100}%` }}
              />
            </div>

            {/* Scrubber & Controls Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              {/* Scene selector tabs */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {SCENES.map((scene, idx) => (
                  <button
                    key={scene.id}
                    onClick={() => handleJumpToScene(idx)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                      currentSceneIndex === idx
                        ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                        : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08]'
                    }`}
                  >
                    Act {idx + 1}
                  </button>
                ))}
              </div>

              {/* Playback action controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevScene}
                  disabled={currentSceneIndex === 0}
                  className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  title="Previous Trick"
                >
                  <SkipBack className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    sound.playTactileClick(600);
                    if (isEnded) {
                      handleReplay();
                    } else {
                      setIsPlaying(p => !p);
                    }
                  }}
                  className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold shadow-lg shadow-amber-500/20 transition-all active:scale-95"
                  title={isPlaying ? 'Pause Movie' : 'Play Movie'}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-black stroke-black" />
                  ) : (
                    <Play className="w-4 h-4 fill-black stroke-black translate-x-0.5" />
                  )}
                </button>

                <button
                  onClick={handleNextScene}
                  disabled={currentSceneIndex === SCENES.length - 1}
                  className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  title="Next Trick"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleReplay}
                  className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] text-slate-300 hover:text-white transition-colors ml-1"
                  title="Restart Movie"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Right Tag / Status */}
              <div className="hidden md:flex items-center gap-1.5 text-amber-400/80 font-medium text-[11px]">
                <Sparkles className="w-3 h-3" />
                <span>Studio Ghibli Tribute • CineLog 2026</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

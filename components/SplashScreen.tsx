'use client';

import React, { useState, useEffect } from 'react';

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout | undefined;
    let fadeTimer: NodeJS.Timeout | undefined;
    let unmountTimer: NodeJS.Timeout | undefined;

    // Asynchronous initialization prevents hydration cascades and ESLint effect warnings
    const initTimer = setTimeout(() => {
      try {
        const hasSeenSplash = sessionStorage.getItem('examcraft_splash_seen');
        if (hasSeenSplash) {
          setIsVisible(false);
          return;
        }
      } catch {
        // Storage access fallback
      }

      // Progress bar animation increments smoothly over the 7-second sequence
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 98) {
            return 99;
          }
          return prev + Math.floor(Math.random() * 3 + 2);
        });
      }, 140);

      // Fade-out timer trigger at exactly 7.0 seconds (7000ms)
      fadeTimer = setTimeout(() => {
        setProgress(100);
        setIsFading(true);
      }, 7000);

      // Complete unmount timer after smooth 700ms fade transition (7700ms)
      unmountTimer = setTimeout(() => {
        setIsVisible(false);
        try {
          sessionStorage.setItem('examcraft_splash_seen', 'true');
        } catch {
          // Fallback
        }
      }, 7700);
    }, 0);

    return () => {
      clearTimeout(initTimer);
      if (progressInterval) clearInterval(progressInterval);
      if (fadeTimer) clearTimeout(fadeTimer);
      if (unmountTimer) clearTimeout(unmountTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      aria-live="polite"
      aria-label="Loading ExamCraft Studio"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0F172A] text-white transition-opacity duration-700 select-none ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Soft Ambient Radial Glow Behind Logo */}
      <div className="absolute w-96 h-96 bg-[#2DD4BF]/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <div className="relative z-10 flex flex-col items-center text-center space-y-5 px-4">
        {/* Sleek Teal Checkmark Icon Box */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#2DD4BF] to-cyan-500 rounded-2xl blur-sm opacity-60 group-hover:opacity-100 transition duration-500 animate-pulse" />
          <div className="relative w-16 h-16 rounded-xl bg-[#0F172A] border-2 border-[#1E293B] shadow-2xl flex items-center justify-center text-[#2DD4BF] text-3xl font-black">
            <span>✓</span>
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-1.5">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
            ExamCraft Studio
          </h1>
          <p className="text-xs sm:text-sm font-mono tracking-widest text-[#2DD4BF]/90 uppercase">
            INITIALIZING ASSESSMENT ENGINE...
          </p>
        </div>

        {/* Sleek Animated Horizontal Loading Bar */}
        <div className="w-56 sm:w-64 pt-2">
          <div className="h-1.5 w-full bg-slate-800/90 rounded-full overflow-hidden border border-slate-700/60 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#2DD4BF] via-cyan-400 to-[#2DD4BF] rounded-full transition-all duration-300 ease-out shadow-[0_0_12px_rgba(45,212,191,0.5)]"
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mt-2 px-1">
            <span>CORE V1.4.2</span>
            <span>{Math.min(100, progress)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

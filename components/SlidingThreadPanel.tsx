'use client';

import React, { useState, useEffect } from 'react';
import { useQuiz } from '@/context/QuizContext';
import { ExamRunner } from '@/components/ExamRunner';
import {
  X,
  PlayCircle,
  BookOpen,
  Maximize2,
  Clock,
  Award,
  ChevronRight,
  ShieldCheck,
  Hash,
  Terminal,
  FileQuestion,
  Layers,
} from 'lucide-react';

export function SlidingThreadPanel() {
  const {
    slidingPanelExam,
    slidingPanelMode,
    closeSlidingPanel,
    openExamModal,
    setSelectedExamId,
  } = useQuiz();

  const [localMode, setLocalMode] = useState<'syllabus' | 'runner' | null>(null);
  const currentMode = localMode ?? slidingPanelMode ?? 'syllabus';

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && slidingPanelExam) {
        closeSlidingPanel();
        setLocalMode(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slidingPanelExam, closeSlidingPanel]);

  if (!slidingPanelExam) return null;

  const totalPoints = slidingPanelExam.questions.reduce(
    (sum, q) => sum + (q.pointWeight || 1),
    0
  );

  const specBadge = `spec::${slidingPanelExam.category.toLowerCase().replace(/\s+/g, '-')}.${slidingPanelExam.difficulty.toLowerCase()}`;

  const handleExpandFullscreen = () => {
    const examId = slidingPanelExam.id;
    setLocalMode(null);
    closeSlidingPanel();
    openExamModal(examId);
  };

  const handleStartInPanel = () => {
    setSelectedExamId(slidingPanelExam.id);
    setLocalMode('runner');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Dimmed backdrop covering the remaining 50% left space */}
      <div
        onClick={closeSlidingPanel}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity -z-10"
        aria-hidden="true"
      />

      {/* 50% Width Right Sliding Window Panel (Discord/Thread Style) */}
      <aside className="fixed top-0 right-0 bottom-0 w-full sm:w-[580px] lg:w-1/2 bg-slate-950/95 border-l border-slate-800 shadow-2xl backdrop-blur-2xl flex flex-col z-50 transform transition-transform duration-300 ease-out animate-in slide-in-from-right">
        {/* Desktop Window Chrome Header Bar */}
        <div className="h-14 px-5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
          {/* macOS window dots + Spec identifier */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 mr-2">
              <button
                onClick={closeSlidingPanel}
                className="w-3 h-3 rounded-full bg-rose-500 hover:bg-rose-400 transition-colors"
                title="Close Thread (Esc)"
              />
              <button
                onClick={closeSlidingPanel}
                className="w-3 h-3 rounded-full bg-amber-500 hover:bg-amber-400 transition-colors"
                title="Minimize Thread"
              />
              <div
                className="w-3 h-3 rounded-full bg-emerald-500 opacity-80"
                title="Thread Active"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-400/90 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800/80">
              <Hash className="w-3.5 h-3.5 text-cyan-400" />
              <span>{specBadge}</span>
            </div>
          </div>

          {/* Mode Switcher + Action Controls */}
          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex items-center p-0.5 bg-slate-950 border border-slate-800 rounded-lg text-xs">
              <button
                onClick={() => setLocalMode('syllabus')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                  currentMode === 'syllabus'
                    ? 'bg-slate-800 text-white font-medium shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-3 h-3" />
                <span>Syllabus</span>
              </button>
              <button
                onClick={handleStartInPanel}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                  currentMode === 'runner'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <PlayCircle className="w-3 h-3" />
                <span>Exam</span>
              </button>
            </div>

            {/* Expand Fullscreen Button */}
            <button
              onClick={handleExpandFullscreen}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors"
              title="Expand to Fullscreen Window"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Prominent Close (X) Button */}
            <button
              onClick={() => {
                setLocalMode(null);
                closeSlidingPanel();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors"
              title="Close Sliding Panel (Return to Dashboard)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sliding Panel Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {currentMode === 'runner' ? (
            /* Live Exam Runner inside 50% thread pane */
            <div className="space-y-4">
              <div className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-xl text-xs text-cyan-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PlayCircle className="w-4 h-4 text-cyan-400" />
                  <span>Running in 50% Discord-style side panel. Your dashboard remains active on the left.</span>
                </div>
                <button
                  onClick={handleExpandFullscreen}
                  className="font-bold underline ml-2 hover:text-white shrink-0"
                >
                  Expand Fullscreen
                </button>
              </div>

              <ExamRunner />
            </div>
          ) : (
            /* Syllabus Overview inside 50% thread pane */
            <div className="space-y-6">
              {/* Exam Title & Specs */}
              <div className="space-y-3 pb-5 border-b border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="font-mono text-cyan-400">{slidingPanelExam.category}</span>
                  <span aria-hidden="true">·</span>
                  <span
                    className={
                      slidingPanelExam.difficulty === 'Hard'
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }
                  >
                    {slidingPanelExam.difficulty} Level
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{slidingPanelExam.questions.length} Items</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                  {slidingPanelExam.title}
                </h2>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {slidingPanelExam.description}
                </p>

                {/* Key Metrics Strip */}
                <div className="grid grid-cols-3 gap-3 pt-3">
                  <div className="bg-slate-900 border border-slate-800/80 p-3 rounded-xl text-center">
                    <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Duration</span>
                    </div>
                    <div className="text-sm font-bold text-slate-100 mt-1">
                      {slidingPanelExam.durationMinutes} min
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800/80 p-3 rounded-xl text-center">
                    <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                      <Award className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Weight</span>
                    </div>
                    <div className="text-sm font-bold text-slate-100 mt-1">
                      {totalPoints} pts
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800/80 p-3 rounded-xl text-center">
                    <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Pass Mark</span>
                    </div>
                    <div className="text-sm font-bold text-emerald-400 mt-1">
                      {slidingPanelExam.passingScorePercent}%
                    </div>
                  </div>
                </div>

                {/* Quick Start Action inside Panel */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={handleStartInPanel}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20 active:scale-95"
                  >
                    <span>Start Test in this Side Panel</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleExpandFullscreen}
                    className="px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-800 transition-colors"
                  >
                    Full Screen
                  </button>
                </div>
              </div>

              {/* Curriculum Questions List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Curriculum Syllabus Questions ({slidingPanelExam.questions.length})</span>
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">Verified Benchmarks</span>
                </div>

                <div className="space-y-3">
                  {slidingPanelExam.questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 rounded-xl p-4 space-y-2 transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="font-mono text-cyan-400/90 font-medium">
                          Item {idx + 1} · {q.type.replace('-', ' ')}
                        </span>
                        <span className="font-semibold text-slate-300">{q.pointWeight} pts</span>
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-white">{q.title}</h4>
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                        {q.prompt}
                      </p>

                      <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                        <span>{q.options.length} Choices</span>
                        <span
                          className={
                            q.difficulty === 'Hard' ? 'text-amber-400/90' : 'text-emerald-400/90'
                          }
                        >
                          {q.difficulty}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

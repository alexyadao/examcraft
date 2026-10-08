'use client';

import React, { useEffect } from 'react';
import { useQuiz } from '@/context/QuizContext';
import { ExamRunner } from '@/components/ExamRunner';
import { QuizCreator } from '@/components/QuizCreator';
import { X, PlayCircle, PenTool, Minus, Square } from 'lucide-react';

export function WindowModalOverlay() {
  const { windowModal, closeWindowModal } = useQuiz();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeWindowModal();
      }
    };
    if (windowModal !== 'none') {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [windowModal, closeWindowModal]);

  if (windowModal === 'none') return null;

  const isExam = windowModal === 'exam';
  const title = isExam ? 'Live Exam Runner — Active Session' : 'Authoring Studio — Question Creator';
  const icon = isExam ? (
    <PlayCircle className="w-4 h-4 text-emerald-400" />
  ) : (
    <PenTool className="w-4 h-4 text-indigo-400" />
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 lg:p-8 bg-slate-950/75 backdrop-blur-md animate-fade-in overflow-y-auto">
      {/* Click outside backdrop */}
      <div
        className="fixed inset-0 -z-10"
        onClick={closeWindowModal}
        aria-hidden="true"
      />

      {/* Floating Application Window Pane */}
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
        {/* Soft glowing ambient lighting behind window header */}
        <div className="absolute top-0 left-1/4 right-1/4 h-16 bg-gradient-to-r from-cyan-500/15 via-indigo-500/15 to-emerald-500/15 blur-2xl pointer-events-none" />

        {/* Desktop Application Window Header Bar */}
        <div className="relative z-10 flex items-center justify-between px-5 py-3.5 bg-slate-950/80 border-b border-slate-800 select-none">
          {/* Traffic light window controls + Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 mr-2">
              <button
                onClick={closeWindowModal}
                className="w-3 h-3 rounded-full bg-rose-500 hover:bg-rose-400 flex items-center justify-center group transition-colors"
                title="Close Window (Esc)"
              >
                <X className="w-2 h-2 text-rose-950 opacity-0 group-hover:opacity-100" />
              </button>
              <button
                onClick={closeWindowModal}
                className="w-3 h-3 rounded-full bg-amber-500 hover:bg-amber-400 flex items-center justify-center group transition-colors"
                title="Minimize Window"
              >
                <Minus className="w-2 h-2 text-amber-950 opacity-0 group-hover:opacity-100" />
              </button>
              <div
                className="w-3 h-3 rounded-full bg-emerald-500 opacity-80"
                title="Active Window Pane"
              />
            </div>

            <div className="flex items-center gap-2">
              {icon}
              <span className="text-xs sm:text-sm font-semibold text-slate-200 tracking-tight">
                {title}
              </span>
            </div>
          </div>

          {/* Prominent Close (X) Button to return to 3D Dashboard */}
          <div className="flex items-center gap-2">
            <button
              onClick={closeWindowModal}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm active:scale-95"
              title="Return to 3D Dashboard"
            >
              <span>Return to 3D Dashboard</span>
              <X className="w-4 h-4 text-cyan-400" />
            </button>
          </div>
        </div>

        {/* Window Pane Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {isExam ? <ExamRunner /> : <QuizCreator />}
        </div>
      </div>
    </div>
  );
}

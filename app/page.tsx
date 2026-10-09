'use client';

import React from 'react';
import { QuizProvider, useQuiz } from '@/context/QuizContext';
import { SplashScreen } from '@/components/SplashScreen';
import { DiscordSidebar } from '@/components/DiscordSidebar';
import { WindowModalOverlay } from '@/components/WindowModalOverlay';
import { SlidingThreadPanel } from '@/components/SlidingThreadPanel';
import { HomePortal } from '@/components/HomePortal';
import { QuizCreator } from '@/components/QuizCreator';
import { ExamRunner } from '@/components/ExamRunner';
import { AnalyticsView } from '@/components/AnalyticsView';
import { ArchitectureDocs } from '@/components/ArchitectureDocs';
import {
  Hash,
  Compass,
  PenTool,
  PlayCircle,
  BarChart3,
  Terminal,
  User,
  Plus,
} from 'lucide-react';

function DiscordChannelHeader() {
  const { activeTab, candidateName, activeRole, openCreatorModal, openExamModal, exams } = useQuiz();

  const tabConfig = {
    home: {
      name: 'home',
      description: 'The Modern Technical Exam & Assessment Studio',
      icon: <Compass className="w-4 h-4 text-cyan-400" />,
    },
    creator: {
      name: 'question-studio',
      description: 'Create and manage custom technical question banks',
      icon: <PenTool className="w-4 h-4 text-indigo-400" />,
    },
    runner: {
      name: 'take-exam',
      description: 'Run timed technical assessments with automated scoring',
      icon: <PlayCircle className="w-4 h-4 text-emerald-400" />,
    },
    analytics: {
      name: 'results-and-scores',
      description: 'Performance trends over time and diagnostic evaluation audits',
      icon: <BarChart3 className="w-4 h-4 text-amber-400" />,
    },
    architecture: {
      name: 'api-architecture',
      description: 'Interactive Swagger-style sandbox and relational data models',
      icon: <Terminal className="w-4 h-4 text-cyan-300" />,
    },
  }[activeTab];

  return (
    <header className="sticky top-0 z-30 h-14 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between">
      {/* Discord Channel Name & Description */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-1.5 font-bold text-white text-sm sm:text-base tracking-tight truncate">
          <Hash className="w-4 h-4 text-slate-500 shrink-0" />
          <span>{tabConfig.name}</span>
        </div>
        <div className="hidden md:block h-4 w-[1px] bg-slate-800 shrink-0" />
        <span className="hidden md:block text-xs text-slate-400 truncate">
          {tabConfig.description}
        </span>
      </div>

      {/* Right Controls: Quick modal buttons & candidate profile */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={openCreatorModal}
          className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors"
          title="Open Question Creator Window"
        >
          <Plus className="w-3.5 h-3.5 text-cyan-400" />
          <span>New Question</span>
        </button>

        <button
          onClick={() => openExamModal(exams[0]?.id)}
          className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-xs text-cyan-300 font-medium transition-colors"
          title="Open Exam Window"
        >
          <PlayCircle className="w-3.5 h-3.5 text-cyan-400" />
          <span>Launch Exam</span>
        </button>

        {/* User Pill */}
        <div suppressHydrationWarning className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800/80 text-xs text-slate-300">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <User className="w-3 h-3 text-slate-400" />
          <span suppressHydrationWarning className="font-semibold text-slate-200 hidden sm:inline">{candidateName}</span>
          <span suppressHydrationWarning className="text-[10px] text-slate-500 font-mono">({activeRole})</span>
        </div>
      </div>
    </header>
  );
}

function MainContent() {
  const { activeTab } = useQuiz();

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {activeTab === 'home' && <HomePortal />}
      {activeTab === 'creator' && <QuizCreator />}
      {activeTab === 'runner' && <ExamRunner />}
      {activeTab === 'analytics' && <AnalyticsView />}
      {activeTab === 'architecture' && <ArchitectureDocs />}
    </div>
  );
}

export default function Page() {
  return (
    <QuizProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex selection:bg-cyan-500/30 selection:text-cyan-200">
        {/* Fixed Discord-Style Left Sidebar (or Mobile Bottom Nav) */}
        <DiscordSidebar />

        {/* Main Application Window Pane (Offset for Desktop Sidebar) */}
        <div className="flex-1 lg:pl-[76px] flex flex-col min-h-screen pb-16 lg:pb-0">
          {/* Top Discord Channel Header */}
          <DiscordChannelHeader />

          {/* Dynamic Content Pane with Instant Component Swapping */}
          <main className="flex-1 flex flex-col">
            <MainContent />
          </main>

          {/* Desktop Footer */}
          <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-400">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-300">ExamCraft Studio</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-slate-400">Technical Exam & Assessment Engine</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                <span>Discord SPA Layout</span>
                <span>Sub-Second Evaluation Core</span>
              </div>
            </div>
          </footer>
        </div>

        {/* 50% Sliding Window Panel (Discord/Thread Style) */}
        <SlidingThreadPanel />

        {/* Floating Frosted-Glass Window Modal Overlay */}
        <WindowModalOverlay />

        {/* Cinematic Initial Splash Screen */}
        <SplashScreen />
      </div>
    </QuizProvider>
  );
}

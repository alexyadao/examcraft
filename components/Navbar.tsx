'use client';

import React, { useState } from 'react';
import { useQuiz } from '@/context/QuizContext';
import { ActiveTab, UserRole } from '@/types/quiz';
import {
  Cpu,
  Layers,
  PenTool,
  PlayCircle,
  BarChart3,
  Terminal,
  RotateCcw,
  UserCheck,
  GraduationCap,
  Menu,
  X,
  CheckCircle2,
} from 'lucide-react';

export function Navbar() {
  const {
    activeTab,
    setActiveTab,
    activeRole,
    setActiveRole,
    resetDatabase,
    isResetting,
  } = useQuiz();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showResetNotice, setShowResetNotice] = useState(false);

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Layers className="w-4 h-4" /> },
    { id: 'creator', label: 'Question Studio', icon: <PenTool className="w-4 h-4" /> },
    { id: 'runner', label: 'Take Exam', icon: <PlayCircle className="w-4 h-4" /> },
    { id: 'analytics', label: 'Results & Scores', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'architecture', label: 'API Architecture', icon: <Terminal className="w-4 h-4" /> },
  ];

  const handleReset = async () => {
    await resetDatabase();
    setShowResetNotice(true);
    setTimeout(() => setShowResetNotice(false), 2400);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-950/85 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-2.5 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-md"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400 transition-colors shadow-sm">
                <Cpu className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-semibold tracking-tight text-slate-100 text-base">
                    ExamCraft
                  </span>
                  <span className="text-xs font-mono font-medium text-cyan-400/90 tracking-wider">
                    STUDIO
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-normal">
                  Technical Exam & Assessment Engine
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-all ${
                    isActive
                      ? 'bg-slate-900 text-cyan-300 border border-slate-700/80 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                  }`}
                >
                  <span className={isActive ? 'text-cyan-400' : 'text-slate-500'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Controls: Role Switcher & Database Reset */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Role Switcher */}
            <div className="flex items-center p-1 bg-slate-900/90 border border-slate-800 rounded-lg">
              <button
                type="button"
                onClick={() => setActiveRole('Instructor')}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeRole === 'Instructor'
                    ? 'bg-indigo-600/90 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Instructor role allows authoring, publishing, and modifying syllabus questions"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Instructor</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveRole('Candidate')}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeRole === 'Candidate'
                    ? 'bg-cyan-600/90 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Candidate mode simulates pure assessment environment"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Candidate</span>
              </button>
            </div>

            {/* Persistent Database Seed / Reset Button */}
            <button
              type="button"
              onClick={handleReset}
              disabled={isResetting}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                isResetting
                  ? 'bg-slate-900 text-slate-500 border-slate-800 cursor-wait'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700/70 hover:border-slate-600 active:scale-95'
              }`}
              title="Reset in-memory data and seeds back to original standard benchmark questions"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin text-cyan-400' : 'text-slate-400'}`} />
              <span>{isResetting ? 'Reseeding...' : 'Reset / Seed DB'}</span>
            </button>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Toast Banner */}
      {showResetNotice && (
        <div className="bg-emerald-950/90 border-b border-emerald-500/40 text-emerald-200 px-4 py-2 text-xs flex items-center justify-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Database successfully re-seeded to default benchmark exams & submissions.</span>
        </div>
      )}

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950 px-4 pt-3 pb-5 space-y-3">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-cyan-300 border border-slate-800'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                  }`}
                >
                  <span className={isActive ? 'text-cyan-400' : 'text-slate-500'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-md">
              <button
                onClick={() => setActiveRole('Instructor')}
                className={`px-2.5 py-1 text-xs rounded ${activeRole === 'Instructor' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
              >
                Instructor
              </button>
              <button
                onClick={() => setActiveRole('Candidate')}
                className={`px-2.5 py-1 text-xs rounded ${activeRole === 'Candidate' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}
              >
                Candidate
              </button>
            </div>

            <button
              onClick={handleReset}
              disabled={isResetting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-900 text-slate-300 rounded-lg border border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset DB</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

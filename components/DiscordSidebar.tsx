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
  GraduationCap,
  UserCheck,
  CheckCircle2,
  Compass,
} from 'lucide-react';

interface NavButtonProps {
  id: ActiveTab;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  badge?: string;
  accentColor?: string;
}

function DiscordNavButton({
  label,
  icon,
  isActive,
  onClick,
  badge,
  accentColor = 'bg-cyan-500',
}: NavButtonProps) {
  return (
    <div className="relative group flex items-center justify-center my-1.5">
      {/* Discord Left-Edge Pill Indicator (Desktop only) */}
      <span
        className={`hidden lg:block absolute left-0 w-1 bg-white rounded-r-full transition-all duration-300 ${
          isActive
            ? 'h-10 opacity-100'
            : 'h-2 opacity-0 group-hover:opacity-100 group-hover:h-5'
        }`}
      />

      {/* Interactive Squircle Icon Button */}
      <button
        onClick={onClick}
        aria-label={label}
        className={`relative w-12 h-12 flex items-center justify-center transition-all duration-300 focus:outline-none ${
          isActive
            ? `rounded-2xl ${accentColor} text-slate-950 font-bold shadow-lg shadow-cyan-500/25 scale-105`
            : 'rounded-3xl bg-slate-900/90 hover:rounded-2xl hover:bg-indigo-600 text-slate-400 hover:text-white border border-slate-800 hover:border-indigo-500/50'
        }`}
      >
        {icon}

        {badge && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center border-2 border-slate-950">
            {badge}
          </span>
        )}
      </button>

      {/* Discord Floating Right Tooltip (Desktop only) */}
      <div className="hidden lg:flex absolute left-16 z-50 pointer-events-none items-center opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-3 transition-all duration-200">
        <div className="bg-slate-900 text-slate-100 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-2xl border border-slate-700 whitespace-nowrap">
          {label}
        </div>
      </div>
    </div>
  );
}

export function DiscordSidebar() {
  const {
    activeTab,
    setActiveTab,
    activeRole,
    setActiveRole,
    resetDatabase,
    isResetting,
    openExamModal,
    openCreatorModal,
    exams,
  } = useQuiz();

  const [showResetNotice, setShowResetNotice] = useState(false);

  const handleReset = async () => {
    await resetDatabase();
    setShowResetNotice(true);
    setTimeout(() => setShowResetNotice(false), 2400);
  };

  return (
    <>
      {/* ============================================================== */}
      {/* DESKTOP DISCORD SIDEBAR (Fixed left vertical column, w-[76px]) */}
      {/* ============================================================== */}
      <aside className="hidden lg:flex fixed top-0 left-0 bottom-0 w-[76px] bg-slate-950/95 backdrop-blur-xl border-r border-slate-800/80 z-40 flex-col items-center py-3 select-none justify-between">
        {/* Top: Brand Logo */}
        <div className="flex flex-col items-center w-full">
          <div className="relative group flex items-center justify-center mb-2">
            <span className="absolute left-0 w-1 bg-cyan-400 rounded-r-full h-5 opacity-0 group-hover:opacity-100 transition-all duration-300" />
            <button
              onClick={() => setActiveTab('home')}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-cyan-500/40 hover:border-cyan-400 flex items-center justify-center text-cyan-400 hover:text-white transition-all shadow-md group-hover:rounded-xl"
              title="ExamCraft Studio"
            >
              <Cpu className="w-6 h-6 animate-pulse" />
            </button>
            {/* Tooltip */}
            <div className="absolute left-16 z-50 pointer-events-none items-center opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-3 transition-all duration-200">
              <div className="bg-slate-900 text-cyan-300 text-xs font-bold px-3 py-1.5 rounded-lg shadow-2xl border border-slate-700 whitespace-nowrap">
                ExamCraft
              </div>
            </div>
          </div>

          {/* Discord Divider */}
          <div className="w-8 h-[2px] bg-slate-800/80 rounded-full my-1.5" />

          {/* Navigation Servers / Views */}
          <div className="flex flex-col items-center w-full space-y-0.5">
            <DiscordNavButton
              id="home"
              label="Home"
              icon={<Compass className="w-5 h-5" />}
              isActive={activeTab === 'home'}
              onClick={() => setActiveTab('home')}
              accentColor="bg-cyan-400"
            />

            <DiscordNavButton
              id="creator"
              label="Question Studio"
              icon={<PenTool className="w-5 h-5" />}
              isActive={activeTab === 'creator'}
              onClick={() => {
                setActiveTab('creator');
                openCreatorModal();
              }}
              accentColor="bg-indigo-500"
            />

            <DiscordNavButton
              id="runner"
              label="Take Exam"
              icon={<PlayCircle className="w-5 h-5" />}
              isActive={activeTab === 'runner'}
              onClick={() => {
                setActiveTab('runner');
                openExamModal(exams[0]?.id);
              }}
              badge={String(exams.length)}
              accentColor="bg-emerald-400"
            />

            <DiscordNavButton
              id="analytics"
              label="Results & Scores"
              icon={<BarChart3 className="w-5 h-5" />}
              isActive={activeTab === 'analytics'}
              onClick={() => setActiveTab('analytics')}
              accentColor="bg-amber-400"
            />

            <DiscordNavButton
              id="architecture"
              label="REST API & Architecture Docs"
              icon={<Terminal className="w-5 h-5" />}
              isActive={activeTab === 'architecture'}
              onClick={() => setActiveTab('architecture')}
              accentColor="bg-cyan-300"
            />
          </div>
        </div>

        {/* Bottom Actions: Role Switcher & Database Reset */}
        <div className="flex flex-col items-center w-full space-y-3 pt-3 border-t border-slate-800/80">
          {/* Role Indicator / Switcher */}
          <div className="relative group flex items-center justify-center">
            <button
              suppressHydrationWarning
              onClick={() =>
                setActiveRole(activeRole === 'Instructor' ? 'Candidate' : 'Instructor')
              }
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                activeRole === 'Instructor'
                  ? 'bg-indigo-950 border border-indigo-500/50 text-indigo-300 hover:border-indigo-400'
                  : 'bg-cyan-950 border border-cyan-500/50 text-cyan-300 hover:border-cyan-400'
              }`}
              title={`Role: ${activeRole} (Click to toggle)`}
            >
              {activeRole === 'Instructor' ? (
                <GraduationCap className="w-5 h-5" />
              ) : (
                <UserCheck className="w-5 h-5" />
              )}
            </button>
            <div className="absolute left-16 z-50 pointer-events-none items-center opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-3 transition-all duration-200">
              <div
                suppressHydrationWarning
                className="bg-slate-900 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-2xl border border-slate-700 whitespace-nowrap"
              >
                Role: <span className="text-cyan-400">{activeRole}</span> (Click to switch)
              </div>
            </div>
          </div>

          {/* Persistent Reset DB Button */}
          <div className="relative group flex items-center justify-center">
            <button
              onClick={handleReset}
              disabled={isResetting}
              className={`w-11 h-11 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center transition-all hover:bg-slate-800 hover:border-slate-700 ${
                isResetting ? 'cursor-wait opacity-60' : 'text-slate-400 hover:text-white'
              }`}
              title="Reset / Seed Database"
            >
              <RotateCcw
                className={`w-4 h-4 ${isResetting ? 'animate-spin text-cyan-400' : ''}`}
              />
            </button>
            <div className="absolute left-16 z-50 pointer-events-none items-center opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-3 transition-all duration-200">
              <div className="bg-slate-900 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-2xl border border-slate-700 whitespace-nowrap">
                Reset / Seed Database
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* MOBILE DISCORD BOTTOM TAB BAR (Fixed bottom, lg:hidden)       */}
      {/* ============================================================== */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 z-50 flex items-center justify-around px-2">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center p-1 rounded-xl transition-colors ${
            activeTab === 'home' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Home</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('creator');
            openCreatorModal();
          }}
          className={`flex flex-col items-center justify-center p-1 rounded-xl transition-colors ${
            activeTab === 'creator' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <PenTool className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Question Studio</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('runner');
            openExamModal(exams[0]?.id);
          }}
          className={`flex flex-col items-center justify-center p-1 rounded-xl transition-colors ${
            activeTab === 'runner' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <PlayCircle className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Take Exam</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex flex-col items-center justify-center p-1 rounded-xl transition-colors ${
            activeTab === 'analytics' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Results & Scores</span>
        </button>

        <button
          onClick={() => setActiveTab('architecture')}
          className={`flex flex-col items-center justify-center p-1 rounded-xl transition-colors ${
            activeTab === 'architecture' ? 'text-cyan-300' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">API</span>
        </button>
      </nav>

      {/* Reset Confirmation Toast Banner */}
      {showResetNotice && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-2xl animate-fade-in backdrop-blur-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Database successfully re-seeded to default benchmark exams & submissions.</span>
        </div>
      )}
    </>
  );
}

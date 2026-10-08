'use client';

import React, { useState } from 'react';
import { useQuiz } from '@/context/QuizContext';
import {
  Layers,
  Clock,
  Award,
  ChevronRight,
  Search,
  PlusCircle,
  FileQuestion,
  BarChart,
  CheckCircle2,
  X,
  Code2,
  Sparkles,
  Terminal,
} from 'lucide-react';

export function HomePortal() {
  const {
    exams,
    questions,
    submissions,
    openSlidingPanel,
    openCreatorModal,
    setActiveTab,
    activeRole,
  } = useQuiz();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Compute live statistics
  const activeExamsCount = exams.length;
  const totalQuestionsCount = questions.length;
  const completedCount = submissions.length;
  const avgScore =
    completedCount > 0
      ? Math.round(
          submissions.reduce((acc, s) => acc + s.scorePercent, 0) / completedCount
        )
      : 0;

  // Filter categories
  const categories = ['All', 'Database Systems', 'Computer Engineering', 'Networking Protocols'];

  const filteredExams = exams.filter((exam) => {
    const matchesSearch =
      exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || exam.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Section with Clean Window Aesthetic */}
      <section className="relative overflow-hidden rounded-2xl bg-slate-900/70 border border-slate-800/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] p-6 sm:p-10 backdrop-blur-md">
        {/* Soft Ambient Depth Glow */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-wider text-cyan-400 bg-cyan-950/40 px-3 py-1 rounded-full border border-cyan-500/30">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            EXAMCRAFT STUDIO · TECHNICAL EXAM & ASSESSMENT ENGINE
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            The Modern Technical Exam & Assessment Studio
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Create custom test question banks, run timed technical assessments, and inspect real-time evaluation data.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                if (exams.length > 0) openSlidingPanel(exams[0], 'runner');
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md shadow-cyan-500/20 active:scale-95"
            >
              <span>Launch First Assessment</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            {activeRole === 'Instructor' && (
              <button
                onClick={openCreatorModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-semibold text-xs sm:text-sm transition-all active:scale-95"
              >
                <PlusCircle className="w-4 h-4 text-cyan-400" />
                <span>Create Custom Question</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('architecture')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 font-medium text-xs sm:text-sm border border-slate-800 transition-all"
            >
              <Code2 className="w-4 h-4 text-indigo-400" />
              <span>Explore REST API Docs</span>
            </button>
          </div>
        </div>

        {/* Crisp Desktop Telemetry Panels (Reset 3D State: Straight, Crisp, Glassmorphism) */}
        <div className="mt-8 pt-8 border-t border-slate-800/80 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] p-4 sm:p-5 transition-all duration-300 hover:-translate-y-1 hover:border-slate-700">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Active Exams</span>
              <Layers className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{activeExamsCount}</div>
            <div className="text-[11px] text-slate-400 mt-1">Syllabus tracks deployed</div>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] p-4 sm:p-5 transition-all duration-300 hover:-translate-y-1 hover:border-slate-700">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Question Bank</span>
              <FileQuestion className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{totalQuestionsCount}</div>
            <div className="text-[11px] text-slate-400 mt-1">Peer-reviewed items</div>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] p-4 sm:p-5 transition-all duration-300 hover:-translate-y-1 hover:border-slate-700">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Completed Assessments</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{completedCount}</div>
            <div className="text-[11px] text-slate-400 mt-1">Automated evaluations</div>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] p-4 sm:p-5 transition-all duration-300 hover:-translate-y-1 hover:border-slate-700">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Cohort Average</span>
              <BarChart className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-cyan-300 tracking-tight">{avgScore}%</div>
            <div className="text-[11px] text-slate-400 mt-1">Benchmark passing: 70%</div>
          </div>
        </div>
      </section>

      {/* Curriculum Catalog Header & Filters */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <Terminal className="w-3.5 h-3.5" />
              <span>CURRICULUM SPECIFICATION REPOSITORY</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-0.5">
              Available Certification Exams
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select an exam track to trigger the 50% sliding thread panel or launch live assessment.
            </p>
          </div>

          {/* Search & Category Filter Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tracks..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Segmented Category Buttons */}
            <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    selectedCategory === cat
                      ? 'bg-slate-800 text-cyan-300 font-medium shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat === 'All' ? 'All' : cat.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Window Curriculum Cards (Clean, Straight, Window Chrome with macOS Dots) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam) => {
            const totalPoints = exam.questions.reduce((sum, q) => sum + (q.pointWeight || 1), 0);
            const specCode = `pkg::${exam.category.toLowerCase().replace(/\s+/g, '-')}.spec`;

            return (
              <div
                key={exam.id}
                className="group flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/10 cursor-pointer"
                onClick={() => openSlidingPanel(exam, 'syllabus')}
              >
                <div>
                  {/* Mini Window Chrome Header Bar with macOS Dots & Monospace Spec Badge */}
                  <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-800/70 select-none">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 transition-colors group-hover:bg-rose-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 transition-colors group-hover:bg-amber-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 transition-colors group-hover:bg-emerald-400" />
                    </div>

                    <div className="font-mono text-[11px] text-cyan-400/90 bg-slate-950/80 px-2 py-0.5 rounded-md border border-slate-800">
                      {specCode}
                    </div>
                  </div>

                  {/* Clean unboxed metadata kicker */}
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                    <span className="font-mono text-cyan-400">{exam.category}</span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className={exam.difficulty === 'Hard' ? 'text-amber-400' : 'text-emerald-400'}>
                      {exam.difficulty}
                    </span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span>{exam.questions.length} questions</span>
                  </div>

                  {/* Exam Title */}
                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug">
                    {exam.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed mt-2">
                    {exam.description}
                  </p>
                </div>

                {/* Footer Specs & Actions */}
                <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-4">
                  {/* Exam Specs Strip */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800/60">
                      <div className="text-slate-400 flex items-center justify-center gap-1">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        <span>Duration</span>
                      </div>
                      <div className="font-semibold text-slate-200 mt-0.5">{exam.durationMinutes} min</div>
                    </div>
                    <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800/60">
                      <div className="text-slate-400 flex items-center justify-center gap-1">
                        <Award className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Weight</span>
                      </div>
                      <div className="font-semibold text-slate-200 mt-0.5">{totalPoints} pts</div>
                    </div>
                    <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800/60">
                      <div className="text-slate-400">Pass Mark</div>
                      <div className="font-semibold text-emerald-400 mt-0.5">{exam.passingScorePercent}%</div>
                    </div>
                  </div>

                  {/* Card Action Buttons: Triggers 50% Sliding Thread Panel */}
                  <div className="flex items-center gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => openSlidingPanel(exam, 'runner')}
                      className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20 active:scale-95"
                    >
                      <span>Start Exam</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openSlidingPanel(exam, 'syllabus')}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
                      title="Inspect Syllabus in Side Panel"
                    >
                      Syllabus
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredExams.length === 0 && (
          <div className="p-8 text-center bg-slate-900/50 border border-slate-800 rounded-2xl space-y-3">
            <FileQuestion className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-300">No matching exams found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try adjusting your search keywords or resetting your category filter to see all active assessment modules.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="text-xs text-cyan-400 hover:underline inline-block mt-2"
            >
              Reset filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

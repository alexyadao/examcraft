'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQuiz } from '@/context/QuizContext';
import {
  Timer,
  CheckCircle2,
  XCircle,
  Flag,
  ChevronLeft,
  ChevronRight,
  Send,
  RotateCcw,
  BarChart3,
  Terminal,
  Code2,
  AlertTriangle,
  Award,
  Clock,
  Sparkles,
} from 'lucide-react';

export function ExamRunner() {
  const {
    exams,
    selectedExamId,
    setSelectedExamId,
    candidateName,
    setCandidateName,
    submitCandidateExam,
    lastEvaluation,
    setLastEvaluation,
    setActiveTab,
  } = useQuiz();

  // Find active exam
  const currentExam = exams.find((e) => e.id === selectedExamId) || exams[0];

  // Exam runner internal state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({}); // questionId -> optionId
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(
    (currentExam?.durationMinutes || 20) * 60
  );
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Time elapsed tracker
  const totalSecondsAllocated = (currentExam?.durationMinutes || 20) * 60;
  const timeSpentSeconds = Math.max(0, totalSecondsAllocated - timeRemainingSeconds);

  // Reset exam session when changing exam or when retaking
  const handleResetExam = (examId = currentExam.id) => {
    setSelectedExamId(examId);
    setAnswers({});
    setFlaggedQuestions({});
    setCurrentQuestionIndex(0);
    const target = exams.find((e) => e.id === examId) || exams[0];
    setTimeRemainingSeconds((target?.durationMinutes || 20) * 60);
    setIsTimerRunning(true);
    setLastEvaluation(null);
  };

  const submitRef = useRef<() => void>(() => {});

  const handleFinalSubmit = React.useCallback(async () => {
    setIsSubmitting(true);
    try {
      await submitCandidateExam(currentExam.id, answers, timeSpentSeconds);
      setIsTimerRunning(false);
      setShowSubmitModal(false);
    } finally {
      setIsSubmitting(false);
    }
  }, [currentExam.id, answers, timeSpentSeconds, submitCandidateExam]);

  useEffect(() => {
    submitRef.current = handleFinalSubmit;
  }, [handleFinalSubmit]);

  // Timer countdown hook
  useEffect(() => {
    if (!isTimerRunning || lastEvaluation) return;

    const interval = setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsTimerRunning(false);
          // Auto submit on time expiry
          submitRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, lastEvaluation]);

  const questions = currentExam?.questions || [];
  const currentQ = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const progressPercent = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  // Format time mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const toggleFlag = (questionId: string) => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  // ----------------------------------------------------
  // SUBMISSION EVALUATION RESULT VIEW
  // ----------------------------------------------------
  if (lastEvaluation) {
    const isPassing = lastEvaluation.passed;
    const minutesTaken = Math.floor(lastEvaluation.timeSpentSeconds / 60);
    const secondsTaken = lastEvaluation.timeSpentSeconds % 60;

    return (
      <div className="space-y-8 pb-16 animate-fade-in">
        {/* Banner */}
        <div
          className={`rounded-2xl border p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
            isPassing
              ? 'bg-emerald-950/40 border-emerald-500/40'
              : 'bg-rose-950/40 border-rose-500/40'
          }`}
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className={isPassing ? 'text-emerald-400' : 'text-rose-400'}>
                {isPassing ? 'ASSESSMENT PASSED' : 'BENCHMARK NOT MET'}
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-400">ID: {lastEvaluation.submissionId}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {lastEvaluation.examTitle}
            </h1>

            <div className="text-xs text-slate-300">
              Candidate: <strong className="text-white">{lastEvaluation.candidateName}</strong> · Completed in{' '}
              {minutesTaken}m {secondsTaken}s
            </div>
          </div>

          {/* Big Score Box */}
          <div className="flex items-center gap-4 bg-slate-950/80 p-4 sm:p-5 rounded-2xl border border-slate-800/80 shrink-0">
            <div className="text-center">
              <div
                className={`text-4xl sm:text-5xl font-black tracking-tight ${
                  isPassing ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {lastEvaluation.scorePercent}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {lastEvaluation.earnedPoints} / {lastEvaluation.totalPoints} Points
              </div>
            </div>

            <div className="border-l border-slate-800 pl-4 text-xs space-y-1">
              <div className="text-slate-400">Passing Grade:</div>
              <div className="text-slate-200 font-semibold">{lastEvaluation.passingScorePercent}%</div>
              <div className={`text-[11px] font-bold ${isPassing ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isPassing ? 'Certified Competent' : 'Remediation Required'}
              </div>
            </div>
          </div>
        </div>

        {/* Categorized Performance Report */}
        <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              <span>Categorized Performance Diagnostic</span>
            </h2>
            <span className="text-xs text-slate-400">Domain Competency Breakdown</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(lastEvaluation.categoryBreakdown).map(([catName, stats]) => (
              <div
                key={catName}
                className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{catName}</span>
                  <span
                    className={`font-mono font-bold ${
                      stats.percentage >= 70 ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {stats.percentage}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all ${
                      stats.percentage >= 70 ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${stats.percentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>
                    Questions: {stats.correctCount} of {stats.questionCount} correct
                  </span>
                  <span>
                    {stats.earnedPoints} / {stats.totalPoints} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Detailed Question-by-Question Audit Review */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Itemized Question Analysis & Solutions</h2>
            <span className="text-xs text-slate-400">
              {lastEvaluation.details.length} Items Evaluated
            </span>
          </div>

          <div className="space-y-4">
            {lastEvaluation.details.map((detail, idx) => (
              <div
                key={detail.questionId}
                className={`rounded-2xl border p-5 sm:p-6 space-y-4 ${
                  detail.isCorrect
                    ? 'bg-slate-900/60 border-emerald-500/30'
                    : 'bg-slate-900/60 border-rose-500/30'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-slate-400 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-cyan-400">Item {idx + 1}</span>
                    <span aria-hidden="true">·</span>
                    <span>{detail.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{detail.difficulty}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {detail.isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-xs">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Correct (+{detail.pointsEarned} pts)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-400 font-semibold text-xs">
                        <XCircle className="w-4 h-4" />
                        <span>Incorrect (0 / {detail.pointsPossible} pts)</span>
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">{detail.questionTitle}</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{detail.prompt}</p>
                </div>

                {/* Candidate Selection vs Correct */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                  <div
                    className={`p-3 rounded-xl border ${
                      detail.isCorrect
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                        : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                    }`}
                  >
                    <div className="text-[11px] font-semibold uppercase tracking-wider mb-1 text-slate-400">
                      Your Selected Answer:
                    </div>
                    <div>{detail.selectedOptionText || '(Unanswered / Skipped)'}</div>
                  </div>

                  <div className="p-3 rounded-xl border bg-slate-950 border-slate-800 text-slate-200">
                    <div className="text-[11px] font-semibold uppercase tracking-wider mb-1 text-emerald-400">
                      Correct Benchmark Answer:
                    </div>
                    <div>{detail.correctOptionText}</div>
                  </div>
                </div>

                {/* Explanation */}
                <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800/80 text-xs space-y-1">
                  <div className="font-semibold text-indigo-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Technical Rationale:</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{detail.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Post-Exam Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <button
            onClick={() => handleResetExam(currentExam.id)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-cyan-400" />
            <span>Retake This Exam</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('analytics')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              <span>View in Analytics Hub</span>
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium text-xs border border-slate-800 transition-colors"
            >
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Inspect API Payload</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // ACTIVE TEST-TAKING EXPERIENCE
  // ----------------------------------------------------
  if (!currentExam || questions.length === 0) {
    return (
      <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <h3 className="text-lg font-bold text-white">No active exam selected</h3>
        <p className="text-xs text-slate-400">Please choose a track from the Home Portal catalog.</p>
        <button
          onClick={() => setActiveTab('home')}
          className="px-4 py-2 bg-cyan-500 text-slate-950 font-semibold text-xs rounded-xl"
        >
          Browse Exams
        </button>
      </div>
    );
  }

  const isLowTime = timeRemainingSeconds < 120; // under 2 minutes
  const isAnswered = currentQ ? Boolean(answers[currentQ.id]) : false;
  const isFlagged = currentQ ? Boolean(flaggedQuestions[currentQ.id]) : false;

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner: Exam Title, Track selector, Candidate Profile, Timer */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-mono text-cyan-400">{currentExam.category}</span>
              <span aria-hidden="true">·</span>
              <span>Passing: {currentExam.passingScorePercent}%</span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-white leading-tight">
              {currentExam.title}
            </h1>
          </div>
        </div>

        {/* Right side: Candidate name & Countdown Timer */}
        <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end">
          {/* Candidate profile indicator */}
          <div className="text-right hidden sm:block">
            <div className="text-[10px] uppercase font-semibold text-slate-400">Test-Taker</div>
            <input
              type="text"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              className="text-xs font-semibold text-slate-200 bg-transparent text-right border-b border-dashed border-slate-700 hover:border-cyan-400 focus:outline-none focus:border-cyan-400 px-1 py-0.5"
              title="Click to edit test-taker name"
            />
          </div>

          {/* Timer Display */}
          <div
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border font-mono font-bold text-sm ${
              isLowTime
                ? 'bg-rose-950/60 border-rose-500/50 text-rose-300 animate-pulse'
                : 'bg-slate-950 border-slate-800 text-cyan-300'
            }`}
          >
            <Timer className={`w-4 h-4 ${isLowTime ? 'text-rose-400' : 'text-cyan-400'}`} />
            <span>{formatTime(timeRemainingSeconds)}</span>
          </div>
        </div>
      </div>

      {/* Progress & Quick Navigation Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-slate-400">
              {answeredCount} of {questions.length} Answered ({progressPercent}%)
            </span>
          </div>

          <div className="text-xs text-slate-400">
            {Object.keys(flaggedQuestions).filter((k) => flaggedQuestions[k]).length > 0 && (
              <span className="text-amber-400 inline-flex items-center gap-1">
                <Flag className="w-3.5 h-3.5" />
                <span>
                  {Object.keys(flaggedQuestions).filter((k) => flaggedQuestions[k]).length} Flagged
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800/80">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Question Index Grid */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          {questions.map((q, idx) => {
            const hasAnswer = Boolean(answers[q.id]);
            const isFlag = Boolean(flaggedQuestions[q.id]);
            const isCurrent = idx === currentQuestionIndex;

            return (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`relative w-8 h-8 rounded-lg text-xs font-mono font-medium transition-all ${
                  isCurrent
                    ? 'ring-2 ring-cyan-400 bg-cyan-500/20 text-cyan-200 border border-cyan-400/50'
                    : hasAnswer
                    ? 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700'
                    : 'bg-slate-950 text-slate-500 border border-slate-800/80 hover:text-slate-300'
                }`}
                title={`Jump to Question ${idx + 1}`}
              >
                <span>{idx + 1}</span>
                {isFlag && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full ring-2 ring-slate-950" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Question Card */}
      {currentQ && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between text-xs text-slate-400 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="font-mono text-cyan-400">{currentQ.category}</span>
              <span aria-hidden="true">·</span>
              <span className={currentQ.difficulty === 'Hard' ? 'text-amber-400' : 'text-emerald-400'}>
                {currentQ.difficulty}
              </span>
              <span aria-hidden="true">·</span>
              <span>{currentQ.type.replace('-', ' ')}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => toggleFlag(currentQ.id)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                  isFlagged
                    ? 'bg-amber-950/60 border-amber-500/50 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Flag className={`w-3.5 h-3.5 ${isFlagged ? 'fill-amber-400' : ''}`} />
                <span>{isFlagged ? 'Flagged for Review' : 'Flag Question'}</span>
              </button>

              <span className="font-semibold text-slate-300">{currentQ.pointWeight} pts</span>
            </div>
          </div>

          {/* Title & Prompt */}
          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
              {currentQ.title}
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">{currentQ.prompt}</p>
          </div>

          {/* Code Snippet Viewer */}
          {currentQ.codeSnippet && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono text-cyan-400/90">Snippet ({currentQ.codeLanguage || 'sql'})</span>
                <span className="text-[11px] text-slate-500">Read-only buffer</span>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-x-auto font-mono text-xs text-emerald-300 leading-relaxed shadow-inner">
                <pre>{currentQ.codeSnippet}</pre>
              </div>
            </div>
          )}

          {/* Options Choice List */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Select Response:
            </div>

            <div className="space-y-2.5">
              {currentQ.options.map((option, idx) => {
                const isSelected = answers[currentQ.id] === option.id;
                const letter = String.fromCharCode(65 + idx);

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelectOption(currentQ.id, option.id)}
                    className={`w-full p-4 rounded-xl border text-left flex items-start gap-3.5 transition-all ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-400 text-white shadow-sm ring-1 ring-cyan-400/50'
                        : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5 transition-colors ${
                        isSelected
                          ? 'bg-cyan-500 text-slate-950'
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {letter}
                    </div>

                    <div className="flex-1 text-xs sm:text-sm leading-relaxed">{option.text}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls: Prev, Next, Submit */}
          <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-950 text-slate-300 font-medium text-xs border border-slate-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                disabled={currentQuestionIndex === questions.length - 1}
                onClick={() =>
                  setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))
                }
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-950 text-slate-300 font-medium text-xs border border-slate-800 transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors shadow-md shadow-cyan-500/20 active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Assessment</span>
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Confirm Final Submission?</h3>
                <p className="text-xs text-slate-400">Evaluation engine will grade your answers.</p>
              </div>
            </div>

            {answeredCount < questions.length && (
              <div className="p-3 bg-amber-950/60 border border-amber-500/40 rounded-xl text-xs text-amber-200 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  You have answered <strong>{answeredCount}</strong> of <strong>{questions.length}</strong> questions. Unanswered questions will receive 0 points.
                </span>
              </div>
            )}

            <div className="text-xs text-slate-300 space-y-1">
              <div>Exam: <span className="text-white font-medium">{currentExam.title}</span></div>
              <div>Candidate: <span className="text-white font-medium">{candidateName}</span></div>
              <div>Elapsed Time: <span className="text-white font-mono">{formatTime(timeSpentSeconds)}</span></div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:text-white"
              >
                Back to Exam
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinalSubmit}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs"
              >
                {isSubmitting ? 'Evaluating...' : 'Confirm & Score Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

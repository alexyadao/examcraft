'use client';

import React, { useState } from 'react';
import { useQuiz } from '@/context/QuizContext';
import { ExamSubmission } from '@/types/quiz';
import { CategoryTrendsChart } from '@/components/CategoryTrendsChart';
import {
  BarChart3,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Download,
  Calendar,
  Clock,
  Award,
  ChevronRight,
  X,
  FileText,
  Sparkles,
} from 'lucide-react';

export function AnalyticsView() {
  const { submissions, exams } = useQuiz();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Passed' | 'Failed'>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [selectedSubmission, setSelectedSubmission] = useState<ExamSubmission | null>(null);

  // Compute aggregate statistics
  const totalSubmissions = submissions.length;
  const passedCount = submissions.filter((s) => s.passed).length;
  const passRate = totalSubmissions > 0 ? Math.round((passedCount / totalSubmissions) * 100) : 0;
  const avgScore =
    totalSubmissions > 0
      ? Math.round(submissions.reduce((acc, s) => acc + s.scorePercent, 0) / totalSubmissions)
      : 0;
  const highestScore =
    totalSubmissions > 0
      ? Math.max(...submissions.map((s) => s.scorePercent))
      : 0;

  // Filter categories
  const categories = ['All', 'Database Systems', 'Computer Engineering', 'Networking Protocols'];

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch =
      sub.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.examTitle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'All'
        ? true
        : statusFilter === 'Passed'
        ? sub.passed
        : !sub.passed;

    const examObj = exams.find((e) => e.id === sub.examId);
    const matchesCategory =
      categoryFilter === 'All' ||
      (examObj && examObj.category.toLowerCase() === categoryFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const exportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(submissions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `examcraft_analytics_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportCSV = () => {
    const headers = ['ID', 'Candidate', 'Exam Title', 'Score %', 'Points Earned', 'Total Points', 'Status', 'Time Spent (s)', 'Submitted At'];
    const rows = submissions.map((s) => [
      s.id,
      `"${s.candidateName.replace(/"/g, '""')}"`,
      `"${s.examTitle.replace(/"/g, '""')}"`,
      s.scorePercent,
      s.earnedPoints,
      s.totalPoints,
      s.passed ? 'PASSED' : 'FAILED',
      s.timeSpentSeconds,
      s.submittedAt,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', `examcraft_scores_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <BarChart3 className="w-4 h-4" />
            <span>EXAMINATION TELEMETRY · COHORT ANALYTICS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Analytics & Candidate Scores
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Evaluate cohort performance, verify passing certifications, and review submission diagnostics.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={exportJSON}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/30 text-indigo-300 hover:text-indigo-100 text-xs font-medium transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Aggregate KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
          <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
            <span>Total Submissions</span>
            <FileText className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight">{totalSubmissions}</div>
          <div className="text-[11px] text-slate-500 mt-1">Recorded assessments</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
          <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
            <span>Cohort Average</span>
            <Award className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-cyan-300 tracking-tight">{avgScore}%</div>
          <div className="text-[11px] text-slate-500 mt-1">Overall percentage</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
          <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
            <span>Certification Pass Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 tracking-tight">{passRate}%</div>
          <div className="text-[11px] text-slate-500 mt-1">{passedCount} certified candidates</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
          <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
            <span>Peak Score</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-300 tracking-tight">{highestScore}%</div>
          <div className="text-[11px] text-slate-500 mt-1">High watermark</div>
        </div>
      </div>

      {/* Visual Category Performance Trends Chart (Recharts) */}
      <CategoryTrendsChart submissions={submissions} />

      {/* Filter Toolbar */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate name or exam title..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl text-xs">
            {(['All', 'Passed', 'Failed'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  statusFilter === st
                    ? 'bg-slate-800 text-white font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Breakdown Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-5">Candidate</th>
                <th className="py-3.5 px-4">Exam Module</th>
                <th className="py-3.5 px-4 text-center">Score %</th>
                <th className="py-3.5 px-4 text-center">Points</th>
                <th className="py-3.5 px-4 text-center">Outcome</th>
                <th className="py-3.5 px-4">Duration</th>
                <th className="py-3.5 px-4">Submitted</th>
                <th className="py-3.5 px-5 text-right">Diagnostic</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs">
              {filteredSubmissions.map((sub) => {
                const minutes = Math.floor(sub.timeSpentSeconds / 60);
                const seconds = sub.timeSpentSeconds % 60;
                const formattedDate = new Date(sub.submittedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });

                return (
                  <tr
                    key={sub.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="py-4 px-5">
                      <div className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
                        {sub.candidateName}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">{sub.id}</div>
                    </td>

                    <td className="py-4 px-4 text-slate-300 max-w-xs">
                      <div className="font-medium truncate">{sub.examTitle}</div>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span
                        className={`font-mono font-bold text-sm ${
                          sub.passed ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {sub.scorePercent}%
                      </span>
                    </td>

                    <td className="py-4 px-4 text-center font-mono text-slate-300">
                      {sub.earnedPoints} / {sub.totalPoints}
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${
                          sub.passed
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-950/60 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {sub.passed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{sub.passed ? 'PASSED' : 'FAILED'}</span>
                      </span>
                    </td>

                    <td className="py-4 px-4 text-slate-400 font-mono text-[11px]">
                      {minutes}m {seconds}s
                    </td>

                    <td className="py-4 px-4 text-slate-400 text-[11px]">{formattedDate}</td>

                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => setSelectedSubmission(sub)}
                        className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                      >
                        <span>Audit</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredSubmissions.length === 0 && (
          <div className="p-10 text-center space-y-2">
            <p className="text-sm font-semibold text-slate-300">No submissions found</p>
            <p className="text-xs text-slate-500">
              Try adjusting your search criteria or take an exam to generate your first submission record.
            </p>
          </div>
        )}
      </div>

      {/* Submission Diagnostic Audit Drawer/Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="font-mono text-cyan-400">SUBMISSION AUDIT</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedSubmission.id}</span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">
                  {selectedSubmission.candidateName} — {selectedSubmission.examTitle}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400">Final Score</div>
                  <div className={`text-2xl font-black mt-0.5 ${selectedSubmission.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {selectedSubmission.scorePercent}%
                  </div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400">Points Earned</div>
                  <div className="text-lg font-bold text-white mt-0.5">
                    {selectedSubmission.earnedPoints} / {selectedSubmission.totalPoints}
                  </div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400">Status</div>
                  <div className={`text-sm font-bold mt-1 ${selectedSubmission.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {selectedSubmission.passed ? 'CERTIFIED' : 'FAILED'}
                  </div>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Category Competency Diagnostics
                </span>
                <div className="space-y-2">
                  {Object.entries(selectedSubmission.categoryBreakdown).map(([cat, stats]) => (
                    <div key={cat} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">{cat}</span>
                        <span className="font-mono text-cyan-400">{stats.percentage}%</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full ${stats.percentage >= 70 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                          style={{ width: `${stats.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Answers record */}
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Recorded Answer Map
                </span>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-slate-300">
                  <pre>{JSON.stringify(selectedSubmission.answers, null, 2)}</pre>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 flex items-center justify-end">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

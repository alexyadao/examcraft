'use client';

import React, { useState, useMemo, useSyncExternalStore } from 'react';
import { ExamSubmission } from '@/types/quiz';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  BarChart,
  Bar,
} from 'recharts';
import {
  TrendingUp,
  Activity,
  BarChart2,
  Filter,
} from 'lucide-react';

interface CategoryTrendsChartProps {
  submissions: ExamSubmission[];
}

function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

// Module-level Custom Dark Tooltip Component
function CustomLineTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;

  const currentItem = payload[0]?.payload;

  return (
    <div className="bg-slate-900/95 border border-slate-700/80 rounded-xl p-3.5 shadow-2xl backdrop-blur-md text-xs space-y-2 min-w-[200px]">
      <div className="border-b border-slate-800 pb-1.5">
        <div className="font-semibold text-white">{currentItem?.candidate || label}</div>
        <div className="text-[11px] text-slate-400">
          {currentItem?.fullDate || currentItem?.date} · {currentItem?.examTitle || 'Quiz Assessment'}
        </div>
      </div>

      <div className="space-y-1">
        {payload.map((entry: any, i: number) => {
          if (entry.value === null || entry.value === undefined) return null;
          if (entry.dataKey === 'benchmark') return null;

          return (
            <div key={i} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-slate-300">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                <span>{entry.name}:</span>
              </div>
              <span className="font-mono font-bold text-white">{entry.value}%</span>
            </div>
          );
        })}

        {currentItem?.benchmark && (
          <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Benchmark Target:</span>
            <span className="font-mono text-slate-300">{currentItem.benchmark}%</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Module-level Bar Tooltip Component
function CustomBarTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0]?.payload;
  return (
    <div className="bg-slate-900/95 border border-slate-700/80 rounded-xl p-3 shadow-2xl text-xs space-y-1">
      <div className="font-semibold text-white">{label}</div>
      <div className="text-cyan-300 font-mono">Average Score: {item?.avgScore}%</div>
      <div className="text-slate-400 text-[11px]">
        Pass Rate: {item?.passRate}% · Peak Score: {item?.maxScore}%
      </div>
    </div>
  );
}

export function CategoryTrendsChart({ submissions }: CategoryTrendsChartProps) {
  const mounted = useMounted();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [chartMode, setChartMode] = useState<'line' | 'bar'>('line');
  const [selectedCandidate, setSelectedCandidate] = useState<string>('All');

  // Unique candidates list
  const candidates = useMemo(() => {
    const list = Array.from(new Set(submissions.map((s) => s.candidateName)));
    return ['All', ...list];
  }, [submissions]);

  // Chronologically sorted submissions filtered by candidate
  const sortedSubmissions = useMemo(() => {
    const filtered =
      selectedCandidate === 'All'
        ? submissions
        : submissions.filter((s) => s.candidateName === selectedCandidate);

    return [...filtered].sort(
      (a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
    );
  }, [submissions, selectedCandidate]);

  // Prepare time series data points for the Trend Chart
  const timelineData = useMemo(() => {
    return sortedSubmissions.map((sub, idx) => {
      const d = new Date(sub.submittedAt);
      const dateLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const timeLabel = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      // Extract specific category percentages if present in this submission
      const dbScore = sub.categoryBreakdown['Database Systems']?.percentage ?? null;
      const compArchScore = sub.categoryBreakdown['Computer Engineering']?.percentage ?? null;
      const netScore = sub.categoryBreakdown['Networking Protocols']?.percentage ?? null;

      return {
        index: idx + 1,
        id: sub.id,
        date: dateLabel,
        fullDate: `${dateLabel} ${timeLabel}`,
        candidate: sub.candidateName,
        examTitle: sub.examTitle,
        overallScore: sub.scorePercent,
        'Database Systems': dbScore,
        'Computer Engineering': compArchScore,
        'Networking Protocols': netScore,
        benchmark: 70, // Passing mark threshold
      };
    });
  }, [sortedSubmissions]);

  // Aggregate category statistics for Bar chart and KPI summaries
  const categorySummaryData = useMemo(() => {
    const catMap: Record<
      string,
      { totalScore: number; count: number; passCount: number; maxScore: number }
    > = {
      'Database Systems': { totalScore: 0, count: 0, passCount: 0, maxScore: 0 },
      'Computer Engineering': { totalScore: 0, count: 0, passCount: 0, maxScore: 0 },
      'Networking Protocols': { totalScore: 0, count: 0, passCount: 0, maxScore: 0 },
    };

    sortedSubmissions.forEach((sub) => {
      Object.entries(sub.categoryBreakdown).forEach(([cat, stats]) => {
        if (!catMap[cat]) {
          catMap[cat] = { totalScore: 0, count: 0, passCount: 0, maxScore: 0 };
        }
        catMap[cat].totalScore += stats.percentage;
        catMap[cat].count += 1;
        if (stats.percentage >= 70) catMap[cat].passCount += 1;
        if (stats.percentage > catMap[cat].maxScore) catMap[cat].maxScore = stats.percentage;
      });
    });

    return Object.entries(catMap).map(([name, data]) => ({
      category: name,
      avgScore: data.count > 0 ? Math.round(data.totalScore / data.count) : 0,
      attempts: data.count,
      passRate: data.count > 0 ? Math.round((data.passCount / data.count) * 100) : 0,
      maxScore: data.maxScore,
    }));
  }, [sortedSubmissions]);

  if (!mounted) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 h-80 flex items-center justify-center text-slate-400 text-xs">
        Loading performance telemetry visualization...
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-6 shadow-xl">
      {/* Chart Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <TrendingUp className="w-4 h-4" />
            <span>PERFORMANCE TREND ANALYSIS · RECHARTS ENGINE</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
            Category Performance Trends Over Time
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor mastery trajectories and diagnostic score progressions across engineering curriculum categories.
          </p>
        </div>

        {/* View Mode & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Candidate selector */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedCandidate}
              onChange={(e) => setSelectedCandidate(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
            >
              {candidates.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Candidates' : c}
                </option>
              ))}
            </select>
          </div>

          {/* Chart Type Toggle */}
          <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setChartMode('line')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                chartMode === 'line'
                  ? 'bg-slate-800 text-cyan-300 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Timeline</span>
            </button>
            <button
              onClick={() => setChartMode('bar')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                chartMode === 'bar'
                  ? 'bg-slate-800 text-cyan-300 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Averages</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Segmented Selector Tabs (Only relevant in timeline mode) */}
      {chartMode === 'line' && (
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800/80 pb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-2">
            Focus Category:
          </span>
          {['All', 'Database Systems', 'Computer Engineering', 'Networking Protocols'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                selectedCategory === cat
                  ? 'bg-indigo-950/80 text-cyan-300 border border-cyan-500/40 font-medium'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Chart Canvas Container */}
      <div className="w-full h-72 sm:h-80">
        {timelineData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-500">
            No submissions recorded yet for this filter.
          </div>
        ) : chartMode === 'line' ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timelineData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                unit="%"
              />
              <Tooltip content={CustomLineTooltip} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                iconType="circle"
                iconSize={8}
              />

              {/* 70% Passing Reference Line */}
              <ReferenceLine
                y={70}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                label={{
                  value: '70% Pass Mark',
                  fill: '#fbbf24',
                  fontSize: 10,
                  position: 'insideTopRight',
                }}
              />

              {/* Overall Assessment Score Line */}
              {selectedCategory === 'All' && (
                <Line
                  type="monotone"
                  dataKey="overallScore"
                  name="Overall Assessment"
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#38bdf8', stroke: '#0f172a', strokeWidth: 2 }}
                  activeDot={{ r: 6, stroke: '#38bdf8', strokeWidth: 2 }}
                />
              )}

              {/* Database Systems Line */}
              {(selectedCategory === 'All' || selectedCategory === 'Database Systems') && (
                <Line
                  type="monotone"
                  dataKey="Database Systems"
                  name="Database Systems"
                  stroke="#22d3ee"
                  strokeWidth={selectedCategory === 'Database Systems' ? 3 : 2}
                  connectNulls
                  dot={{ r: 4, fill: '#22d3ee', stroke: '#0f172a', strokeWidth: 2 }}
                  activeDot={{ r: 6, stroke: '#22d3ee', strokeWidth: 2 }}
                />
              )}

              {/* Computer Engineering Line */}
              {(selectedCategory === 'All' || selectedCategory === 'Computer Engineering') && (
                <Line
                  type="monotone"
                  dataKey="Computer Engineering"
                  name="Computer Engineering"
                  stroke="#818cf8"
                  strokeWidth={selectedCategory === 'Computer Engineering' ? 3 : 2}
                  connectNulls
                  dot={{ r: 4, fill: '#818cf8', stroke: '#0f172a', strokeWidth: 2 }}
                  activeDot={{ r: 6, stroke: '#818cf8', strokeWidth: 2 }}
                />
              )}

              {/* Networking Protocols Line */}
              {(selectedCategory === 'All' || selectedCategory === 'Networking Protocols') && (
                <Line
                  type="monotone"
                  dataKey="Networking Protocols"
                  name="Networking Protocols"
                  stroke="#34d399"
                  strokeWidth={selectedCategory === 'Networking Protocols' ? 3 : 2}
                  connectNulls
                  dot={{ r: 4, fill: '#34d399', stroke: '#0f172a', strokeWidth: 2 }}
                  activeDot={{ r: 6, stroke: '#34d399', strokeWidth: 2 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={categorySummaryData}
              margin={{ top: 10, right: 20, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="category"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                unit="%"
              />
              <Tooltip content={CustomBarTooltip} />
              <ReferenceLine
                y={70}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                label={{ value: '70% Passing Mark', fill: '#fbbf24', fontSize: 10 }}
              />
              <Bar dataKey="avgScore" name="Average Score %" fill="#818cf8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Category Performance Summary Micro-Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
        {categorySummaryData.map((cat) => (
          <div
            key={cat.category}
            className="p-3 bg-slate-950/70 border border-slate-800/90 rounded-xl space-y-1"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-300 truncate">{cat.category}</span>
              <span
                className={`font-mono font-bold ${
                  cat.avgScore >= 70 ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {cat.avgScore}% avg
              </span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full ${cat.avgScore >= 70 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                style={{ width: `${cat.avgScore}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
              <span>{cat.attempts} assessment attempts</span>
              <span>Pass Rate: {cat.passRate}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useQuiz } from '@/context/QuizContext';
import {
  Terminal,
  Play,
  Copy,
  Check,
  Server,
  Layers,
  Database,
  ShieldCheck,
  Cpu,
  ChevronDown,
  ChevronUp,
  FileCode,
  Activity,
  Code2,
} from 'lucide-react';

interface ApiEndpoint {
  id: string;
  method: 'GET' | 'POST';
  path: string;
  summary: string;
  description: string;
  defaultPayload?: string;
  sampleCurl: string;
}

export function ArchitectureDocs() {
  const { exams } = useQuiz();

  const [activeEndpointId, setActiveEndpointId] = useState<string>('get-exams');
  const [requestPayloads, setRequestPayloads] = useState<Record<string, string>>({
    'post-question': JSON.stringify(
      {
        title: 'Linux Virtual Memory: Copy-on-Write fork() Semantics',
        prompt: 'How does the Linux kernel optimize physical memory page allocation during a fork() system call before child process write mutation occurs?',
        category: 'Operating Systems',
        difficulty: 'Medium',
        type: 'multiple-choice',
        pointWeight: 4,
        options: [
          { text: 'Pages are duplicated synchronously in memory', isCorrect: false },
          { text: 'Child shares parent pages read-only; write traps trigger page duplication on demand', isCorrect: true },
          { text: 'Pages are swapped out directly to tmpfs', isCorrect: false },
          { text: 'Page table directories are marked invalid', isCorrect: false }
        ],
        explanation: 'Linux fork() utilizes Copy-On-Write (COW). Both parent and child page tables point to identical physical frames marked read-only. A page fault on write duplicates the single dirty page frame.'
      },
      null,
      2
    ),
    'post-submit': JSON.stringify(
      {
        examId: 'exam-db-internals',
        candidateName: 'Alex Developer',
        answers: {
          'q-db-1': 'opt-db1-b',
          'q-db-2': 'opt-db2-b',
          'q-db-3': 'opt-db3-b',
          'q-db-4': 'opt-db4-b',
          'q-db-5': 'opt-db5-f'
        },
        timeSpentSeconds: 480
      },
      null,
      2
    ),
  });

  const [loading, setLoading] = useState(false);
  const [responseData, setResponseData] = useState<{
    status: number;
    statusText: string;
    durationMs: number;
    payload: string;
  } | null>(null);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  const endpoints: ApiEndpoint[] = [
    {
      id: 'get-exams',
      method: 'GET',
      path: '/api/v1/exams',
      summary: 'Retrieve available exams catalog',
      description: 'Returns the full list of published assessment modules with question counts, durations, and category tags without exposing answer keys.',
      sampleCurl: `curl -X GET "http://localhost:3000/api/v1/exams" -H "Accept: application/json"`,
    },
    {
      id: 'post-question',
      method: 'POST',
      path: '/api/v1/questions',
      summary: 'Create and ingest a new question record',
      description: 'Validates and appends a peer-reviewed question to the global question bank or designated exam module.',
      defaultPayload: requestPayloads['post-question'],
      sampleCurl: `curl -X POST "http://localhost:3000/api/v1/questions" \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Linux COW","prompt":"...","options":[...],"pointWeight":4}'`,
    },
    {
      id: 'post-submit',
      method: 'POST',
      path: '/api/v1/exams/submit',
      summary: 'Submit candidate assessment for scoring',
      description: 'Executes the scoring engine against official keys, calculates percentage, evaluates pass/fail status, generates category breakdowns, and saves submission.',
      defaultPayload: requestPayloads['post-submit'],
      sampleCurl: `curl -X POST "http://localhost:3000/api/v1/exams/submit" \\
  -H "Content-Type: application/json" \\
  -d '{"examId":"exam-db-internals","candidateName":"Alex Developer","answers":{...}}'`,
    },
    {
      id: 'get-health',
      method: 'GET',
      path: '/api/v1/health',
      summary: 'Telemetry & uptime health metrics',
      description: 'Reports engine uptime, active memory usage, total indexed questions, completed test runs, and evaluator latency.',
      sampleCurl: `curl -X GET "http://localhost:3000/api/v1/health" -H "Accept: application/json"`,
    },
  ];

  const currentEndpoint = endpoints.find((e) => e.id === activeEndpointId) || endpoints[0];

  const handleExecuteRequest = async () => {
    setLoading(true);
    setResponseData(null);
    const startTime = performance.now();

    try {
      let res: Response;
      if (currentEndpoint.method === 'GET') {
        res = await fetch(currentEndpoint.path);
      } else {
        const bodyContent = requestPayloads[currentEndpoint.id] || '{}';
        res = await fetch(currentEndpoint.path, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: bodyContent,
        });
      }

      const durationMs = Math.round(performance.now() - startTime);
      const data = await res.json();

      setResponseData({
        status: res.status,
        statusText: res.statusText || (res.status === 200 ? 'OK' : 'Created'),
        durationMs,
        payload: JSON.stringify(data, null, 2),
      });
    } catch (err) {
      const durationMs = Math.round(performance.now() - startTime);
      setResponseData({
        status: 500,
        statusText: 'Request Error',
        durationMs,
        payload: JSON.stringify({ error: String(err) }, null, 2),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, type: 'curl' | 'json') => {
    navigator.clipboard.writeText(text);
    if (type === 'curl') {
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 2000);
    } else {
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    }
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <Terminal className="w-4 h-4" />
            <span>INTERACTIVE REST API EXPLORER · SWAGGER OAS 3.1</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            System Architecture & REST API Docs
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Test live simulated and server endpoints, inspect JSON contracts, and review the underlying relational architecture.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
          <Activity className="w-3.5 h-3.5" />
          <span>Status: ALL ENDPOINTS OPERATIONAL</span>
        </div>
      </div>

      {/* Interactive Swagger-Style API Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Endpoint Selector Tabs */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
            REST API Endpoints
          </div>

          <div className="space-y-2">
            {endpoints.map((ep) => {
              const isSelected = ep.id === activeEndpointId;
              const isGet = ep.method === 'GET';

              return (
                <button
                  key={ep.id}
                  onClick={() => {
                    setActiveEndpointId(ep.id);
                    setResponseData(null);
                  }}
                  className={`w-full p-3.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-400 shadow-md ring-1 ring-cyan-400/40'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        isGet
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="font-mono text-xs text-white font-medium truncate">
                      {ep.path}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 line-clamp-1">{ep.summary}</div>
                </button>
              );
            })}
          </div>

          {/* Quick System Stats */}
          <div className="mt-6 p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
            <div className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-cyan-400" />
              <span>Runtime Specifications</span>
            </div>
            <div className="space-y-1 text-slate-400 text-[11px]">
              <div className="flex justify-between">
                <span>Protocol:</span>
                <span className="text-slate-300 font-mono">HTTP/1.1 & HTTP/2</span>
              </div>
              <div className="flex justify-between">
                <span>Content-Type:</span>
                <span className="text-slate-300 font-mono">application/json</span>
              </div>
              <div className="flex justify-between">
                <span>Auth Model:</span>
                <span className="text-emerald-400 font-mono">Simulated Bearer</span>
              </div>
            </div>
          </div>
        </div>

        {/* Endpoint Testing Console */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md ${
                    currentEndpoint.method === 'GET'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {currentEndpoint.method}
                </span>
                <span className="font-mono text-sm sm:text-base font-bold text-white">
                  {currentEndpoint.path}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{currentEndpoint.description}</p>
            </div>

            <button
              onClick={handleExecuteRequest}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{loading ? 'Executing...' : 'Send Request'}</span>
            </button>
          </div>

          {/* Request Payload Editor if POST */}
          {currentEndpoint.method === 'POST' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Request Body (JSON Payload)</span>
                <span className="text-[11px] text-slate-500">Editable parameters</span>
              </div>
              <textarea
                rows={7}
                value={requestPayloads[currentEndpoint.id] || ''}
                onChange={(e) =>
                  setRequestPayloads((prev) => ({
                    ...prev,
                    [currentEndpoint.id]: e.target.value,
                  }))
                }
                className="w-full font-mono text-xs bg-slate-950 border border-slate-800 p-3 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-400 leading-relaxed"
              />
            </div>
          )}

          {/* cURL Command Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-400">cURL Example</span>
              <button
                onClick={() => handleCopy(currentEndpoint.sampleCurl, 'curl')}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[11px]"
              >
                {copiedCurl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCurl ? 'Copied' : 'Copy cURL'}</span>
              </button>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 overflow-x-auto font-mono text-[11px] text-indigo-300">
              <pre>{currentEndpoint.sampleCurl}</pre>
            </div>
          </div>

          {/* Response Payload Viewer */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-slate-300">Server Response</span>
                {responseData && (
                  <span
                    className={`font-mono text-[11px] px-2 py-0.5 rounded font-bold ${
                      responseData.status < 300
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {responseData.status} {responseData.statusText} · {responseData.durationMs}ms
                  </span>
                )}
              </div>

              {responseData && (
                <button
                  onClick={() => handleCopy(responseData.payload, 'json')}
                  className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[11px]"
                >
                  {copiedJson ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedJson ? 'Copied' : 'Copy JSON'}</span>
                </button>
              )}
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 min-h-[160px] max-h-[320px] overflow-y-auto font-mono text-xs text-emerald-400 leading-relaxed">
              {loading ? (
                <div className="flex items-center justify-center h-28 text-slate-500">
                  <span>Executing HTTP round-trip...</span>
                </div>
              ) : responseData ? (
                <pre>{responseData.payload}</pre>
              ) : (
                <div className="flex items-center justify-center h-28 text-slate-500 text-xs">
                  <span>Click &quot;Send Request&quot; above to trigger live endpoint and view JSON output</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Relational Architecture & Technical Data Model Documentation */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span>Relational Data Architecture & Domain Model</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Schema mapping and relationships governing assessments, questions, submissions, and evaluation pipelines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold">
              <Database className="w-4 h-4" />
              <span>Exam Entity (1)</span>
            </div>
            <p className="text-xs text-slate-400">
              Root assessment container defining title, syllabus description, time limit, and passing benchmark.
            </p>
            <div className="font-mono text-[11px] text-slate-400 bg-slate-900 p-2.5 rounded-lg border border-slate-800 space-y-0.5">
              <div>id: string (PK)</div>
              <div>title: string</div>
              <div>category: string</div>
              <div>difficulty: string</div>
              <div>durationMinutes: number</div>
              <div>passingScorePercent: number</div>
              <div>questions: Question[]</div>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-bold">
              <FileCode className="w-4 h-4" />
              <span>Question Entity (N)</span>
            </div>
            <p className="text-xs text-slate-400">
              Granular question unit supporting code snippets, custom point weighting, and answer explanations.
            </p>
            <div className="font-mono text-[11px] text-slate-400 bg-slate-900 p-2.5 rounded-lg border border-slate-800 space-y-0.5">
              <div>id: string (PK)</div>
              <div>examId?: string (FK)</div>
              <div>title, prompt: string</div>
              <div>codeSnippet?: string</div>
              <div>type: QuestionType</div>
              <div>pointWeight: number</div>
              <div>options: Option[]</div>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Submission & Evaluation</span>
            </div>
            <p className="text-xs text-slate-400">
              Immutable audit record storing candidate answers, timestamp, duration, score percentage, and category metrics.
            </p>
            <div className="font-mono text-[11px] text-slate-400 bg-slate-900 p-2.5 rounded-lg border border-slate-800 space-y-0.5">
              <div>id: string (PK)</div>
              <div>examId: string (FK)</div>
              <div>candidateName: string</div>
              <div>answers: Record&lt;QId, OptId&gt;</div>
              <div>scorePercent: number</div>
              <div>passed: boolean</div>
              <div>categoryBreakdown: Map</div>
            </div>
          </div>
        </div>

        {/* Scoring & Evaluation Engine Algorithm */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Deterministic Scoring & Sub-Second Evaluation Algorithm</span>
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            The ExamCraft evaluation core executes in $O(N)$ time complexity where $N$ is the number of questions. It weights points dynamically:
          </p>
          <div className="font-mono text-xs bg-slate-900 border border-slate-800 p-3 rounded-lg text-cyan-300">
            TotalScore% = Round((Sum(PointsEarned_i) / Sum(PointsPossible_i)) * 100)
            <br />
            Passed = TotalScore% &gt;= Exam.passingScorePercent
          </div>
          <p className="text-[11px] text-slate-400">
            Simultaneously, category buckets aggregate points independently, producing the granular diagnostic breakdown needed for targeted engineering coaching and gap analysis.
          </p>
        </div>
      </section>
    </div>
  );
}

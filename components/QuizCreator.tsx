'use client';

import React, { useState } from 'react';
import { useQuiz } from '@/context/QuizContext';
import {
  Difficulty,
  QuestionType,
  QuestionOption,
} from '@/types/quiz';
import {
  PenTool,
  Plus,
  Trash2,
  CheckCircle,
  Eye,
  AlertCircle,
  Sparkles,
  BookOpen,
  Code2,
  Radio,
  ToggleLeft,
  Check,
} from 'lucide-react';

export function QuizCreator() {
  const { exams, questions, addQuestion, deleteQuestion, activeRole } = useQuiz();

  // Form State
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [category, setCategory] = useState('Database Systems');
  const [customCategory, setCustomCategory] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [questionType, setQuestionType] = useState<QuestionType>('multiple-choice');
  const [codeSnippet, setCodeSnippet] = useState(
    `-- Example SQL / Query Snippet\nSELECT relname, n_dead_tup, last_vacuum \nFROM pg_stat_user_tables \nORDER BY n_dead_tup DESC;`
  );
  const [codeLanguage, setCodeLanguage] = useState('sql');
  const [pointWeight, setPointWeight] = useState(3);
  const [explanation, setExplanation] = useState('');
  const [targetExamId, setTargetExamId] = useState<string>('');

  // Options State
  const [options, setOptions] = useState<QuestionOption[]>([
    { id: 'opt-1', text: '', isCorrect: true, explanation: '' },
    { id: 'opt-2', text: '', isCorrect: false, explanation: '' },
    { id: 'opt-3', text: '', isCorrect: false, explanation: '' },
    { id: 'opt-4', text: '', isCorrect: false, explanation: '' },
  ]);

  // Preview interactive state
  const [previewSelectedOpt, setPreviewSelectedOpt] = useState<string | null>(null);

  // Validation & feedback state
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [bankSearch, setBankSearch] = useState('');

  // Update options when question type changes to True/False
  const handleTypeChange = (newType: QuestionType) => {
    setQuestionType(newType);
    if (newType === 'true-false') {
      setOptions([
        { id: 'opt-tf-1', text: 'True', isCorrect: true },
        { id: 'opt-tf-2', text: 'False', isCorrect: false },
      ]);
    } else if (options.length < 2) {
      setOptions([
        { id: 'opt-1', text: '', isCorrect: true },
        { id: 'opt-2', text: '', isCorrect: false },
        { id: 'opt-3', text: '', isCorrect: false },
        { id: 'opt-4', text: '', isCorrect: false },
      ]);
    }
  };

  const handleAddOption = () => {
    if (questionType === 'true-false') return;
    const newId = `opt-${Date.now()}-${options.length + 1}`;
    setOptions([...options, { id: newId, text: '', isCorrect: false }]);
  };

  const handleRemoveOption = (indexToRemove: number) => {
    if (options.length <= 2) return;
    const filtered = options.filter((_, idx) => idx !== indexToRemove);
    // If we removed the correct option, mark the first one as correct
    if (!filtered.some((opt) => opt.isCorrect)) {
      filtered[0].isCorrect = true;
    }
    setOptions(filtered);
  };

  const handleOptionTextChange = (idx: number, text: string) => {
    const updated = [...options];
    updated[idx].text = text;
    setOptions(updated);
  };

  const handleSetCorrectOption = (idx: number) => {
    const updated = options.map((opt, i) => ({
      ...opt,
      isCorrect: i === idx,
    }));
    setOptions(updated);
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];
    if (!title.trim() || title.trim().length < 4) {
      errors.push('Question Title must be at least 4 characters long.');
    }
    if (!prompt.trim() || prompt.trim().length < 8) {
      errors.push('Question Prompt must provide sufficient detail (at least 8 chars).');
    }
    if (questionType === 'code-analysis' && !codeSnippet.trim()) {
      errors.push('Code analysis questions must contain a code snippet.');
    }
    const emptyOptions = options.some((opt) => !opt.text.trim());
    if (emptyOptions) {
      errors.push('All option choices must have text provided.');
    }
    const hasCorrect = options.some((opt) => opt.isCorrect);
    if (!hasCorrect) {
      errors.push('At least one option must be marked as the correct answer.');
    }
    if (pointWeight < 1) {
      errors.push('Point weight must be at least 1 point.');
    }

    setFormErrors(errors);
    return errors.length === 0;
  };

  const handleSaveQuestion = async () => {
    if (!validateForm()) return;

    const finalCategory = category === 'Custom' ? (customCategory.trim() || 'General Engineering') : category;

    const created = addQuestion({
      examId: targetExamId ? targetExamId : undefined,
      title: title.trim(),
      prompt: prompt.trim(),
      category: finalCategory,
      difficulty,
      type: questionType,
      codeSnippet: questionType === 'code-analysis' ? codeSnippet.trim() : undefined,
      codeLanguage,
      options: options.map((opt) => ({
        id: opt.id,
        text: opt.text.trim(),
        isCorrect: opt.isCorrect,
      })),
      pointWeight,
      explanation: explanation.trim() || 'Evaluated based on standard computer science principles.',
    });

    // Also dispatch to API backend in the background so Swagger can query it
    try {
      await fetch('/api/v1/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: created.title,
          prompt: created.prompt,
          category: created.category,
          difficulty: created.difficulty,
          type: created.type,
          options: created.options,
          pointWeight: created.pointWeight,
          explanation: created.explanation,
          codeSnippet: created.codeSnippet,
          codeLanguage: created.codeLanguage,
          examId: created.examId,
        }),
      });
    } catch {
      // Local addition already succeeded
    }

    // Reset Form
    setTitle('');
    setPrompt('');
    setExplanation('');
    setFormErrors([]);
    setSuccessToast(`Saved "${created.title}" to Question Bank successfully!`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const filteredBankQuestions = questions.filter(
    (q) =>
      q.title.toLowerCase().includes(bankSearch.toLowerCase()) ||
      q.category.toLowerCase().includes(bankSearch.toLowerCase())
  );

  return (
    <div className="space-y-10 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <PenTool className="w-4 h-4" />
            <span>AUTHORING STUDIO · ITEM SPECIFICATION</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Quiz & Question Creator
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Design rigorous multiple choice, boolean, or code snippet analysis questions with live candidate preview.
          </p>
        </div>

        {activeRole === 'Candidate' && (
          <div className="bg-amber-950/60 border border-amber-500/40 rounded-xl px-3.5 py-2 text-xs text-amber-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>You are in Candidate role. Questions you author save to your local test bank.</span>
          </div>
        )}
      </div>

      {successToast && (
        <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 px-4 py-3 rounded-xl text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-emerald-400 hover:text-emerald-100 font-semibold text-xs ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Studio Split Grid: Creator Form on Left, Live Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Authoring Form */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Question Parameters</span>
            </h2>
            <span className="text-xs text-slate-400">Step 1 of 2</span>
          </div>

          {/* Validation errors */}
          {formErrors.length > 0 && (
            <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-200 space-y-1">
              <div className="font-semibold flex items-center gap-1.5 text-rose-300">
                <AlertCircle className="w-4 h-4" />
                <span>Please fix the following issues:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-300">
                {formErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Question Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Question Title / Header
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. PostgreSQL B-Tree Index Lock Contention on High-Concurrency Inserts"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Question Prompt */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Detailed Prompt & Problem Statement
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the scenario, technical constraint, or architectural condition candidate must evaluate..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Metadata Row: Category, Difficulty, Weight */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
              >
                <option value="Database Systems">Database Systems</option>
                <option value="Computer Engineering">Computer Engineering</option>
                <option value="Networking Protocols">Networking Protocols</option>
                <option value="Operating Systems">Operating Systems</option>
                <option value="Systems Architecture">Systems Architecture</option>
                <option value="Custom">Custom...</option>
              </select>
            </div>

            {category === 'Custom' && (
              <div className="space-y-1.5 sm:col-span-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Custom Category Name
                </label>
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="e.g. Distributed Consensus Algorithms"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
              >
                <option value="Easy">Easy (Fundamentals)</option>
                <option value="Medium">Medium (Applied)</option>
                <option value="Hard">Hard (Deep Internals)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Point Weight (Score)
              </label>
              <input
                type="number"
                min={1}
                max={25}
                value={pointWeight}
                onChange={(e) => setPointWeight(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Question Type Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Question Evaluation Paradigm
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange('multiple-choice')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                  questionType === 'multiple-choice'
                    ? 'bg-slate-800 border-cyan-400/80 text-white shadow-xs'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Radio className={`w-4 h-4 mt-0.5 ${questionType === 'multiple-choice' ? 'text-cyan-400' : 'text-slate-500'}`} />
                <div>
                  <div className="text-xs font-bold">Multiple Choice</div>
                  <div className="text-[10px] text-slate-400">Single select from 4 choices</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('true-false')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                  questionType === 'true-false'
                    ? 'bg-slate-800 border-cyan-400/80 text-white shadow-xs'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <ToggleLeft className={`w-4 h-4 mt-0.5 ${questionType === 'true-false' ? 'text-cyan-400' : 'text-slate-500'}`} />
                <div>
                  <div className="text-xs font-bold">True / False</div>
                  <div className="text-[10px] text-slate-400">Binary assertion test</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('code-analysis')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                  questionType === 'code-analysis'
                    ? 'bg-slate-800 border-cyan-400/80 text-white shadow-xs'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code2 className={`w-4 h-4 mt-0.5 ${questionType === 'code-analysis' ? 'text-cyan-400' : 'text-slate-500'}`} />
                <div>
                  <div className="text-xs font-bold">Code Analysis</div>
                  <div className="text-[10px] text-slate-400">Snippet analysis & plan review</div>
                </div>
              </button>
            </div>
          </div>

          {/* Code Snippet Editor if Code Analysis */}
          {questionType === 'code-analysis' && (
            <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Code / Query Snippet</span>
                <select
                  value={codeLanguage}
                  onChange={(e) => setCodeLanguage(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-xs text-slate-300"
                >
                  <option value="sql">SQL / Plan</option>
                  <option value="assembly">Assembly / RISC-V</option>
                  <option value="typescript">TypeScript / JS</option>
                  <option value="c">C / Systems</option>
                  <option value="bash">Bash / Shell</option>
                </select>
              </div>
              <textarea
                rows={5}
                value={codeSnippet}
                onChange={(e) => setCodeSnippet(e.target.value)}
                className="w-full font-mono text-xs bg-slate-900 border border-slate-800 p-3 rounded-lg text-emerald-300 focus:outline-none focus:border-cyan-400"
              />
            </div>
          )}

          {/* Options Builder */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Answer Choices (Select the radio of the correct answer)
              </label>
              {questionType !== 'true-false' && (
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Option</span>
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              {options.map((option, idx) => (
                <div
                  key={option.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    option.isCorrect
                      ? 'bg-emerald-950/20 border-emerald-500/40'
                      : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  {/* Correct radio toggle */}
                  <button
                    type="button"
                    onClick={() => handleSetCorrectOption(idx)}
                    className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                      option.isCorrect
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                        : 'border-slate-700 hover:border-slate-500'
                    }`}
                    title="Mark this option as the correct answer"
                  >
                    {option.isCorrect && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <div className="w-5 text-xs font-mono font-semibold text-slate-400 text-center">
                    {String.fromCharCode(65 + idx)}
                  </div>

                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => handleOptionTextChange(idx, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + idx)} description...`}
                    className="flex-1 bg-transparent border-0 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-0"
                  />

                  {questionType !== 'true-false' && options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      className="text-slate-600 hover:text-rose-400 p-1"
                      title="Delete Option"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Explanation & Rationale */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Instructor Pedagogical Explanation & Answer Rationale
            </label>
            <textarea
              rows={2}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Explain why the correct answer is valid, citing architectural or specifications reasoning..."
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Optional Exam Assignment */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Attach to Assessment Module (Optional)
            </label>
            <select
              value={targetExamId}
              onChange={(e) => setTargetExamId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
            >
              <option value="">Standalone in Global Question Bank (No direct exam)</option>
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.title} ({ex.category})
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={handleSaveQuestion}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors shadow-md shadow-cyan-500/20 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Save to Question Bank</span>
            </button>
          </div>
        </div>

        {/* Live Candidate Preview on Right */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sticky top-24 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1.5 text-cyan-400 font-mono">
                <Eye className="w-4 h-4" />
                <span>REAL-TIME TEST-TAKER PREVIEW</span>
              </div>
              <span className="text-[11px] text-slate-500">Interactive Preview</span>
            </div>

            {/* Preview Card */}
            <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-5 space-y-4 shadow-xl">
              {/* Question Header & unboxed metadata */}
              <div className="flex items-center justify-between text-xs text-slate-400 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-cyan-400">{category === 'Custom' ? (customCategory || 'Custom') : category}</span>
                  <span aria-hidden="true">·</span>
                  <span className={difficulty === 'Hard' ? 'text-amber-400' : 'text-emerald-400'}>
                    {difficulty}
                  </span>
                </div>
                <span className="text-slate-300 font-semibold">{pointWeight} pts</span>
              </div>

              {/* Title & Prompt */}
              <div>
                <h3 className="text-base font-bold text-white">
                  {title || 'Untitled Question Preview'}
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {prompt || 'Your problem statement and question prompt will appear here as you type...'}
                </p>
              </div>

              {/* Code Snippet in Preview if applicable */}
              {questionType === 'code-analysis' && codeSnippet && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 overflow-x-auto font-mono text-[11px] text-emerald-400">
                  <pre>{codeSnippet}</pre>
                </div>
              )}

              {/* Interactive Options Preview */}
              <div className="space-y-2 pt-2">
                {options.map((opt, i) => {
                  const letter = String.fromCharCode(65 + i);
                  const isSelected = previewSelectedOpt === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setPreviewSelectedOpt(opt.id)}
                      className={`cursor-pointer p-3 rounded-xl border text-xs flex items-center gap-3 transition-colors ${
                        isSelected
                          ? 'bg-cyan-950/40 border-cyan-400/80 text-cyan-200'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center font-mono font-semibold text-[11px] ${
                          isSelected
                            ? 'bg-cyan-500 text-slate-950'
                            : 'bg-slate-900 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {letter}
                      </div>
                      <span className="flex-1">
                        {opt.text || `Option ${letter} (placeholder)`}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Correct answer indicator for author */}
              <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl text-xs space-y-1">
                <div className="font-semibold text-indigo-300 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Instructor Key Summary</span>
                </div>
                <div className="text-[11px] text-slate-300">
                  Target Correct: <strong className="text-emerald-400">{options.find((o) => o.isCorrect)?.text || 'None selected'}</strong>
                </div>
                {explanation && (
                  <div className="text-[11px] text-slate-400 italic pt-1 border-t border-indigo-500/20">
                    &ldquo;{explanation}&rdquo;
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Question Bank Explorer */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              <span>Current Question Bank Repository ({questions.length} Items)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Items available across all assessments and on-demand mock runners.
            </p>
          </div>

          <div className="w-full sm:w-72">
            <input
              type="text"
              value={bankSearch}
              onChange={(e) => setBankSearch(e.target.value)}
              placeholder="Filter bank items..."
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBankQuestions.map((q) => (
            <div
              key={q.id}
              className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-cyan-400">{q.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className={q.difficulty === 'Hard' ? 'text-amber-400' : 'text-emerald-400'}>
                      {q.difficulty}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{q.type.replace('-', ' ')}</span>
                  </div>
                  <span className="text-slate-300 font-semibold">{q.pointWeight} pts</span>
                </div>

                <h4 className="text-sm font-semibold text-white">{q.title}</h4>
                <p className="text-xs text-slate-400 line-clamp-2">{q.prompt}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500">
                  {q.options.length} choices · Correct: {q.options.find((o) => o.isCorrect)?.text.slice(0, 30)}...
                </span>
                <button
                  type="button"
                  onClick={() => deleteQuestion(q.id)}
                  className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                  title="Delete from Question Bank"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

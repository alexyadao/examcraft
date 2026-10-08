'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Exam,
  Question,
  ExamSubmission,
  UserRole,
  ActiveTab,
  EvaluationResult,
} from '@/types/quiz';
import { INITIAL_EXAMS, INITIAL_QUESTIONS, INITIAL_SUBMISSIONS } from '@/lib/seedData';
import { evaluateExamAnswers } from '@/lib/evaluator';

export type WindowModalType = 'none' | 'exam' | 'creator';
export type SlidingPanelMode = 'syllabus' | 'runner';

interface QuizContextType {
  exams: Exam[];
  questions: Question[];
  submissions: ExamSubmission[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  selectedExamId: string;
  setSelectedExamId: (id: string) => void;
  candidateName: string;
  setCandidateName: (name: string) => void;
  lastEvaluation: EvaluationResult | null;
  setLastEvaluation: (res: EvaluationResult | null) => void;
  windowModal: WindowModalType;
  openExamModal: (examId?: string) => void;
  openCreatorModal: () => void;
  closeWindowModal: () => void;
  slidingPanelExam: Exam | null;
  slidingPanelMode: SlidingPanelMode;
  openSlidingPanel: (exam: Exam, mode?: SlidingPanelMode) => void;
  closeSlidingPanel: () => void;
  startExam: (examId: string) => void;
  addQuestion: (newQ: Omit<Question, 'id' | 'createdAt'>) => Question;
  deleteQuestion: (id: string) => void;
  submitCandidateExam: (
    examId: string,
    answers: Record<string, string>,
    timeSpentSeconds: number
  ) => Promise<EvaluationResult>;
  resetDatabase: () => Promise<void>;
  isResetting: boolean;
}

const STORAGE_KEYS = {
  EXAMS: 'quizengine_exams_v1',
  QUESTIONS: 'quizengine_questions_v1',
  SUBMISSIONS: 'quizengine_submissions_v1',
  ROLE: 'quizengine_role_v1',
  NAME: 'quizengine_candidatename_v1',
};

const QuizContext = createContext<QuizContextType | null>(null);

export function QuizProvider({ children }: { children: React.ReactNode }) {
  // Strict, hardcoded default values for server render and initial hydration
  const [exams, setExams] = useState<Exam[]>(INITIAL_EXAMS);
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [submissions, setSubmissions] = useState<ExamSubmission[]>(INITIAL_SUBMISSIONS);
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [activeRole, setActiveRole] = useState<UserRole>('Instructor');
  const [selectedExamId, setSelectedExamId] = useState<string>(INITIAL_EXAMS[0].id);
  const [candidateName, setCandidateName] = useState<string>('Alex Chen');
  const [isHydrated, setIsHydrated] = useState(false);

  const [lastEvaluation, setLastEvaluation] = useState<EvaluationResult | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [windowModal, setWindowModal] = useState<WindowModalType>('none');
  const [slidingPanelExam, setSlidingPanelExam] = useState<Exam | null>(null);
  const [slidingPanelMode, setSlidingPanelMode] = useState<SlidingPanelMode>('syllabus');

  // Load from localStorage only after initial client mount/hydration completes
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const storedRole = localStorage.getItem(STORAGE_KEYS.ROLE);
        if (storedRole === 'Instructor' || storedRole === 'Candidate') {
          setActiveRole(storedRole);
        }
        const storedName = localStorage.getItem(STORAGE_KEYS.NAME);
        if (storedName) {
          setCandidateName(storedName);
        }
        const storedExams = localStorage.getItem(STORAGE_KEYS.EXAMS);
        if (storedExams) {
          setExams(JSON.parse(storedExams));
        }
        const storedQuestions = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
        if (storedQuestions) {
          setQuestions(JSON.parse(storedQuestions));
        }
        const storedSubmissions = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
        if (storedSubmissions) {
          setSubmissions(JSON.parse(storedSubmissions));
        }
      } catch {
        // Storage access fallback
      } finally {
        setIsHydrated(true);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Save changes to localStorage only after client hydration is confirmed
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
      localStorage.setItem(STORAGE_KEYS.ROLE, activeRole);
      localStorage.setItem(STORAGE_KEYS.NAME, candidateName);
    } catch {
      // Ignore quota errors
    }
  }, [exams, questions, submissions, activeRole, candidateName, isHydrated]);

  const openExamModal = (examId?: string) => {
    if (examId) setSelectedExamId(examId);
    setLastEvaluation(null);
    setWindowModal('exam');
  };

  const openCreatorModal = () => {
    setWindowModal('creator');
  };

  const closeWindowModal = () => {
    setWindowModal('none');
  };

  const openSlidingPanel = (exam: Exam, mode: SlidingPanelMode = 'syllabus') => {
    setSelectedExamId(exam.id);
    setSlidingPanelExam(exam);
    setSlidingPanelMode(mode);
    setLastEvaluation(null);
  };

  const closeSlidingPanel = () => {
    setSlidingPanelExam(null);
  };

  const startExam = (examId: string) => {
    const examObj = exams.find((e) => e.id === examId) || exams[0];
    openSlidingPanel(examObj, 'runner');
  };

  const addQuestion = (newQ: Omit<Question, 'id' | 'createdAt'>): Question => {
    const id = `q-cust-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const question: Question = {
      ...newQ,
      id,
      createdAt: new Date().toISOString(),
    };

    setQuestions((prev) => [question, ...prev]);

    // If attached to an exam, update that exam too
    if (question.examId) {
      setExams((prevExams) =>
        prevExams.map((e) => {
          if (e.id === question.examId) {
            return {
              ...e,
              questions: [...e.questions, question],
            };
          }
          return e;
        })
      );
    }

    return question;
  };

  const deleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    setExams((prevExams) =>
      prevExams.map((e) => ({
        ...e,
        questions: e.questions.filter((q) => q.id !== id),
      }))
    );
  };

  const submitCandidateExam = async (
    examId: string,
    answers: Record<string, string>,
    timeSpentSeconds: number
  ): Promise<EvaluationResult> => {
    const targetExam = exams.find((e) => e.id === examId) || INITIAL_EXAMS[0];

    // Try server submit first to mirror the real REST API flow
    try {
      const response = await fetch('/api/v1/exams/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId,
          candidateName,
          answers,
          timeSpentSeconds,
        }),
      });

      if (response.ok) {
        const payload = await response.json();
        if (payload?.evaluation) {
          const evalResult = payload.evaluation as EvaluationResult;
          setLastEvaluation(evalResult);

          const newSubmission: ExamSubmission = {
            id: evalResult.submissionId,
            examId: targetExam.id,
            examTitle: targetExam.title,
            candidateName: evalResult.candidateName,
            candidateRole: activeRole,
            answers,
            scorePercent: evalResult.scorePercent,
            totalPoints: evalResult.totalPoints,
            earnedPoints: evalResult.earnedPoints,
            passed: evalResult.passed,
            timeSpentSeconds,
            submittedAt: evalResult.submittedAt,
            categoryBreakdown: evalResult.categoryBreakdown,
            detailedResults: evalResult.details,
          };

          setSubmissions((prev) => [newSubmission, ...prev]);
          return evalResult;
        }
      }
    } catch {
      // Fallback to local evaluator if server network is unreachable
    }

    // Local evaluation fallback
    const localEvaluation = evaluateExamAnswers(
      targetExam,
      answers,
      candidateName,
      timeSpentSeconds
    );

    const fallbackSubmission: ExamSubmission = {
      id: localEvaluation.submissionId,
      examId: targetExam.id,
      examTitle: targetExam.title,
      candidateName: localEvaluation.candidateName,
      candidateRole: activeRole,
      answers,
      scorePercent: localEvaluation.scorePercent,
      totalPoints: localEvaluation.totalPoints,
      earnedPoints: localEvaluation.earnedPoints,
      passed: localEvaluation.passed,
      timeSpentSeconds,
      submittedAt: localEvaluation.submittedAt,
      categoryBreakdown: localEvaluation.categoryBreakdown,
      detailedResults: localEvaluation.details,
    };

    setLastEvaluation(localEvaluation);
    setSubmissions((prev) => [fallbackSubmission, ...prev]);
    return localEvaluation;
  };

  const resetDatabase = async () => {
    setIsResetting(true);
    try {
      // Call server seed endpoint
      await fetch('/api/v1/seed', { method: 'POST' }).catch(() => {});

      // Reset client state
      setExams(JSON.parse(JSON.stringify(INITIAL_EXAMS)));
      setQuestions(JSON.parse(JSON.stringify(INITIAL_QUESTIONS)));
      setSubmissions(JSON.parse(JSON.stringify(INITIAL_SUBMISSIONS)));
      setLastEvaluation(null);
      setSelectedExamId(INITIAL_EXAMS[0].id);

      localStorage.removeItem(STORAGE_KEYS.EXAMS);
      localStorage.removeItem(STORAGE_KEYS.QUESTIONS);
      localStorage.removeItem(STORAGE_KEYS.SUBMISSIONS);
    } finally {
      setTimeout(() => setIsResetting(false), 500);
    }
  };

  return (
    <QuizContext.Provider
      value={{
        exams,
        questions,
        submissions,
        activeTab,
        setActiveTab,
        activeRole,
        setActiveRole,
        selectedExamId,
        setSelectedExamId,
        candidateName,
        setCandidateName,
        lastEvaluation,
        setLastEvaluation,
        windowModal,
        openExamModal,
        openCreatorModal,
        closeWindowModal,
        slidingPanelExam,
        slidingPanelMode,
        openSlidingPanel,
        closeSlidingPanel,
        startExam,
        addQuestion,
        deleteQuestion,
        submitCandidateExam,
        resetDatabase,
        isResetting,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
}

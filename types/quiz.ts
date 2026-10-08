export type QuestionType = 'multiple-choice' | 'true-false' | 'code-analysis';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type UserRole = 'Instructor' | 'Candidate';

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface Question {
  id: string;
  examId?: string;
  title: string;
  prompt: string;
  codeSnippet?: string;
  codeLanguage?: string;
  category: string;
  difficulty: Difficulty;
  type: QuestionType;
  options: QuestionOption[];
  pointWeight: number;
  explanation: string;
  createdAt: string;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: Difficulty;
  durationMinutes: number;
  passingScorePercent: number;
  questions: Question[];
  createdAt: string;
}

export interface EvaluationDetail {
  questionId: string;
  questionTitle: string;
  prompt: string;
  category: string;
  difficulty: Difficulty;
  pointsPossible: number;
  pointsEarned: number;
  isCorrect: boolean;
  selectedOptionId: string | null;
  selectedOptionText: string | null;
  correctOptionId: string;
  correctOptionText: string;
  explanation: string;
}

export interface CategoryPerformance {
  category: string;
  totalPoints: number;
  earnedPoints: number;
  percentage: number;
  questionCount: number;
  correctCount: number;
}

export interface ExamSubmission {
  id: string;
  examId: string;
  examTitle: string;
  candidateName: string;
  candidateRole: UserRole;
  answers: Record<string, string>; // questionId -> optionId
  scorePercent: number;
  totalPoints: number;
  earnedPoints: number;
  passed: boolean;
  timeSpentSeconds: number;
  submittedAt: string;
  categoryBreakdown: Record<string, CategoryPerformance>;
  detailedResults: EvaluationDetail[];
}

export interface EvaluationResult {
  submissionId: string;
  examId: string;
  examTitle: string;
  candidateName: string;
  scorePercent: number;
  totalPoints: number;
  earnedPoints: number;
  passed: boolean;
  passingScorePercent: number;
  timeSpentSeconds: number;
  submittedAt: string;
  details: EvaluationDetail[];
  categoryBreakdown: Record<string, CategoryPerformance>;
}

export type ActiveTab = 'home' | 'creator' | 'runner' | 'analytics' | 'architecture';

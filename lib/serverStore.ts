import { Exam, Question, ExamSubmission } from '@/types/quiz';
import { INITIAL_EXAMS, INITIAL_QUESTIONS, INITIAL_SUBMISSIONS } from '@/lib/seedData';

// Global singleton in memory for Next.js API route handling
declare global {
  var __quizServerStore: {
    exams: Exam[];
    questions: Question[];
    submissions: ExamSubmission[];
    startTime: number;
  } | undefined;
}

if (!global.__quizServerStore) {
  global.__quizServerStore = {
    exams: JSON.parse(JSON.stringify(INITIAL_EXAMS)),
    questions: JSON.parse(JSON.stringify(INITIAL_QUESTIONS)),
    submissions: JSON.parse(JSON.stringify(INITIAL_SUBMISSIONS)),
    startTime: Date.now(),
  };
}

export const serverStore = global.__quizServerStore;

export function resetServerStore() {
  if (global.__quizServerStore) {
    global.__quizServerStore.exams = JSON.parse(JSON.stringify(INITIAL_EXAMS));
    global.__quizServerStore.questions = JSON.parse(JSON.stringify(INITIAL_QUESTIONS));
    global.__quizServerStore.submissions = JSON.parse(JSON.stringify(INITIAL_SUBMISSIONS));
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { serverStore } from '@/lib/serverStore';
import { evaluateExamAnswers } from '@/lib/evaluator';
import { ExamSubmission } from '@/types/quiz';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { examId, candidateName, answers, timeSpentSeconds } = body;

    if (!examId) {
      return NextResponse.json(
        { status: 'error', code: 'MISSING_EXAM_ID', message: 'Exam ID is required.' },
        { status: 400 }
      );
    }

    const exam = serverStore.exams.find((e) => e.id === examId);
    if (!exam) {
      return NextResponse.json(
        { status: 'error', code: 'EXAM_NOT_FOUND', message: `Exam '${examId}' does not exist.` },
        { status: 404 }
      );
    }

    const evaluation = evaluateExamAnswers(
      exam,
      answers || {},
      candidateName || 'Anonymous Candidate',
      Number(timeSpentSeconds) || 0
    );

    const submissionRecord: ExamSubmission = {
      id: evaluation.submissionId,
      examId: exam.id,
      examTitle: exam.title,
      candidateName: evaluation.candidateName,
      candidateRole: 'Candidate',
      answers: answers || {},
      scorePercent: evaluation.scorePercent,
      totalPoints: evaluation.totalPoints,
      earnedPoints: evaluation.earnedPoints,
      passed: evaluation.passed,
      timeSpentSeconds: evaluation.timeSpentSeconds,
      submittedAt: evaluation.submittedAt,
      categoryBreakdown: evaluation.categoryBreakdown,
      detailedResults: evaluation.details,
    };

    serverStore.submissions.unshift(submissionRecord);

    return NextResponse.json(
      {
        status: 'success',
        message: 'Assessment evaluated and recorded.',
        timestamp: new Date().toISOString(),
        evaluation,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: 'Failed to evaluate exam submission', details: String(error) },
      { status: 500 }
    );
  }
}

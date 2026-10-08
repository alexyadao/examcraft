import { NextRequest, NextResponse } from 'next/server';
import { serverStore } from '@/lib/serverStore';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');

    let exams = serverStore.exams;

    if (category && category !== 'All') {
      exams = exams.filter((e) => e.category.toLowerCase() === category.toLowerCase());
    }

    if (difficulty && difficulty !== 'All') {
      exams = exams.filter((e) => e.difficulty.toLowerCase() === difficulty.toLowerCase());
    }

    // Response includes question summaries without leaking full answer keys in exam listing
    const sanitizedExams = exams.map((exam) => ({
      id: exam.id,
      title: exam.title,
      description: exam.description,
      category: exam.category,
      difficulty: exam.difficulty,
      durationMinutes: exam.durationMinutes,
      passingScorePercent: exam.passingScorePercent,
      questionCount: exam.questions.length,
      totalPoints: exam.questions.reduce((acc, q) => acc + (q.pointWeight || 1), 0),
      createdAt: exam.createdAt,
      questions: exam.questions.map((q) => ({
        id: q.id,
        title: q.title,
        prompt: q.prompt,
        category: q.category,
        difficulty: q.difficulty,
        type: q.type,
        pointWeight: q.pointWeight,
        codeSnippet: q.codeSnippet,
        codeLanguage: q.codeLanguage,
        options: q.options.map((opt) => ({
          id: opt.id,
          text: opt.text,
        })),
      })),
    }));

    return NextResponse.json(
      {
        status: 'success',
        count: sanitizedExams.length,
        timestamp: new Date().toISOString(),
        data: sanitizedExams,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: 'Failed to retrieve exams', details: String(error) },
      { status: 500 }
    );
  }
}

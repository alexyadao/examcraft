import { NextRequest, NextResponse } from 'next/server';
import { serverStore } from '@/lib/serverStore';
import { Question } from '@/types/quiz';

export async function GET() {
  try {
    return NextResponse.json(
      {
        status: 'success',
        count: serverStore.questions.length,
        timestamp: new Date().toISOString(),
        data: serverStore.questions,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: 'Failed to retrieve questions', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, prompt, category, difficulty, type, options, pointWeight, explanation, codeSnippet, codeLanguage, examId } = body;

    // Validation
    if (!title || typeof title !== 'string' || title.trim().length < 3) {
      return NextResponse.json(
        { status: 'error', code: 'INVALID_TITLE', message: 'Question title must be at least 3 characters long.' },
        { status: 400 }
      );
    }

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 5) {
      return NextResponse.json(
        { status: 'error', code: 'INVALID_PROMPT', message: 'Question prompt must be at least 5 characters long.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(options) || options.length < 2) {
      return NextResponse.json(
        { status: 'error', code: 'INSUFFICIENT_OPTIONS', message: 'At least 2 options are required.' },
        { status: 400 }
      );
    }

    const hasCorrect = options.some((opt) => Boolean(opt.isCorrect));
    if (!hasCorrect) {
      return NextResponse.json(
        { status: 'error', code: 'MISSING_CORRECT_OPTION', message: 'At least one option must be marked as correct.' },
        { status: 400 }
      );
    }

    const newQuestion: Question = {
      id: `q-custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      examId: examId || undefined,
      title: title.trim(),
      prompt: prompt.trim(),
      category: category?.trim() || 'General Engineering',
      difficulty: difficulty || 'Medium',
      type: type || 'multiple-choice',
      codeSnippet: codeSnippet?.trim() || undefined,
      codeLanguage: codeLanguage || 'typescript',
      options: options.map((opt, idx) => ({
        id: opt.id || `opt-${idx + 1}-${Math.random().toString(36).substring(2, 6)}`,
        text: opt.text?.trim() || `Option ${idx + 1}`,
        isCorrect: Boolean(opt.isCorrect),
        explanation: opt.explanation?.trim() || undefined,
      })),
      pointWeight: Number(pointWeight) > 0 ? Number(pointWeight) : 2,
      explanation: explanation?.trim() || 'No explanation provided.',
      createdAt: new Date().toISOString(),
    };

    serverStore.questions.unshift(newQuestion);

    // If an examId was specified, add to the exam questions too
    if (examId) {
      const targetExam = serverStore.exams.find((e) => e.id === examId);
      if (targetExam) {
        targetExam.questions.push(newQuestion);
      }
    }

    return NextResponse.json(
      {
        status: 'created',
        message: 'Question created successfully in bank.',
        timestamp: new Date().toISOString(),
        data: newQuestion,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: 'Failed to process question creation', details: String(error) },
      { status: 500 }
    );
  }
}

import { NextRequest } from 'next/server';
import { getAllQuizSets, saveQuizSet } from '@/lib/quiz-store';
import { QuizSet } from '@/lib/quiz-types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const sets = getAllQuizSets();
  return Response.json({ sets });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Partial<QuizSet>;
    if (!body.title || !body.category) {
      return Response.json({ error: 'title and category are required' }, { status: 400 });
    }

    const now = Date.now();
    const newSet: QuizSet = {
      id: body.id ?? `custom-${now}-${Math.random().toString(36).slice(2, 8)}`,
      title: body.title,
      category: body.category,
      description: body.description ?? '',
      questions: body.questions ?? [],
      createdAt: now,
      updatedAt: now,
    };

    saveQuizSet(newSet);
    return Response.json({ set: newSet }, { status: 201 });
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

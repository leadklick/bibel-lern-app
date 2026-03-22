import { NextRequest } from 'next/server';
import { getQuizSet, saveQuizSet, deleteQuizSet } from '@/lib/quiz-store';
import { QuizSet } from '@/lib/quiz-types';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const set = getQuizSet(id);
  if (!set) {
    return Response.json({ error: 'Quiz set not found' }, { status: 404 });
  }
  return Response.json({ set });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json() as Partial<QuizSet>;
    const existing = getQuizSet(id);
    if (!existing) {
      return Response.json({ error: 'Quiz set not found' }, { status: 404 });
    }

    const updated: QuizSet = {
      ...existing,
      ...body,
      id, // ensure id doesn't change
      updatedAt: Date.now(),
    };

    saveQuizSet(updated);
    return Response.json({ set: updated });
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deleted = deleteQuizSet(id);
  if (!deleted) {
    return Response.json({ error: 'Quiz set not found' }, { status: 404 });
  }
  return Response.json({ success: true });
}

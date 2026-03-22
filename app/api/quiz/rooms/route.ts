import { NextRequest } from 'next/server';
import { createRoom, getQuizSet, getRoomPublicView, cleanupOldRooms } from '@/lib/quiz-store';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { quizSetId } = await request.json() as { quizSetId: string };

    if (!quizSetId) {
      return Response.json({ error: 'quizSetId is required' }, { status: 400 });
    }

    const quizSet = getQuizSet(quizSetId);
    if (!quizSet) {
      return Response.json({ error: 'Quiz set not found' }, { status: 404 });
    }

    if (quizSet.questions.length === 0) {
      return Response.json({ error: 'Quiz set has no questions' }, { status: 400 });
    }

    // Periodically clean up old rooms
    cleanupOldRooms();

    const hostId = `host-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const room = createRoom(quizSetId, quizSet, hostId);

    return Response.json({
      room: getRoomPublicView(room),
      hostId,
      code: room.code,
    }, { status: 201 });
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

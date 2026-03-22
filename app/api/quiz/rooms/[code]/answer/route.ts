import { NextRequest } from 'next/server';
import { submitAnswer, getRoomPublicView } from '@/lib/quiz-store';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  try {
    const { playerId, answerIndex } = await request.json() as {
      playerId: string;
      answerIndex: number;
    };

    if (!playerId || answerIndex === undefined) {
      return Response.json({ error: 'playerId and answerIndex are required' }, { status: 400 });
    }

    if (answerIndex < 0 || answerIndex > 3) {
      return Response.json({ error: 'answerIndex must be 0-3' }, { status: 400 });
    }

    const result = submitAnswer(code, playerId, answerIndex);
    if (!result) {
      return Response.json(
        { error: 'Could not submit answer — room not in question state or already answered' },
        { status: 400 }
      );
    }

    return Response.json({
      points: result.points,
      room: getRoomPublicView(result.room, playerId),
    });
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

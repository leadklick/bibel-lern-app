import { NextRequest } from 'next/server';
import { joinRoom, getRoomPublicView } from '@/lib/quiz-store';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  try {
    const { nickname } = await request.json() as { nickname: string };

    if (!nickname || !nickname.trim()) {
      return Response.json({ error: 'nickname is required' }, { status: 400 });
    }

    const playerId = `player-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const room = joinRoom(code, playerId, nickname);

    if (!room) {
      return Response.json({ error: 'Room not found or game already started' }, { status: 404 });
    }

    return Response.json({
      playerId,
      room: getRoomPublicView(room, playerId),
    });
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

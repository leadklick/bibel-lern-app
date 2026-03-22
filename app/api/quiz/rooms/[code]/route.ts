import { NextRequest } from 'next/server';
import { getRoom, getRoomPublicView } from '@/lib/quiz-store';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const { searchParams } = new URL(request.url);
  const playerId = searchParams.get('playerId') ?? undefined;

  const room = getRoom(code);
  if (!room) {
    return Response.json({ error: 'Room not found' }, { status: 404 });
  }

  return Response.json({ room: getRoomPublicView(room, playerId) });
}

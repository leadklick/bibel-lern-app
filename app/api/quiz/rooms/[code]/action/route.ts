import { NextRequest } from 'next/server';
import {
  startGame,
  startQuestion,
  revealAnswer,
  showLeaderboard,
  nextQuestion,
  getRoomPublicView,
} from '@/lib/quiz-store';

export const dynamic = 'force-dynamic';

type Action = 'start' | 'startQuestion' | 'revealAnswer' | 'showLeaderboard' | 'nextQuestion';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  try {
    const { hostId, action } = await request.json() as { hostId: string; action: Action };

    if (!hostId || !action) {
      return Response.json({ error: 'hostId and action are required' }, { status: 400 });
    }

    let room = null;

    switch (action) {
      case 'start':
        room = startGame(code, hostId);
        break;
      case 'startQuestion':
        room = startQuestion(code, hostId);
        break;
      case 'revealAnswer':
        room = revealAnswer(code, hostId);
        break;
      case 'showLeaderboard':
        room = showLeaderboard(code, hostId);
        break;
      case 'nextQuestion':
        room = nextQuestion(code, hostId);
        break;
      default:
        return Response.json({ error: 'Unknown action' }, { status: 400 });
    }

    if (!room) {
      return Response.json(
        { error: 'Action failed — room not found, unauthorized, or invalid state' },
        { status: 400 }
      );
    }

    return Response.json({ room: getRoomPublicView(room) });
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

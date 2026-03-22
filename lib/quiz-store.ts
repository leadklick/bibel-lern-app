import { Room, RoomPublicView, Player, PlayerAnswer, QuizSet } from './quiz-types';
import { DEFAULT_QUIZ_SETS } from './quiz-sets';

// ── Global in-memory store (survives hot reload in dev) ────────────────────────

declare global {
  var __quizRooms: Map<string, Room> | undefined;
  var __quizSets: Map<string, QuizSet> | undefined;
}

const rooms: Map<string, Room> =
  global.__quizRooms ?? (global.__quizRooms = new Map());

const quizSets: Map<string, QuizSet> =
  global.__quizSets ??
  (global.__quizSets = new Map(DEFAULT_QUIZ_SETS.map((s) => [s.id, s])));

// ── Quiz Sets ─────────────────────────────────────────────────────────────────

export function getAllQuizSets(): QuizSet[] {
  return Array.from(quizSets.values());
}

export function getQuizSet(id: string): QuizSet | undefined {
  return quizSets.get(id);
}

export function saveQuizSet(set: QuizSet): void {
  quizSets.set(set.id, set);
}

export function deleteQuizSet(id: string): boolean {
  return quizSets.delete(id);
}

// ── Room code generation ───────────────────────────────────────────────────────

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I, O, 0, 1 to avoid confusion
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  // Ensure uniqueness
  if (rooms.has(code)) return generateRoomCode();
  return code;
}

// ── Room operations ────────────────────────────────────────────────────────────

export function createRoom(quizSetId: string, quizSet: QuizSet, hostId: string): Room {
  const code = generateRoomCode();
  const room: Room = {
    code,
    quizSetId,
    quizSet,
    hostId,
    state: 'lobby',
    currentQuestionIndex: 0,
    questionStartedAt: null,
    players: {},
    answers: {},
    questionHistory: {},
    createdAt: Date.now(),
  };
  rooms.set(code, room);
  return room;
}

export function getRoom(code: string): Room | undefined {
  return rooms.get(code.toUpperCase());
}

export function joinRoom(
  code: string,
  playerId: string,
  nickname: string
): Room | null {
  const room = rooms.get(code.toUpperCase());
  if (!room) return null;
  if (room.state !== 'lobby') return null;

  const player: Player = {
    id: playerId,
    nickname: nickname.trim().slice(0, 20),
    score: 0,
    streak: 0,
    lastAnswerCorrect: null,
    joinedAt: Date.now(),
  };
  room.players[playerId] = player;
  return room;
}

export function startGame(code: string, hostId: string): Room | null {
  const room = rooms.get(code.toUpperCase());
  if (!room) return null;
  if (room.hostId !== hostId) return null;
  if (room.state !== 'lobby') return null;

  room.state = 'question';
  room.currentQuestionIndex = 0;
  room.questionStartedAt = Date.now();
  room.answers = {};
  return room;
}

export function startQuestion(code: string, hostId: string): Room | null {
  const room = rooms.get(code.toUpperCase());
  if (!room) return null;
  if (room.hostId !== hostId) return null;

  room.state = 'question';
  room.questionStartedAt = Date.now();
  room.answers = {};
  return room;
}

export function submitAnswer(
  code: string,
  playerId: string,
  answerIndex: number
): { room: Room; points: number } | null {
  const room = rooms.get(code.toUpperCase());
  if (!room) return null;
  if (room.state !== 'question') return null;
  if (!room.players[playerId]) return null;
  if (room.answers[playerId]) return null; // already answered

  const question = room.quizSet.questions[room.currentQuestionIndex];
  if (!question) return null;

  const answeredAt = room.questionStartedAt
    ? Date.now() - room.questionStartedAt
    : question.timeLimit * 1000;

  const correct = answerIndex === question.correct;

  let points = 0;
  if (correct) {
    const timeLimit = question.timeLimit;
    const timeFraction = Math.min(answeredAt / (timeLimit * 1000), 1);
    const basePoints = Math.round(1000 * (1 - timeFraction * 0.5));
    const player = room.players[playerId];
    const streak = player.streak + 1;
    const streakBonus = Math.min(streak - 1, 3) * 100;
    points = basePoints + streakBonus;
  }

  const playerAnswer: PlayerAnswer = {
    playerId,
    answerIndex,
    answeredAt,
    correct,
    points,
  };

  room.answers[playerId] = playerAnswer;

  // Update player score and streak
  const player = room.players[playerId];
  if (correct) {
    player.score += points;
    player.streak += 1;
  } else {
    player.streak = 0;
  }
  player.lastAnswerCorrect = correct;

  return { room, points };
}

export function revealAnswer(code: string, hostId: string): Room | null {
  const room = rooms.get(code.toUpperCase());
  if (!room) return null;
  if (room.hostId !== hostId) return null;
  if (room.state !== 'question') return null;

  // Save answers to history
  room.questionHistory[room.currentQuestionIndex] = { ...room.answers };
  room.state = 'reveal';
  return room;
}

export function showLeaderboard(code: string, hostId: string): Room | null {
  const room = rooms.get(code.toUpperCase());
  if (!room) return null;
  if (room.hostId !== hostId) return null;
  if (room.state !== 'reveal') return null;

  room.state = 'leaderboard';
  return room;
}

export function nextQuestion(code: string, hostId: string): Room | null {
  const room = rooms.get(code.toUpperCase());
  if (!room) return null;
  if (room.hostId !== hostId) return null;
  if (room.state !== 'leaderboard') return null;

  const nextIndex = room.currentQuestionIndex + 1;
  if (nextIndex >= room.quizSet.questions.length) {
    room.state = 'finished';
  } else {
    room.currentQuestionIndex = nextIndex;
    room.state = 'question';
    room.questionStartedAt = Date.now();
    room.answers = {};
  }

  return room;
}

export function getRoomPublicView(room: Room, _playerId?: string): RoomPublicView {
  const question = room.quizSet.questions[room.currentQuestionIndex] ?? null;
  const players = Object.values(room.players).sort((a, b) => b.score - a.score);

  let currentQuestion: Omit<(typeof question), 'correct'> | null = null;
  if (question) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { correct: _c, ...rest } = question;
    currentQuestion = rest;
  }

  return {
    code: room.code,
    state: room.state,
    currentQuestionIndex: room.currentQuestionIndex,
    totalQuestions: room.quizSet.questions.length,
    questionStartedAt: room.questionStartedAt,
    currentQuestion,
    currentQuestionCorrect:
      room.state === 'reveal' || room.state === 'leaderboard' || room.state === 'finished'
        ? question?.correct
        : undefined,
    players,
    answers: room.state === 'reveal' || room.state === 'leaderboard' || room.state === 'finished'
      ? room.answers
      : {},
    timeLimit: question?.timeLimit ?? 20,
    playerCount: Object.keys(room.players).length,
  };
}

// ── Cleanup ────────────────────────────────────────────────────────────────────

export function cleanupOldRooms(): void {
  const fourHoursAgo = Date.now() - 4 * 60 * 60 * 1000;
  for (const [code, room] of rooms.entries()) {
    if (room.createdAt < fourHoursAgo) {
      rooms.delete(code);
    }
  }
}

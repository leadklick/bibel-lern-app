export interface QuizQuestion {
  id: string;
  text: string;
  answers: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
  timeLimit: number; // seconds, default 20
  explanation?: string;
}

export interface QuizSet {
  id: string;
  title: string;
  category: string; // 'AT' | 'NT' | 'Psalmen' | 'Evangelien' | 'Paulus' | 'Propheten' | 'Gemischt'
  description: string;
  questions: QuizQuestion[];
  createdAt: number;
  updatedAt: number;
}

export type RoomState = 'lobby' | 'question' | 'reveal' | 'leaderboard' | 'finished';

export interface Player {
  id: string;
  nickname: string;
  score: number;
  streak: number;
  lastAnswerCorrect: boolean | null;
  joinedAt: number;
}

export interface PlayerAnswer {
  playerId: string;
  answerIndex: number;
  answeredAt: number; // ms since question started
  correct: boolean;
  points: number;
}

export interface Room {
  code: string;
  quizSetId: string;
  quizSet: QuizSet;
  hostId: string;
  state: RoomState;
  currentQuestionIndex: number;
  questionStartedAt: number | null;
  players: Record<string, Player>;
  answers: Record<string, PlayerAnswer>; // playerId -> answer for current question
  questionHistory: Record<number, Record<string, PlayerAnswer>>; // questionIndex -> answers
  createdAt: number;
}

export interface RoomPublicView {
  code: string;
  state: RoomState;
  currentQuestionIndex: number;
  totalQuestions: number;
  questionStartedAt: number | null;
  currentQuestion: Omit<QuizQuestion, 'correct'> | null; // hide correct answer
  currentQuestionCorrect?: 0 | 1 | 2 | 3; // only revealed in 'reveal' state
  players: Player[];
  answers: Record<string, PlayerAnswer>; // visible in reveal state
  timeLimit: number;
  playerCount: number;
}

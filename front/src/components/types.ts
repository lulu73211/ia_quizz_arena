export type QuizConfig = {
  title: string;
  description: string;
  questionCount: number;
  timeLimitSeconds: number;
  difficulty: "easy" | "medium" | "hard";
  theme: string;
};

export type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
};

export type QuizData = {
  id: string;
  title: string;
  description: string;
  theme: string;
  numberOfQuestions: number;
  difficulty: "easy" | "medium" | "hard";
  timePerQuestion: number;
  questions: QuizQuestion[];
  ownerId: string;
  ownerEmail?: string;
  createdAt: string;
  updatedAt: string;
};

export type UserProfile = {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  score: number;
  gamesPlayed: number;
  gamesWon?: number;
  createdAt: string;
  updatedAt?: string;
};

export type LeaderboardEntry = UserProfile & {
  rank: number;
};

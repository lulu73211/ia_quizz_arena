export type QuizConfig = {
  title: string;
  description: string;
  questionCount: number;
  timeLimitSeconds: number;
  difficulty: "easy" | "medium" | "hard";
  theme: string;
};

export type QuizOption = {
  id: string;
  label: string;
  isCorrect?: boolean;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: QuizOption[];
  explanation?: string;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: "player" | "presenter" | "admin";
};

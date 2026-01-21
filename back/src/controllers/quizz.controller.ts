import { Request, Response } from "express";

type QuizConfig = {
  title: string;
  description: string;
  questionCount: number;
  timeLimitSeconds: number;
  difficulty: "easy" | "medium" | "hard";
  theme: string;
};

type QuizRecord = {
  id: string;
  config: QuizConfig;
  createdAt: string;
};

const quizzes: QuizRecord[] = [];

const sampleQuestion = {
  id: "q1",
  prompt: "Which planet is known as the Red Planet?",
  options: [
    { id: "a", label: "Mars", isCorrect: true },
    { id: "b", label: "Venus" },
    { id: "c", label: "Jupiter" },
    { id: "d", label: "Saturn" },
  ],
  explanation: "Mars looks reddish due to iron oxide on its surface.",
};

export const listQuizzes = (_req: Request, res: Response) => {
  res.json(quizzes);
};

export const createQuiz = (req: Request, res: Response) => {
  const config = req.body as QuizConfig;
  if (!config?.title) {
    res.status(400).json({ message: "Title is required." });
    return;
  }

  const record: QuizRecord = {
    id: `quiz_${Date.now()}`,
    config,
    createdAt: new Date().toISOString(),
  };
  quizzes.unshift(record);
  res.status(201).json(record);
};

export const getQuizById = (req: Request, res: Response) => {
  const record = quizzes.find((quiz) => quiz.id === req.params.id);
  if (!record) {
    res.status(404).json({ message: "Quiz not found." });
    return;
  }
  res.json(record);
};

export const getSampleQuestion = (_req: Request, res: Response) => {
  res.json(sampleQuestion);
};

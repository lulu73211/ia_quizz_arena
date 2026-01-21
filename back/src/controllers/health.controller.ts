import { Request, Response } from 'express';

export const getHealth = (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
};

export const getWelcome = (req: Request, res: Response) => {
  res.json({ message: 'Welcome to IA Quizz Arena API!' });
};

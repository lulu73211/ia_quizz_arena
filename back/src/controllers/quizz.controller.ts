import { Request, Response } from 'express';
import { Mistral } from '@mistralai/mistralai';
import dotenv from 'dotenv';

dotenv.config();

const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY || '',
});

interface QuizzQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export const getQuizzQuestions = async (req: Request, res: Response) => {
  try {
    const { theme } = req.body;

    if (!theme) {
      return res.status(400).json({ error: 'Le thème est requis' });
    }

    console.log(process.env.MISTRAL_API_KEY);

    const prompt = `Tu es un générateur de quiz éducatif. Génère 5 questions de quiz sur le thème suivant : "${theme}".

Pour chaque question, fournis :
- La question
- 4 options de réponse
- L'index de la bonne réponse (0, 1, 2 ou 3)
- Une courte explication de la réponse

IMPORTANT : Réponds UNIQUEMENT avec un tableau JSON valide, sans aucun texte avant ou après. Le format doit être exactement :
[
  {
    "question": "La question ici",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Explication de la réponse"
  }
]`;

    const response = await mistral.chat.complete({
      model: 'mistral-small-latest',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      responseFormat: { type: 'json_object' },
    });

    const content = response.choices?.[0]?.message?.content;

    if (!content || typeof content !== 'string') {
      return res.status(500).json({ error: 'Réponse invalide de Mistral' });
    }

    // Parse JSON response
    let questions: QuizzQuestion[];
    try {
      const parsed = JSON.parse(content);
      // Handle both array and object with questions property
      questions = Array.isArray(parsed) ? parsed : parsed.questions || [];
    } catch (parseError) {
      console.error('Erreur de parsing JSON:', content);
      return res.status(500).json({ error: 'Impossible de parser la réponse de l\'IA' });
    }

    return res.json({
      theme,
      questions,
      count: questions.length,
    });
  } catch (error) {
    console.error('Erreur lors de la génération du quiz:', error);
    return res.status(500).json({ error: 'Erreur lors de la génération des questions' });
  }
};

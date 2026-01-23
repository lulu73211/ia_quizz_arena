import { Request, Response } from 'express';
import { Mistral } from '@mistralai/mistralai';
import { firestore } from '../config/firebase';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
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

interface QuizzData {
  id?: string;
  title: string;
  description: string;
  theme: string;
  numberOfQuestions: number;
  difficulty: 'easy' | 'medium' | 'hard';
  timePerQuestion: number;
  questions: QuizzQuestion[];
  ownerId: string;
  ownerEmail?: string;
  createdAt: string;
  updatedAt: string;
}

// Generate quiz questions and store in Firebase
export const generateQuizzQuestions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { title, description, theme, numberOfQuestions, difficulty, timePerQuestion } = req.body;

    // Validation
    if (!theme) {
      return res.status(400).json({ error: 'Le thème est requis' });
    }
    if (!title) {
      return res.status(400).json({ error: 'Le titre est requis' });
    }

    const questionsCount = numberOfQuestions || 5;
    const quizDifficulty = difficulty || 'medium';
    const questionTime = timePerQuestion || 30;

    // Map difficulty to French for the prompt
    const difficultyLabels: Record<string, string> = {
      easy: 'facile',
      medium: 'moyen',
      hard: 'difficile',
    };

    const refinement = description ? `Prends en compte le commentaire suivant : ${description}` : '';

    const prompt = `Tu es un générateur de quiz éducatif. Génère ${questionsCount} questions de quiz sur le thème suivant : "${theme}".
Le niveau de difficulté doit être : ${difficultyLabels[quizDifficulty] || 'moyen'}.

${refinement}

Pour chaque question, fournis :
- La question
- 4 options de réponse
- L'index de la bonne réponse (0, 1, 2 ou 3)
- Une courte explication de la réponse

Fait en sorte de bien randomiser les réponses, par exemple si la bonne réponse est la première, il faut qu'elle ait 25% de chance d'être à n'importe quelle position.

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
      model: 'mistral-large-latest',
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

    // Create quiz data object
    const now = new Date().toISOString();
    const quizData: Omit<QuizzData, 'id'> = {
      title,
      description: description || '',
      theme,
      numberOfQuestions: questionsCount,
      difficulty: quizDifficulty,
      timePerQuestion: questionTime,
      questions,
      ownerId: req.user.uid,
      ownerEmail: req.user.email,
      createdAt: now,
      updatedAt: now,
    };

    // Store in Firebase
    const docRef = await firestore.collection('quizzes').add(quizData);

    return res.status(201).json({
      id: docRef.id,
      ...quizData,
    });
  } catch (error) {
    console.error('Erreur lors de la génération du quiz:', error);
    return res.status(500).json({ error: 'Erreur lors de la génération des questions' });
  }
};

// Get all quizzes owned by the current user
export const getMyQuizzes = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const snapshot = await firestore
      .collection('quizzes')
      .where('ownerId', '==', req.user.uid)
      .orderBy('createdAt', 'desc')
      .get();

    const quizzes: QuizzData[] = [];
    snapshot.forEach((doc) => {
      quizzes.push({
        id: doc.id,
        ...doc.data(),
      } as QuizzData);
    });

    return res.json({
      quizzes,
      count: quizzes.length,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des quizzes:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération des quizzes' });
  }
};

// Get a quiz by ID
export const getQuizById = async (req: Request, res: Response) => {
  try {
    const quizId = req.params.id as string;

    if (!quizId) {
      return res.status(400).json({ error: 'L\'ID du quiz est requis' });
    }

    const docRef = await firestore.collection('quizzes').doc(quizId).get();

    if (!docRef.exists) {
      return res.status(404).json({ error: 'Quiz non trouvé' });
    }

    return res.json({
      id: docRef.id,
      ...docRef.data(),
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du quiz:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération du quiz' });
  }
};

// Delete a quiz (only owner can delete)
export const deleteQuiz = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const quizId = req.params.id as string;

    if (!quizId) {
      return res.status(400).json({ error: 'L\'ID du quiz est requis' });
    }

    const docRef = await firestore.collection('quizzes').doc(quizId).get();

    if (!docRef.exists) {
      return res.status(404).json({ error: 'Quiz non trouvé' });
    }

    const quizData = docRef.data();
    if (quizData?.ownerId !== req.user.uid) {
      return res.status(403).json({ error: 'Vous n\'êtes pas autorisé à supprimer ce quiz' });
    }

    await firestore.collection('quizzes').doc(quizId).delete();

    return res.json({ message: 'Quiz supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du quiz:', error);
    return res.status(500).json({ error: 'Erreur lors de la suppression du quiz' });
  }
};

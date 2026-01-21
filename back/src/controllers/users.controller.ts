import { Request, Response } from 'express';
import { auth, firestore } from '../config/firebase';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

// Get current user profile
export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const userDoc = await firestore.collection('users').doc(req.user.uid).get();

    if (!userDoc.exists) {
      // Create user profile if it doesn't exist
      const userData = {
        uid: req.user.uid,
        email: req.user.email,
        createdAt: new Date().toISOString(),
        score: 0,
        gamesPlayed: 0,
      };
      await firestore.collection('users').doc(req.user.uid).set(userData);
      return res.json(userData);
    }

    return res.json(userDoc.data());
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Update user profile
export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { displayName, photoURL } = req.body;

    const updates: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    if (displayName) updates.displayName = displayName;
    if (photoURL) updates.photoURL = photoURL;

    await firestore.collection('users').doc(req.user.uid).update(updates);

    const updatedDoc = await firestore.collection('users').doc(req.user.uid).get();

    return res.json(updatedDoc.data());
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Get leaderboard
export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const snapshot = await firestore
      .collection('users')
      .orderBy('score', 'desc')
      .limit(limit)
      .get();

    const leaderboard = snapshot.docs.map((doc, index) => ({
      rank: index + 1,
      ...doc.data(),
    }));

    return res.json(leaderboard);
  } catch (error) {
    console.error('Erreur lors de la récupération du leaderboard:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Update user score
export const updateScore = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { scoreToAdd } = req.body;

    if (typeof scoreToAdd !== 'number') {
      return res.status(400).json({ error: 'Score invalide' });
    }

    const userRef = firestore.collection('users').doc(req.user.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const currentData = userDoc.data()!;
    const newScore = (currentData.score || 0) + scoreToAdd;
    const newGamesPlayed = (currentData.gamesPlayed || 0) + 1;

    await userRef.update({
      score: newScore,
      gamesPlayed: newGamesPlayed,
      updatedAt: new Date().toISOString(),
    });

    return res.json({
      score: newScore,
      gamesPlayed: newGamesPlayed,
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du score:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};

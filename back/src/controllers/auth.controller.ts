import { Request, Response } from 'express';
import { auth, firestore } from '../config/firebase';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

// Register a new user (called after Firebase Auth signup on frontend)
export const register = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { displayName } = req.body;

    // Check if user already exists
    const existingUser = await firestore.collection('users').doc(req.user.uid).get();
    
    if (existingUser.exists) {
      return res.status(400).json({ error: 'Utilisateur déjà enregistré' });
    }

    // Create user document in Firestore
    const userData = {
      uid: req.user.uid,
      email: req.user.email,
      displayName: displayName || req.user.email?.split('@')[0] || 'Joueur',
      photoURL: null,
      score: 0,
      gamesPlayed: 0,
      gamesWon: 0,
      createdAt: new Date().toISOString(),
    };

    await firestore.collection('users').doc(req.user.uid).set(userData);

    return res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: userData,
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    return res.status(500).json({ error: 'Erreur lors de l\'inscription' });
  }
};

// Verify token and return user info
export const verifyToken = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Token invalide' });
    }

    // Get user data from Firestore
    const userDoc = await firestore.collection('users').doc(req.user.uid).get();

    if (!userDoc.exists) {
      return res.json({
        authenticated: true,
        registered: false,
        user: {
          uid: req.user.uid,
          email: req.user.email,
        },
      });
    }

    return res.json({
      authenticated: true,
      registered: true,
      user: userDoc.data(),
    });
  } catch (error) {
    console.error('Erreur lors de la vérification du token:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Get user by UID (for admin or game purposes)
export const getUserById = async (req: Request, res: Response) => {
  try {
    const uid = req.params.uid as string;

    const userDoc = await firestore.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Return public user data only
    const userData = userDoc.data()!;
    return res.json({
      uid: userData.uid,
      displayName: userData.displayName,
      photoURL: userData.photoURL,
      score: userData.score,
      gamesPlayed: userData.gamesPlayed,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Delete account
export const deleteAccount = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    // Delete user from Firestore
    await firestore.collection('users').doc(req.user.uid).delete();

    // Delete user from Firebase Auth
    await auth.deleteUser(req.user.uid);

    return res.json({ message: 'Compte supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du compte:', error);
    return res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
};

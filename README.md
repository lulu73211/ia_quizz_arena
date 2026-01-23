# QuizAI — README

Application web de quiz avec :
- **Backend** Node.js + Express
- **Frontend** (React/TS) avec interfaces **Présentateur** et **Joueur**
- Stockage des quiz dans **Firebase Firestore**
- Génération de questions via **Mistral API**

---

## Prérequis

- **Node.js LTS 24.11.0**
- **npm** (fourni avec Node)
- Un projet **Firebase** (Firestore activé + service account)
- Une clé API **Mistral**

---

## Installation

Clone le repo puis installe les dépendances des 2 projets (front + back).

### 1) Installer le backend

```bash```
cd back
npm install
### 2) Installer le frontend
```bash```
Copier le code
cd ../front
npm install
Configuration des variables d’environnement
Backend (back/.env)
Crée un fichier back/.env :

env
Copier le code
# Mistral
MISTRAL_API_KEY=xxxxxxxxxxxxxxxx

# Port backend
PORT=3001

# Firebase
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
⚠️ Important : FIREBASE_PRIVATE_KEY doit contenir les \n (retours à la ligne) comme ci-dessus.

Où récupérer ces infos Firebase ?
Dans Firebase Console :

Project settings → Service accounts

Génère une Private key JSON

Récupère :

project_id → FIREBASE_PROJECT_ID

client_email → FIREBASE_CLIENT_EMAIL

private_key → FIREBASE_PRIVATE_KEY

Frontend (front/.env)
Crée un fichier front/.env :

env
Copier le code
VITE_API_URL=http://localhost:3001
Si ton client.ts utilise déjà une URL en dur, adapte-le pour lire import.meta.env.VITE_API_URL.

Lancer le projet en développement
### 1) Démarrer le backend
bash
Copier le code
cd back
npm run dev
Le backend doit écouter sur :

http://localhost:3001

### 2) Démarrer le frontend
bash
Copier le code
cd ../front
npm run dev
Le front sera disponible sur :

http://localhost:5173 (ou autre port Vite)

Scripts utiles
Backend
Depuis back/ :

Démarrer en dev (watch) :

bash
Copier le code
npm run dev
Build :

bash
Copier le code
npm run build
Démarrer en prod :

bash
Copier le code
npm start
Frontend
Depuis front/ :

Démarrer en dev :

bash
Copier le code
npm run dev
Build :

bash
Copier le code
npm run build
Preview build :

bash
Copier le code
npm run preview
Endpoints API (backend)
Base: http://localhost:3001

POST /quizz/generate (auth requise)
Génère un quiz via Mistral et l’enregistre sur Firestore.

GET /quizz/my-quizzes (auth requise)
Retourne les quiz du user connecté.

GET /quizz (public, si activé)
Retourne tous les quiz (utile pour que le player choisisse).

GET /quizz/:id (selon ta logique : public ou owner-only)
Retourne un quiz par id.

DELETE /quizz/:id (auth requise)
Supprime un quiz (owner only).

Dépannage
1) “Non authentifié”
Ton front appelle un endpoint protégé sans token.

Vérifie que ton système d’auth (Firebase Auth / middleware) injecte bien Authorization: Bearer <token>.

2) Private key Firebase invalide
Assure-toi que FIREBASE_PRIVATE_KEY a bien des \n

Exemple :

env
Copier le code
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nXXXX\n-----END PRIVATE KEY-----\n"
3) Le front n’appelle pas le bon backend
Vérifie VITE_API_URL

Vérifie aussi le CORS côté backend si nécessaire.

Notes
Les quiz sont stockés dans Firestore collection : quizzes

Chaque quiz contient : title, description, theme, questions[], ownerId, etc.

Les questions contiennent : question, options[4], correctAnswer (0..3), explanation

Licence
Projet perso / interne — à adapter selon ton usage.

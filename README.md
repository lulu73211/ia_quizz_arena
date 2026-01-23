# 🎯 IA QUIZZ ARENA

**IA QUIZZ ARENA** est une application web de quiz interactive comprenant :

- 🧠 Génération automatique de quiz via l’API **Mistral**
- 🎤 Mode Présentateur (pilotage du quiz)
- 🎮 Mode Joueur (répondre aux questions)
- 🔥 Backend **Node.js / Express**
- ⚛️ Frontend **React + TypeScript**
- ☁️ Stockage **Firebase Firestore**

---

## 🧩 Architecture du projet

```
IA QUIZZ ARENA/
├── back/        # Backend Node.js / Express
├── front/       # Frontend React + TypeScript (Vite)
└── README.md
````

---

## ⚙️ Prérequis

Assure-toi d’avoir les éléments suivants installés :

- ✅ **Node.js LTS 24.13.0**
- ✅ **npm** (fourni avec Node)
- ✅ Un projet **Firebase**
  - Firestore activé
  - Clé de service (Service Account)
- ✅ Une **clé API Mistral**

Vérifier la version de Node.js :

```bash
node -v
# doit afficher v24.13.0
````

En cas de mauvaise version:
Utiliser nvm pour pouvoir passer d'une version à l'autre

Vérifier que nvm est bien installé :
````
nvm --version
````
Lien d'installation Windows: https://github.com/coreybutler/nvm/releases
Liens d'installation pour Linux et Mac: https://github.com/nvm-sh/nvm?tab=readme-ov-file#install--update-script

1️⃣ Installer Node.js 24.13.10
````
nvm install 24.13.10
````

2️⃣ Utiliser cette version
````
nvm use 24.13.10
````

---

## 📦 Installation

Cloner le dépôt :

```bash
git clone <url-du-repo>
cd IA QUIZZ ARENA
```

---

### 🔙 Installation du backend

```bash
cd back
npm install
```

---

### 🔜 Installation du frontend

```bash
cd ../front
npm install
```

---

## 🔐 Configuration des variables d’environnement

### Backend — `back/.env`

Créer un fichier `back/.env` :

```env
# =========================
# Mistral
# =========================
MISTRAL_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxx

# =========================
# Server
# =========================
PORT=3001

# =========================
# Firebase
# =========================
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nXXXXX\n-----END PRIVATE KEY-----\n"
```

⚠️ **Important**
La variable `FIREBASE_PRIVATE_KEY` doit contenir les `\n` pour les retours à la ligne.

📍 Firebase Console →
**Project Settings → Service Accounts → Generate new private key**

---

### Frontend — `front/.env`

Créer un fichier `front/.env` :

```env
VITE_API_URL=http://localhost:3001
```

---

## ▶️ Lancer le projet en développement

### 1️⃣ Lancer le backend

```bash
cd back
npm run dev
```

➡️ Backend disponible sur :
**[http://localhost:3001](http://localhost:3001)**

---

### 2️⃣ Lancer le frontend

```bash
cd ../front
npm run dev
```

➡️ Frontend disponible sur :
**[http://localhost:5173](http://localhost:5173)**

---

## 📜 Scripts disponibles

### Backend (`/back`)

```bash
npm run dev   
npm run build   
npm start       

---

### Frontend (`/front`)

```bash
npm run dev      
npm run build     
npm run preview   
```

---

## 🔌 API Backend

**Base URL** : `http://localhost:3001`

### Générer un quiz

`POST /quizz/generate` 🔒
Génère un quiz via Mistral et l’enregistre dans Firestore.

---

### Récupérer mes quiz

`GET /quizz/my-quizzes` 🔒
Retourne les quiz appartenant à l’utilisateur connecté.

---

### Récupérer un quiz par ID

`GET /quizz/:id`
Retourne le détail d’un quiz.

---

### Supprimer un quiz

`DELETE /quizz/:id` 🔒
Supprime un quiz (uniquement le propriétaire).

---

## 🧠 Modèle de données

### Quiz

```ts
{
  title: string
  description: string
  theme: string
  difficulty: "easy" | "medium" | "hard"
  timePerQuestion: number
  questions: QuizQuestion[]
  ownerId: string
  createdAt: string
}
```

---

### Question

```ts
{
  question: string
  options: string[4]
  correctAnswer: number
  explanation?: string
}
```

---

## 🧪 Dépannage

### ❌ “Non authentifié”

➡️ Le frontend appelle une route protégée sans token.

✔️ Vérifier :

* Middleware d’auth actif
* Header `Authorization: Bearer <token>`

---

### ❌ Erreur Firebase private key

✔️ Vérifier les `\n` dans `FIREBASE_PRIVATE_KEY`.

---

### ❌ Le frontend ne communique pas avec le backend

✔️ Vérifier :

* `VITE_API_URL`
* Le port du backend
* La configuration CORS si nécessaire

---

## 📄 Licence

Projet personnel / expérimental.
Libre à toi de l’adapter, le modifier ou le déployer.

---

✨ Bon dev et amuse-toi bien avec IA QUIZZ ARENA !

```
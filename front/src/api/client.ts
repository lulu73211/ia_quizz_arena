import { auth } from "../config/firebase";
import type { QuizConfig, QuizData, UserProfile, LeaderboardEntry } from "../components/types";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  // Add auth token if user is signed in
  const currentUser = auth.currentUser;
  if (currentUser) {
    const token = await currentUser.getIdToken();
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const text = await response.text();
    let errorMessage = `Request failed: ${response.status}`;
    try {
        const jsonError = JSON.parse(text);
        if (jsonError.error) errorMessage = jsonError.error;
    } catch {
        // use default error message
    }
    throw new Error(errorMessage);
  }

  // Handle empty responses (like DELETE)
  if (response.status === 204) {
      return {} as T;
  }

  return (await response.json()) as T;
}

// --- Auth & User ---

export async function verifyUser(): Promise<{ authenticated: boolean; registered: boolean; user: any }> {
  return request("/auth/verify");
}

export async function registerUser(displayName?: string): Promise<{ message: string; user: UserProfile }> {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ displayName }),
  });
}

export async function getUserProfile(): Promise<UserProfile> {
  return request<UserProfile>("/users/profile");
}

export async function updateUserProfile(data: Partial<UserProfile>): Promise<UserProfile> {
  return request<UserProfile>("/users/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function getLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
  return request<LeaderboardEntry[]>(`/users/leaderboard?limit=${limit}`);
}

export async function updateScore(scoreToAdd: number): Promise<{ score: number; gamesPlayed: number }> {
  return request("/users/score", {
    method: "POST",
    body: JSON.stringify({ scoreToAdd }),
  });
}

// --- Quiz ---

export async function generateQuiz(config: QuizConfig): Promise<QuizData> {
  // Map frontend config to backend payload
  const payload = {
    title: config.title,
    description: config.description,
    theme: config.theme,
    numberOfQuestions: config.questionCount,
    difficulty: config.difficulty,
    timePerQuestion: config.timeLimitSeconds,
  };

  return request<QuizData>("/quizz/generate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getMyQuizzes(): Promise<{ quizzes: QuizData[]; count: number }> {
  return request<{ quizzes: QuizData[]; count: number }>("/quizz/my-quizzes");
}

export async function getQuizById(id: string): Promise<QuizData> {
  return request<QuizData>(`/quizz/${id}`);
}

export async function deleteQuiz(id: string): Promise<{ message: string }> {
  return request<{ message: string }>(`/quizz/${id}`, {
    method: "DELETE",
  });
}

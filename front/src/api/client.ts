import type { QuizConfig, QuizQuestion, UserProfile } from "../components/types";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export type QuizRecord = {
  id: string;
  config: QuizConfig;
  createdAt: string;
};

export async function createQuiz(config: QuizConfig): Promise<QuizRecord> {
  return request<QuizRecord>("/quizz", {
    method: "POST",
    body: JSON.stringify(config),
  });
}

export async function listQuizzes(): Promise<QuizRecord[]> {
  return request<QuizRecord[]>("/quizz");
}

export async function fetchSampleQuestion(): Promise<QuizQuestion> {
  return request<QuizQuestion>("/quizz/sample-question");
}

export async function listUsers(): Promise<UserProfile[]> {
  return request<UserProfile[]>("/users");
}

export async function createUser(
  payload: Omit<UserProfile, "id">,
): Promise<UserProfile> {
  return request<UserProfile>("/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateUser(
  id: string,
  payload: Omit<UserProfile, "id">,
): Promise<UserProfile> {
  return request<UserProfile>(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteUser(id: string): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>(`/users/${id}`, { method: "DELETE" });
}

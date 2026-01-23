import { useEffect, useMemo, useState } from "react";
import QuizUser from "./quiz-user";
import type { QuizData, QuizQuestion } from "./types";
import { getMyQuizzes, getQuizById } from "../api/client";

type QuizListItem = { id: string; title: string };

function getQuizId(quiz: any): string | null {
  return quiz?.id ?? quiz?._id ?? quiz?.quizId ?? quiz?.uid ?? null;
}
function safeString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

export default function QuizUserPanel() {
  const [quizList, setQuizList] = useState<QuizListItem[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string>("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 1) charge la liste
  useEffect(() => {
    setError(null);
    setStatus("Chargement des quiz…");

    getMyQuizzes()
      .then((res) => {
        const list =
          (res.quizzes ?? [])
            .map((q: QuizData) => {
              const id = getQuizId(q);
              if (!id) return null;
              return { id, title: safeString((q as any).title) || "Sans titre" };
            })
            .filter(Boolean) as QuizListItem[];

        setQuizList(list);
        setStatus(null);

        // sélection par défaut
        setSelectedQuizId(list[0]?.id ?? "");
      })
      .catch((e) => {
        setStatus(null);
        setError(e instanceof Error ? e.message : "Impossible de charger les quiz.");
      });
  }, []);

  // 2) charge le quiz sélectionné
  useEffect(() => {
    if (!selectedQuizId) return;

    setError(null);
    setStatus("Chargement du quiz…");
    setQuestions([]);
    setQuestionIndex(0);

    getQuizById(selectedQuizId)
      .then((quiz) => {
        const qs = Array.isArray((quiz as any).questions) ? (quiz as any).questions : [];
        setQuestions(qs);
        setStatus(null);
      })
      .catch((e) => {
        setStatus(null);
        setError(e instanceof Error ? e.message : "Impossible de charger ce quiz.");
      });
  }, [selectedQuizId]);

  const currentQuestion = useMemo(
    () => questions[questionIndex] ?? null,
    [questions, questionIndex]
  );

  const onAnswer = () => {
    setQuestionIndex((i) => Math.min(i + 1, questions.length - 1));
  };

  return (
    <section style={{ display: "grid", gap: 16 }}>
      <div className="qp-toolbar">
        <label className="qp-field">
          <span className="qp-field__label">Quiz</span>
          <select
            className="qp-select"
            value={selectedQuizId}
            onChange={(e) => setSelectedQuizId(e.target.value)}
          >
            {quizList.length === 0 ? (
              <option value="">Aucun quiz</option>
            ) : (
              quizList.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.title}
                </option>
              ))
            )}
          </select>
        </label>

        {questions.length > 0 ? (
          <div className="qp-pill">
            {questionIndex + 1} / {questions.length}
          </div>
        ) : null}

        {status ? <div className="arena-status" style={{ marginLeft: 12 }}>{status}</div> : null}
        {error ? (
          <div className="arena-status arena-status--error" style={{ marginLeft: 12 }}>
            {error}
          </div>
        ) : null}
      </div>

      {currentQuestion ? (
        <QuizUser
          question={currentQuestion}
          questionIndex={questionIndex}
          totalQuestions={questions.length}
          onAnswer={onAnswer}
        />
      ) : (
        <div className="arena-status" style={{ padding: 12 }}>
          Sélectionne un quiz pour commencer.
        </div>
      )}
    </section>
  );
}

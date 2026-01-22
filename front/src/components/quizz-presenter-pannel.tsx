import { useEffect, useMemo, useState } from "react";
import QuizPresenter from "./quiz-presenter";
import type { QuizData, QuizQuestion } from "./types";
import { getMyQuizzes, getQuizById } from "../api/client";

type Props = {
  initialQuizId?: string;
};

type QuizListItem = {
  id: string;
  title: string;
  description?: string;
};

function getQuizId(quiz: any): string | null {
  return quiz?.id ?? quiz?._id ?? quiz?.quizId ?? quiz?.uid ?? null;
}

function safeString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function mapBackendQuestionToPresenterQuestion(q: any): QuizQuestion {
  const rawAnswers = Array.isArray(q?.answers) ? q.answers : Array.isArray(q?.options) ? q.options : [];
  const options: string[] = rawAnswers
    .map((a: any) => {
      if (typeof a === "string") return a;
      if (a && typeof a === "object") {
        if (typeof a.text === "string") return a.text;
        if (typeof a.label === "string") return a.label;
        if (typeof a.value === "string") return a.value;
      }
      return "";
    })
    .filter((s: { trim: () => { (): any; new(): any; length: number; }; }) => s.trim().length > 0);

  let correctAnswerIndex = 0;
  const ca = q?.correctAnswer ?? q?.correctIndex ?? q?.answerIndex ?? q?.correct;
  if (typeof ca === "number" && Number.isFinite(ca)) correctAnswerIndex = ca;
  if (typeof ca === "string") {
    const idx = options.findIndex((o) => o.toLowerCase() === ca.toLowerCase());
    if (idx >= 0) correctAnswerIndex = idx;
  }
  if (correctAnswerIndex < 0 || correctAnswerIndex >= options.length) correctAnswerIndex = 0;

  return {
    question: safeString(q?.question) || safeString(q?.label) || "Question",
    options,
    correctAnswer: correctAnswerIndex,
    explanation: safeString(q?.explanation) || safeString(q?.details) || undefined,
  };
}

export default function QuizPresenterPanel({ initialQuizId }: Props) {
  const [quizList, setQuizList] = useState<QuizListItem[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string>("");
  const [selectedQuizTitle, setSelectedQuizTitle] = useState<string>("");

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);

  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load list
  useEffect(() => {
    setError(null);
    setStatus("Chargement des quiz…");
    getMyQuizzes()
      .then((res) => {
        const list = (res.quizzes ?? [])
          .map((q: QuizData) => {
            const id = getQuizId(q);
            if (!id) return null;
            return {
              id,
              title: safeString((q as any).title) || "Sans titre",
              description: safeString((q as any).description) || undefined,
            } satisfies QuizListItem;
          })
          .filter(Boolean) as QuizListItem[];

        setQuizList(list);
        setStatus(null);

        const firstId =
          initialQuizId && list.some((x) => x.id === initialQuizId)
            ? initialQuizId
            : list[0]?.id ?? "";

        if (firstId) setSelectedQuizId(firstId);
      })
      .catch((e) => {
        setStatus(null);
        setError(e instanceof Error ? e.message : "Impossible de charger la liste des quiz.");
      });
  }, [initialQuizId]);

  // Load selected quiz
  useEffect(() => {
    if (!selectedQuizId) return;

    setError(null);
    setStatus("Chargement du quiz…");
    setQuestions([]);
    setQuestionIndex(0);
    setShowAnswer(false);

    getQuizById(selectedQuizId)
      .then((quiz) => {
        const title = safeString((quiz as any).title) || "Quiz";
        setSelectedQuizTitle(title);

        const rawQuestions = Array.isArray((quiz as any).questions) ? (quiz as any).questions : [];
        const mapped = rawQuestions.map(mapBackendQuestionToPresenterQuestion);

        setQuestions(mapped);
        setStatus(null);
      })
      .catch((e) => {
        setStatus(null);
        setError(e instanceof Error ? e.message : "Impossible de charger le quiz sélectionné.");
      });
  }, [selectedQuizId]);

  const total = questions.length;
  const currentQuestion = useMemo(() => questions[questionIndex] ?? null, [questions, questionIndex]);

  const canPrev = questionIndex > 0;
  const canNext = total > 0 && questionIndex < total - 1;

  const prev = () => {
    if (!canPrev) return;
    setShowAnswer(false);
    setQuestionIndex((i) => Math.max(0, i - 1));
  };

  const next = () => {
    if (!canNext) return;
    setShowAnswer(false);
    setQuestionIndex((i) => Math.min(total - 1, i + 1));
  };

  const toggleAnswer = () => {
    if (!currentQuestion) return;
    setShowAnswer((v) => !v);
  };

  return (
    <section style={{ display: "grid", gap: 16 }}>
      {/* Toolbar */}
      <div className="qp-toolbar">
        <div className="qp-toolbar__left">
          <label className="qp-field">
            <span className="qp-field__label">Quiz affiché</span>
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
        </div>

        <div className="qp-toolbar__center">
          <button className="qp-btn" type="button" onClick={prev} disabled={!canPrev}>
            ◀ Précédente
          </button>

          <button
            className={`qp-btn ${showAnswer ? "qp-btn--active" : ""}`}
            type="button"
            onClick={toggleAnswer}
            disabled={!currentQuestion}
          >
            {showAnswer ? "🙈 Masquer" : "👁️ Révéler"}
          </button>

          <button className="qp-btn qp-btn--primary" type="button" onClick={next} disabled={!canNext}>
            Suivante ▶
          </button>
        </div>

        <div className="qp-toolbar__right">
          {total > 0 ? (
            <div className="qp-pill">
              {questionIndex + 1} / {total}
            </div>
          ) : null}
        </div>

        {status && <div className="arena-status" style={{ gridColumn: "1 / -1" }}>{status}</div>}
        {error && (
          <div className="arena-status arena-status--error" style={{ gridColumn: "1 / -1" }}>
            {error}
          </div>
        )}
      </div>

      {/* Card */}
      {currentQuestion ? (
        <QuizPresenter
          quizTitle={selectedQuizTitle}
          question={currentQuestion}
          questionIndex={questionIndex}
          totalQuestions={total}
          showAnswer={showAnswer}
        />
      ) : (
        <div className="arena-status" style={{ padding: 12 }}>
          Sélectionne un quiz pour commencer.
        </div>
      )}
    </section>
  );
}

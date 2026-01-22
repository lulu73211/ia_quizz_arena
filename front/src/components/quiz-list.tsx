import { useEffect, useMemo, useState } from "react";
import type { QuizData } from "./types";
import { getQuizById } from "../api/client";

type Props = {
  initialQuizzes: QuizData[];
  onRefresh?: () => void;
};

function getQuizId(quiz: any): string | null {
  return quiz?.id ?? quiz?._id ?? quiz?.quizId ?? quiz?.uid ?? null;
}

function safeString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function getAnswerText(answer: any): string {
  if (typeof answer === "string") return answer;
  if (answer && typeof answer === "object") {
    if (typeof answer.text === "string") return answer.text;
    if (typeof answer.label === "string") return answer.label;
    if (typeof answer.value === "string") return answer.value;
  }
  return "";
}

function normalizeAnswers(answers: any): Array<{ id?: string; text: string }> {
  if (!Array.isArray(answers)) return [];
  return answers
    .map((a) => {
      if (typeof a === "string") return { text: a };
      if (a && typeof a === "object") {
        const id = typeof a.id === "string" ? a.id : typeof a.value === "string" ? a.value : undefined;
        const text = getAnswerText(a);
        return { id, text };
      }
      return { text: "" };
    })
    .filter((x) => x.text.trim().length > 0);
}

function resolveCorrectAnswerText(question: any): string {
  const answers = normalizeAnswers(question?.answers);

  const ca = question?.correctAnswer ?? question?.correctIndex ?? question?.answerIndex ?? question?.correct;

  if (typeof ca === "number" && Number.isFinite(ca)) {
    const idx = ca;
    if (idx >= 0 && idx < answers.length) return answers[idx].text;
    return `Index ${idx} (hors limites)`;
  }

  if (typeof ca === "string") {
    const trimmed = ca.trim();
    if (!trimmed) return "";

    const byId = answers.find((a) => a.id && a.id === trimmed);
    if (byId) return byId.text;

    const byText = answers.find((a) => a.text.toLowerCase() === trimmed.toLowerCase());
    if (byText) return byText.text;

    return trimmed;
  }

  if (ca && typeof ca === "object") {
    if (typeof ca.index === "number" && answers[ca.index]) return answers[ca.index].text;
    const t = getAnswerText(ca);
    if (t) return t;
  }

  return "";
}

export function QuizList({ initialQuizzes, onRefresh }: Props) {
  const [items, setItems] = useState<QuizData[]>(initialQuizzes ?? []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizData | null>(null);

  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setItems(initialQuizzes ?? []);
  }, [initialQuizzes]);

  const list = useMemo(() => {
    return (items ?? [])
      .map((q) => ({ q, id: getQuizId(q) }))
      .filter((x) => !!x.id) as Array<{ q: QuizData; id: string }>;
  }, [items]);

  const selectQuiz = async (id: string) => {
    setSelectedId(id);
    setSelectedQuiz(null);
    setError(null);
    setStatus("Chargement du détail...");

    try {
      const data = await getQuizById(id);
      setSelectedQuiz(data);
      setStatus(null);
    } catch (e) {
      setStatus(null);
      setError(e instanceof Error ? e.message : "Impossible de charger le quiz.");
    }
  };

  useEffect(() => {
    if (!selectedId && list.length > 0) {
      void selectQuiz(list[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list.length]);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div
            style={{
              padding: "6px 10px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.06)",
              fontSize: 13,
              opacity: 0.9,
            }}
          >
            {list.length} quiz
          </div>
          {selectedQuiz && Array.isArray((selectedQuiz as any).questions) ? (
            <div
              style={{
                padding: "6px 10px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.06)",
                fontSize: 13,
                opacity: 0.9,
              }}
            >
              {(selectedQuiz as any).questions.length} questions
            </div>
          ) : null}
        </div>

        {onRefresh && (
          <button className="arena-button" type="button" onClick={onRefresh}>
            Rafraîchir
          </button>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(260px, 360px) 1fr",
          gap: 16,
          alignItems: "start",
        }}
      >
        {/* LISTE */}
        <div
          className="arena-card"
          style={{
            padding: 12,
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(0,0,0,0.22)",
            backdropFilter: "blur(6px)",
          }}
        >
          <h2 style={{ margin: "0 0 10px 0", fontSize: 18 }}>Tous mes quiz</h2>

          {list.length === 0 ? (
            <div className="arena-status">Aucun quiz trouvé.</div>
          ) : (
            <div style={{ maxHeight: "68vh", overflow: "auto", paddingRight: 4 }}>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10}}>
                {list.map(({ q, id }) => {
                  const title = safeString((q as any).title) || "Sans titre";
                  const desc = safeString((q as any).description);
                  const isActive = id === selectedId;

                  return (
                    <li key={id}>
                      <button
                        type="button"
                        onClick={() => void selectQuiz(id)}
                        className="arena-button"
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "12px 12px",
                          borderRadius: 12,
                          border: isActive ? "1px solid rgba(100,255,180,0.45)" : "1px solid rgba(255,255,255,0.10)",
                          background: isActive ? "rgba(40,160,110,0.12)" : "rgba(255,255,255,0.06)",
                          boxShadow: isActive ? "0 0 0 3px rgba(100,255,180,0.10)" : "none",
                          transition: "transform 120ms ease, background 120ms ease, border 120ms ease",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                          <div style={{ fontWeight: 800, fontSize: 15 }}>{title}</div>
                          {isActive ? (
                            <span style={{ fontSize: 12, opacity: 0.85 }}>Sélectionné</span>
                          ) : null}
                        </div>

                        {desc ? (
                          <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4, lineHeight: 1.3 }}>
                            {desc}
                          </div>
                        ) : (
                          <div style={{ fontSize: 13, opacity: 0.55, marginTop: 4 }}>
                            (Pas de description)
                          </div>
                        )}

                        {/* ID supprimé volontairement */}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {/* DETAIL */}
        <div
          className="arena-card"
          style={{
            padding: 12,
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(0,0,0,0.22)",
            backdropFilter: "blur(6px)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
            <h2 style={{ margin: 0, fontSize: 18 }}>Détail</h2>
            {selectedQuiz ? (
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                {safeString((selectedQuiz as any).theme) ? `Thème: ${(selectedQuiz as any).theme}` : ""}
              </div>
            ) : null}
          </div>

          {status && <div className="arena-status" style={{ marginTop: 10 }}>{status}</div>}
          {error && (
            <div className="arena-status arena-status--error" style={{ marginTop: 10 }}>
              {error}
            </div>
          )}

          {!selectedId && <div className="arena-status" style={{ marginTop: 10 }}>Sélectionne un quiz.</div>}

          {selectedQuiz && (
            <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
              <div>
                <div style={{ fontSize: 12, opacity: 0.65, marginBottom: 2 }}>Titre</div>
                <div style={{ fontWeight: 900, fontSize: 20 }}>
                  {safeString((selectedQuiz as any).title) || "Sans titre"}
                </div>
              </div>

              {safeString((selectedQuiz as any).description) ? (
                <div>
                  <div style={{ fontSize: 12, opacity: 0.65, marginBottom: 2 }}>Description</div>
                  <div style={{ opacity: 0.92, lineHeight: 1.4 }}>
                    {safeString((selectedQuiz as any).description)}
                  </div>
                </div>
              ) : null}

              {Array.isArray((selectedQuiz as any).questions) ? (
                <div>
                  <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 10 }}>
                    Questions ({(selectedQuiz as any).questions.length})
                  </div>

                  <div style={{ display: "grid", gap: 10 }}>
                    {(selectedQuiz as any).questions.map((qq: any, idx: number) => {
                      const answers = normalizeAnswers(qq?.answers);
                      const correctText = resolveCorrectAnswerText(qq);

                      return (
                        <div
                          key={idx}
                          style={{
                            padding: 12,
                            borderRadius: 14,
                            border: "1px solid rgba(255,255,255,0.10)",
                            background: "rgba(255,255,255,0.04)",
                          }}
                        >
                          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                            <div
                              style={{
                                minWidth: 28,
                                height: 28,
                                borderRadius: 10,
                                display: "grid",
                                placeItems: "center",
                                fontWeight: 900,
                                border: "1px solid rgba(255,255,255,0.14)",
                                background: "rgba(0,0,0,0.20)",
                                opacity: 0.9,
                              }}
                            >
                              {idx + 1}
                            </div>

                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 850, fontSize: 15, lineHeight: 1.3 }}>
                                {safeString(qq?.question) || `Question ${idx + 1}`}
                              </div>

                              {answers.length > 0 ? (
                                <div
                                  style={{
                                    marginTop: 10,
                                    display: "grid",
                                    gap: 6,
                                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                                  }}
                                >
                                  {answers.map((a, i) => {
                                    const isCorrect =
                                      correctText &&
                                      a.text.toLowerCase() === correctText.toLowerCase();

                                    return (
                                      <div
                                        key={i}
                                        style={{
                                          padding: "10px 10px",
                                          borderRadius: 12,
                                          border: isCorrect
                                            ? "1px solid rgba(100,255,180,0.45)"
                                            : "1px solid rgba(255,255,255,0.10)",
                                          background: isCorrect
                                            ? "rgba(40,160,110,0.12)"
                                            : "rgba(0,0,0,0.15)",
                                          opacity: 0.96,
                                        }}
                                      >
                                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                          <div
                                            style={{
                                              width: 20,
                                              height: 20,
                                              borderRadius: 8,
                                              display: "grid",
                                              placeItems: "center",
                                              fontSize: 12,
                                              border: "1px solid rgba(255,255,255,0.12)",
                                              background: "rgba(255,255,255,0.06)",
                                              opacity: 0.85,
                                            }}
                                          >
                                            {String.fromCharCode(65 + i)}
                                          </div>
                                          <div style={{ lineHeight: 1.25 }}>{a.text}</div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : null}

                              {correctText ? (
                                <div
                                  style={{
                                    marginTop: 12,
                                    display: "inline-flex",
                                    gap: 8,
                                    alignItems: "center",
                                    padding: "8px 10px",
                                    borderRadius: 999,
                                    border: "1px solid rgba(100,255,180,0.45)",
                                    background: "rgba(40,160,110,0.12)",
                                    fontSize: 13,
                                    fontWeight: 700,
                                  }}
                                >
                                  ✅ Bonne réponse : <span style={{ fontWeight: 900 }}>{correctText}</span>
                                </div>
                              ) : (
                                <div style={{ marginTop: 12, fontSize: 13, opacity: 0.7 }}>
                                  (Bonne réponse non détectée)
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <pre style={{ margin: 0, padding: 12, borderRadius: 12, overflow: "auto" }}>
                  {JSON.stringify(selectedQuiz, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

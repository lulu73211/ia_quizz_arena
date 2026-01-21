import { useEffect, useState } from "react";
import { QuizUser } from "../../components";
import type { QuizOption, QuizQuestion } from "../../components/types";
import { fetchSampleQuestion } from "../../api/client";

export default function PlayerPage() {
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [locked, setLocked] = useState<QuizOption | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSampleQuestion()
      .then((data) => setQuestion(data))
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Unable to load question.",
        ),
      );
  }, []);

  if (!question) {
    return (
      <section className="arena-page">
        <header className="arena-page__heading">
          <h1 className="arena-page__title">Vue joueur</h1>
          <p className="arena-page__subtitle">Chargement...</p>
        </header>
        {error && <div className="arena-status arena-status--error">{error}</div>}
      </section>
    );
  }

  return (
    <section className="arena-page">
      <header className="arena-page__heading">
        <h1 className="arena-page__title">Vue joueur</h1>
        <p className="arena-page__subtitle">
          Selectionnez votre reponse avant la fin du chrono.
        </p>
      </header>

      <div className="arena-panel">
        {locked && (
          <div className="arena-status">{`Reponse verrouillee: ${locked.label}`}</div>
        )}
        <QuizUser
          question={question}
          questionIndex={0}
          totalQuestions={10}
          onAnswer={(option) => setLocked(option)}
        />
      </div>
    </section>
  );
}

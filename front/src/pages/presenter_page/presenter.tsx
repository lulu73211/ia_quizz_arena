import { useEffect, useState } from "react";
import { QuizPresenter } from "../../components";
import type { QuizQuestion } from "../../components/types";
import { fetchSampleQuestion } from "../../api/client";

export default function PresenterPage() {
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
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
          <h1 className="arena-page__title">Vue presentateur</h1>
          <p className="arena-page__subtitle">Chargement...</p>
        </header>
        {error && <div className="arena-status arena-status--error">{error}</div>}
      </section>
    );
  }

  return (
    <section className="arena-page">
      <header className="arena-page__heading">
        <h1 className="arena-page__title">Vue presentateur</h1>
        <p className="arena-page__subtitle">
          Affichez la question et revelez la bonne reponse.
        </p>
      </header>

      <div className="arena-panel">
        <QuizPresenter
          quizTitle="IA Quiz Arena"
          question={question}
          questionIndex={0}
          totalQuestions={10}
          showAnswer={showAnswer}
          onNext={() => setShowAnswer((prev) => !prev)}
        />
      </div>
    </section>
  );
}

import { useEffect, useState } from "react";
import { QuizList } from "../../components"
import type { QuizData } from "../../components/types";
import { getMyQuizzes } from "../../api/client";

export default function UsersPage() {
  const [quizzes, setQuizzes] = useState<QuizData[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => {
    setError(null);
    setStatus("Chargement des quiz...");
    getMyQuizzes()
      .then((data) => {
        setQuizzes(data.quizzes ?? []);
        setStatus(`Quiz chargés (${data.count ?? (data.quizzes?.length ?? 0)}).`);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Impossible de charger les quiz."),
      );
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <section className="arena-page">
      <header className="arena-page__heading">
        <h1 className="arena-page__title">Mes quiz</h1>
        <p className="arena-page__subtitle">Clique sur un quiz pour afficher son détail.</p>
      </header>

      <div className="arena-panel">
        {status && <div className="arena-status">{status}</div>}
        {error && <div className="arena-status arena-status--error">{error}</div>}

        <QuizList initialQuizzes={quizzes} onRefresh={refresh} />
      </div>
    </section>
  );
}

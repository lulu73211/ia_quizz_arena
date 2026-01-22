import { useState } from "react";
import { QuizConfigForm } from "../../components";
import type { QuizConfig } from "../../components/types";
import { generateQuiz } from "../../api/client";

export default function CreateQuizPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (config: QuizConfig) => {
    setError(null);
    setStatus(null);
    try {
      const record = await generateQuiz(config);
      setStatus(`Quiz created: ${record.id}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create quiz right now.",
      );
    }
  };

  return (
    <section className="arena-page">
      <header className="arena-page__heading">
        <h1 className="arena-page__title">Creation de quiz</h1>
        <p className="arena-page__subtitle">
          Configurez un quiz IA et envoyez-le au backend.
        </p>
      </header>

      <div className="arena-panel">
        {status && <div className="arena-status">{status}</div>}
        {error && <div className="arena-status arena-status--error">{error}</div>}
        <QuizConfigForm onCreate={handleCreate} />
      </div>
    </section>
  );
}

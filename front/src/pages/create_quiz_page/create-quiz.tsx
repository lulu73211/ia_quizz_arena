import { useState } from "react";
import { QuizConfigForm } from "../../components";
import type { QuizConfig } from "../../components/types";
import { generateQuiz } from "../../api/client";

export default function CreateQuizPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const handleCreate = async (config: QuizConfig) => {
    setError(null);
    setStatus(null);
    setIsLoading(true);
    try {
      const record = await generateQuiz(config);
      setStatus(`Quiz créé avec succès ! ID: ${record.id}`);
      setFormKey(prev => prev + 1); // Reset form
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de créer le quiz pour le moment.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="arena-page">
      <header className="arena-page__heading">
        <h1 className="arena-page__title">Création de quiz</h1>
        <p className="arena-page__subtitle">
          Configurez un quiz IA et envoyez-le au backend.
        </p>
      </header>

      <div className="arena-panel">
        {status && <div className="arena-status">{status}</div>}
        {error && <div className="arena-status arena-status--error">{error}</div>}
        <QuizConfigForm key={formKey} onCreate={handleCreate} isLoading={isLoading} />
      </div>
    </section>
  );
}

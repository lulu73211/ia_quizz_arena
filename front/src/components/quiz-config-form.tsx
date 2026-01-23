import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import "./quiz-components.css";
import type { QuizConfig } from "./types";

type QuizConfigFormProps = {
  initial?: Partial<QuizConfig>;
  onCreate?: (config: QuizConfig) => void;
  isLoading?: boolean;
};

const DEFAULT_CONFIG: QuizConfig = {
  title: "",
  description: "",
  questionCount: 10,
  timeLimitSeconds: 25,
  difficulty: "medium",
  theme: "general",
};

export default function QuizConfigForm({
  initial,
  onCreate,
  isLoading = false,
}: QuizConfigFormProps) {
  const merged = useMemo(
    () => ({ ...DEFAULT_CONFIG, ...initial }),
    [initial],
  );
  const [title, setTitle] = useState(merged.title);
  const [description, setDescription] = useState(merged.description);
  const [questionCount, setQuestionCount] = useState(merged.questionCount);
  const [timeLimitSeconds, setTimeLimitSeconds] = useState(
    merged.timeLimitSeconds,
  );
  const [difficulty, setDifficulty] = useState(merged.difficulty);
  const [theme, setTheme] = useState(merged.theme);

  const canSubmit = title.trim().length > 0 && questionCount > 0 && !isLoading;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }
    onCreate?.({
      title: title.trim(),
      description: description.trim(),
      questionCount,
      timeLimitSeconds,
      difficulty,
      theme: theme.trim() || "general",
    });
  };

  return (
    <section className="quiz-card">
      <header className="quiz-card__header">
        <p className="quiz-card__eyebrow">Création de quiz</p>
        <h2 className="quiz-card__title">Configurer un nouveau quiz</h2>
        <p className="quiz-card__subtitle">
          Choisissez un thème et une difficulté, puis sélectionnez le nombre de questions à générer.
        </p>
      </header>

      <form className="quiz-form" onSubmit={handleSubmit}>
        <label className="quiz-field">
          <span className="quiz-field__label">Titre</span>
          <input
            className="quiz-field__input"
            type="text"
            placeholder="Quiz IA Trivia Battle"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            disabled={isLoading}
          />
        </label>

        <label className="quiz-field">
          <span className="quiz-field__label">Description</span>
          <textarea
            className="quiz-field__input quiz-field__input--area"
            placeholder="Résumé court pour les joueurs"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            disabled={isLoading}
          />
        </label>

        <div className="quiz-grid">
          <label className="quiz-field">
            <span className="quiz-field__label">Thème</span>
            <input
              className="quiz-field__input"
              type="text"
              placeholder="science, histoire, musique"
              value={theme}
              onChange={(event) => setTheme(event.target.value)}
              disabled={isLoading}
            />
          </label>

          <label className="quiz-field">
            <span className="quiz-field__label">Difficulté</span>
            <select
              className="quiz-field__input"
              value={difficulty}
              onChange={(event) =>
                setDifficulty(event.target.value as QuizConfig["difficulty"])
              }
              disabled={isLoading}
            >
              <option value="easy">Facile</option>
              <option value="medium">Moyen</option>
              <option value="hard">Difficile</option>
            </select>
          </label>
        </div>

        <div className="quiz-grid">
          <label className="quiz-field">
            <span className="quiz-field__label">Nombre de questions</span>
            <input
              className="quiz-field__input"
              type="number"
              min={1}
              max={50}
              value={questionCount}
              onChange={(event) =>
                setQuestionCount(Number(event.target.value))
              }
              disabled={isLoading}
            />
          </label>

          <label className="quiz-field">
            <span className="quiz-field__label">Temps par question (sec)</span>
            <input
              className="quiz-field__input"
              type="number"
              min={10}
              max={90}
              value={timeLimitSeconds}
              onChange={(event) =>
                setTimeLimitSeconds(Number(event.target.value))
              }
              disabled={isLoading}
            />
          </label>
        </div>

        <button 
          className={`quiz-button ${isLoading ? 'quiz-button--loading' : ''}`} 
          type="submit" 
          disabled={!canSubmit}
        >
          {isLoading ? (
            <>
              <span className="quiz-button__spinner"></span>
              Génération en cours...
            </>
          ) : (
            'Créer le quiz'
          )}
        </button>
      </form>
    </section>
  );
}

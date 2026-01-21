import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import "./quiz-components.css";
import type { QuizConfig } from "./types";

type QuizConfigFormProps = {
  initial?: Partial<QuizConfig>;
  onCreate?: (config: QuizConfig) => void;
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

  const canSubmit = title.trim().length > 0 && questionCount > 0;

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
        <p className="quiz-card__eyebrow">Quiz creation</p>
        <h2 className="quiz-card__title">Configure a new quiz</h2>
        <p className="quiz-card__subtitle">
          Pick a theme and difficulty, then choose how many questions to
          generate.
        </p>
      </header>

      <form className="quiz-form" onSubmit={handleSubmit}>
        <label className="quiz-field">
          <span className="quiz-field__label">Title</span>
          <input
            className="quiz-field__input"
            type="text"
            placeholder="AI Trivia Battle"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </label>

        <label className="quiz-field">
          <span className="quiz-field__label">Description</span>
          <textarea
            className="quiz-field__input quiz-field__input--area"
            placeholder="Short summary for players"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
          />
        </label>

        <div className="quiz-grid">
          <label className="quiz-field">
            <span className="quiz-field__label">Theme</span>
            <input
              className="quiz-field__input"
              type="text"
              placeholder="science, history, music"
              value={theme}
              onChange={(event) => setTheme(event.target.value)}
            />
          </label>

          <label className="quiz-field">
            <span className="quiz-field__label">Difficulty</span>
            <select
              className="quiz-field__input"
              value={difficulty}
              onChange={(event) =>
                setDifficulty(event.target.value as QuizConfig["difficulty"])
              }
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </label>
        </div>

        <div className="quiz-grid">
          <label className="quiz-field">
            <span className="quiz-field__label">Questions</span>
            <input
              className="quiz-field__input"
              type="number"
              min={1}
              max={50}
              value={questionCount}
              onChange={(event) =>
                setQuestionCount(Number(event.target.value))
              }
            />
          </label>

          <label className="quiz-field">
            <span className="quiz-field__label">Time per question (sec)</span>
            <input
              className="quiz-field__input"
              type="number"
              min={10}
              max={90}
              value={timeLimitSeconds}
              onChange={(event) =>
                setTimeLimitSeconds(Number(event.target.value))
              }
            />
          </label>
        </div>

        <button className="quiz-button" type="submit" disabled={!canSubmit}>
          Create quiz
        </button>
      </form>
    </section>
  );
}

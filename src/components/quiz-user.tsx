import { useState } from "react";
import "./quiz-components.css";
import type { QuizOption, QuizQuestion } from "./types";

type QuizUserProps = {
  question: QuizQuestion;
  questionIndex: number;
  totalQuestions: number;
  onAnswer?: (option: QuizOption) => void;
};

export default function QuizUser({
  question,
  questionIndex,
  totalQuestions,
  onAnswer,
}: QuizUserProps) {
  const [selected, setSelected] = useState<QuizOption | null>(null);

  const handleSubmit = () => {
    if (!selected) {
      return;
    }
    onAnswer?.(selected);
  };

  return (
    <section className="quiz-card">
      <header className="quiz-card__header">
        <p className="quiz-card__eyebrow">Player view</p>
        <h2 className="quiz-card__title">
          Question {questionIndex + 1} / {totalQuestions}
        </h2>
        <p className="quiz-card__subtitle">{question.prompt}</p>
      </header>

      <div className="quiz-options">
        {question.options.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`quiz-option quiz-option--button ${
              selected?.id === option.id ? "quiz-option--selected" : ""
            }`}
            onClick={() => setSelected(option)}
          >
            <span className="quiz-option__label">{option.label}</span>
          </button>
        ))}
      </div>

      <button
        className="quiz-button"
        type="button"
        onClick={handleSubmit}
        disabled={!selected}
      >
        Lock answer
      </button>
    </section>
  );
}

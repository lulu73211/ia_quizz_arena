import { useState } from "react";
import "./quiz-components.css";
import type { QuizQuestion } from "./types";

type QuizUserProps = {
  question: QuizQuestion;
  questionIndex: number;
  totalQuestions: number;
  onAnswer?: (optionIndex: number) => void;
};

export default function QuizUser({
  question,
  questionIndex,
  totalQuestions,
  onAnswer,
}: QuizUserProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleSubmit = () => {
    if (selectedIndex === null) {
      return;
    }
    onAnswer?.(selectedIndex);
  };

  return (
    <section className="quiz-card">
      <header className="quiz-card__header">
        <p className="quiz-card__eyebrow">Player view</p>
        <h2 className="quiz-card__title">
          Question {questionIndex + 1} / {totalQuestions}
        </h2>
        <p className="quiz-card__subtitle">{question.question}</p>
      </header>

      <div className="quiz-options">
        {question.options.map((option, index) => (
          <button
            key={index}
            type="button"
            className={`quiz-option quiz-option--button ${
              selectedIndex === index ? "quiz-option--selected" : ""
            }`}
            onClick={() => setSelectedIndex(index)}
          >
            <span className="quiz-option__label">{option}</span>
          </button>
        ))}
      </div>

      <button
        className="quiz-button"
        type="button"
        onClick={handleSubmit}
        disabled={selectedIndex === null}
      >
        Lock answer
      </button>
    </section>
  );
}

import "./quiz-components.css";
import type { QuizQuestion } from "./types";

type QuizPresenterProps = {
  quizTitle: string;
  question: QuizQuestion;
  questionIndex: number;
  totalQuestions: number;
  showAnswer?: boolean;
  onNext?: () => void;
};

export default function QuizPresenter({
  quizTitle,
  question,
  questionIndex,
  totalQuestions,
  showAnswer = false,
  onNext,
}: QuizPresenterProps) {
  return (
    <section className="quiz-card">
      <header className="quiz-card__header">
        <p className="quiz-card__eyebrow">{quizTitle}</p>
        <h2 className="quiz-card__title">
          Question {questionIndex + 1} / {totalQuestions}
        </h2>
        <p className="quiz-card__subtitle">{question.prompt}</p>
      </header>

      <div className="quiz-options">
        {question.options.map((option) => (
          <div
            key={option.id}
            className={`quiz-option ${
              showAnswer && option.isCorrect ? "quiz-option--correct" : ""
            }`}
          >
            <span className="quiz-option__label">{option.label}</span>
            {showAnswer && option.isCorrect && (
              <span className="quiz-option__badge">Correct</span>
            )}
          </div>
        ))}
      </div>

      {question.explanation && showAnswer && (
        <p className="quiz-callout">{question.explanation}</p>
      )}

      <button className="quiz-button" type="button" onClick={onNext}>
        Next question
      </button>
    </section>
  );
}

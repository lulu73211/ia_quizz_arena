import "./quiz-components.css";
import type { QuizQuestion } from "./types";

type QuizPresenterProps = {
  quizTitle: string;
  question: QuizQuestion;
  questionIndex: number;
  totalQuestions: number;
  showAnswer?: boolean;
};

export default function QuizPresenter({
  quizTitle,
  question,
  questionIndex,
  totalQuestions,
  showAnswer = false,
}: QuizPresenterProps) {
  return (
    <section className="quiz-card">
      <header className="quiz-card__header">
        <p className="quiz-card__eyebrow">{quizTitle}</p>
        <h2 className="quiz-card__title">
          Question {questionIndex + 1} / {totalQuestions}
        </h2>
        <p className="quiz-card__subtitle">{question.question}</p>
      </header>

      <div className="quiz-options">
        {question.options.map((option, index) => {
          const isCorrect = index === question.correctAnswer;
          const isRevealCorrect = showAnswer && isCorrect;

          return (
            <div
              key={index}
              className={`quiz-option ${isRevealCorrect ? "quiz-option--correct" : ""}`}
            >
              <span className="quiz-option__label">{option}</span>
              {isRevealCorrect && <span className="quiz-option__badge">Bonne réponse</span>}
            </div>
          );
        })}
      </div>

      {question.explanation && showAnswer && (
        <p className="quiz-callout">{question.explanation}</p>
      )}
    </section>
  );
}

import { useEffect, useState } from "react";
import { QuizPresenter } from "../../components";
import type { QuizData } from "../../components/types";
import { getMyQuizzes } from "../../api/client";

export default function PresenterPage() {
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyQuizzes()
      .then((data) => {
        if (data.quizzes.length > 0) {
          setQuiz(data.quizzes[0]);
        } else {
          setError("No quizzes found. Create one first!");
        }
      })
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Unable to load quizzes.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  const handleNext = () => {
    if (!quiz) return;

    if (!showAnswer) {
      setShowAnswer(true);
    } else {
      if (currentQuestionIndex < quiz.questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setShowAnswer(false);
      } else {
        // End of quiz
        alert("Quiz finished!");
      }
    }
  };

  if (loading) {
    return (
      <section className="arena-page">
        <header className="arena-page__heading">
          <h1 className="arena-page__title">Vue présentateur</h1>
          <p className="arena-page__subtitle">Chargement des quiz...</p>
        </header>
      </section>
    );
  }

  if (error || !quiz) {
    return (
      <section className="arena-page">
        <header className="arena-page__heading">
          <h1 className="arena-page__title">Vue présentateur</h1>
          <p className="arena-page__subtitle">Erreur</p>
        </header>
        <div className="arena-status arena-status--error">{error || "Aucun quiz disponible."}</div>
      </section>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <section className="arena-page">
      <header className="arena-page__heading">
        <h1 className="arena-page__title">Vue présentateur</h1>
        <p className="arena-page__subtitle">
          Code: <strong>{quiz.id.substring(0, 6).toUpperCase()}</strong>
        </p>
      </header>

      <div className="arena-panel">
        <QuizPresenter
          quizTitle={quiz.title}
          question={currentQuestion}
          questionIndex={currentQuestionIndex}
          totalQuestions={quiz.questions.length}
          showAnswer={showAnswer}
          onNext={handleNext}
        />
      </div>
    </section>
  );
}

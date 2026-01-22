import { useEffect, useState } from "react";
import { QuizUser } from "../../components";
import type { QuizData } from "../../components/types";
import { getMyQuizzes, updateScore } from "../../api/client";

export default function PlayerPage() {
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [lockedAnswer, setLockedAnswer] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    getMyQuizzes()
      .then((data) => {
        if (data.quizzes.length > 0) {
          setQuiz(data.quizzes[0]);
        } else {
          setError("No quizzes found.");
        }
      })
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Unable to load quizzes.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  const handleAnswer = (optionIndex: number) => {
    setLockedAnswer(optionIndex);
    
    // Check answer immediately for this prototype
    if (quiz) {
      const currentQuestion = quiz.questions[currentQuestionIndex];
      const isCorrect = optionIndex === currentQuestion.correctAnswer;
      
      if (isCorrect) {
        setScore(s => s + 10);
        updateScore(10).catch(console.error);
      }

      // Auto advance after short delay
      setTimeout(() => {
        if (currentQuestionIndex < quiz.questions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
          setLockedAnswer(null);
        } else {
          setFinished(true);
        }
      }, 1500);
    }
  };

  if (loading) {
    return (
      <section className="arena-page">
        <header className="arena-page__heading">
          <h1 className="arena-page__title">Vue joueur</h1>
          <p className="arena-page__subtitle">Chargement...</p>
        </header>
      </section>
    );
  }

  if (finished) {
    return (
      <section className="arena-page">
        <header className="arena-page__heading">
          <h1 className="arena-page__title">Partie terminée !</h1>
          <p className="arena-page__subtitle">Score final: {score}</p>
        </header>
      </section>
    );
  }

  if (error || !quiz) {
    return (
      <section className="arena-page">
        <header className="arena-page__heading">
          <h1 className="arena-page__title">Vue joueur</h1>
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
        <h1 className="arena-page__title">Vue joueur</h1>
        <p className="arena-page__subtitle">
          Score: {score}
        </p>
      </header>

      <div className="arena-panel">
        {lockedAnswer !== null && (
          <div className="arena-status">Réponse enregistrée...</div>
        )}
        <QuizUser
          question={currentQuestion}
          questionIndex={currentQuestionIndex}
          totalQuestions={quiz.questions.length}
          onAnswer={handleAnswer}
        />
      </div>
    </section>
  );
}

import QuizPresenterPanel from "../../components/quizz-presenter-pannel";

export default function PresenterPage() {
  return (
    <section className="arena-page">
      <header className="arena-page__heading">
        <h1 className="arena-page__title">Présentateur</h1>
        <p className="arena-page__subtitle">Choisis le quiz à afficher, puis déroule les questions.</p>
      </header>

      <div className="arena-panel">
        <QuizPresenterPanel />
      </div>
    </section>
  );
}

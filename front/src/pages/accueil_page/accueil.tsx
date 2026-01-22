import "./accueil.css";
import { Sparkles, Zap, Brain } from "lucide-react";

export default function Accueil() {
  return (
    <main className="accueil">
      <div className="accueil__bg" aria-hidden="true">
        <span className="accueil__blob accueil__blob--top" />
        <span className="accueil__blob accueil__blob--bottom" />
      </div>

      <section className="accueil__container">
        <header className="accueil__hero">
          <div className="accueil__logo">
            <Sparkles className="accueil__logoIcon" />
            <span className="accueil__logoPlus">+</span>
          </div>

          <h1 className="accueil__title">IA QUIZZ ARENA</h1>

          <p className="accueil__subtitle">
            Créez des quiz personnalisés avec l&apos;IA et
            <br />
            testez vos connaissances en mode Kahoot
          </p>
        </header>

        <div className="accueil__features">
          <div className="feature">
            <div className="feature__icon feature__icon--primary">
              <Brain size={18} />
            </div>
            <div className="feature__text">
              <p className="feature__title">IA Intelligente</p>
              <p className="feature__desc">Questions générées par IA</p>
            </div>
          </div>

          <div className="feature">
            <div className="feature__icon feature__icon--accent">
              <Zap size={18} />
            </div>
            <div className="feature__text">
              <p className="feature__title">Style Kahoot</p>
              <p className="feature__desc">Interface interactive</p>
            </div>
          </div>

          <div className="feature">
            <div className="feature__icon feature__icon--success">
              <Sparkles size={18} />
            </div>
            <div className="feature__text">
              <p className="feature__title">Tous thèmes</p>
              <p className="feature__desc">N&apos;importe quel sujet</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

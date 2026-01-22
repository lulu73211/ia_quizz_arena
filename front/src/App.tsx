import { useEffect, useMemo, useState } from "react";
import Accueil from "./pages/accueil_page/accueil";
import CreateQuizPage from "./pages/create_quiz_page/create-quiz";
import PresenterPage from "./pages/presenter_page/presenter";
import PlayerPage from "./pages/player_page/player";
import UsersPage from "./pages/quizzes_page/quizzes";
import AuthPage from "./pages/auth_page/auth";
import { useAuth } from "./contexts/AuthContext";
import "./app.css";

type RouteKey = "accueil" | "create" | "presenter" | "player" | "users" | "auth";

const ROUTES: { key: RouteKey; label: string; authRequired?: boolean }[] = [
  { key: "accueil", label: "Accueil" },
  { key: "create", label: "Creation", authRequired: true },
  { key: "presenter", label: "Presentateur" },
  { key: "player", label: "Joueur" },
  { key: "users", label: "Liste des Quizzs", authRequired: true },
];

const getRouteFromHash = (): RouteKey => {
  const hash = window.location.hash.replace("#/", "");
  if (hash === "create" || hash === "presenter" || hash === "player") {
    return hash;
  }
  if (hash === "users") {
    return "users";
  }
  if (hash === "auth") {
    return "auth";
  }
  return "accueil";
};

export default function App() {
  const [route, setRoute] = useState<RouteKey>(() => getRouteFromHash());
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    const handleHash = () => setRoute(getRouteFromHash());
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  // Redirect to auth if trying to access protected route while not logged in
  useEffect(() => {
    if (!loading && !user) {
      const currentRoute = ROUTES.find((r) => r.key === route);
      if (currentRoute?.authRequired) {
        window.location.hash = "#/auth";
      }
    }
  }, [route, user, loading]);

  const content = useMemo(() => {
    if (loading) {
      return (
        <div className="arena-page">
          <div className="arena-panel">
            <p>Chargement...</p>
          </div>
        </div>
      );
    }

    if (route === "auth") {
      if (user) {
        // Already logged in, redirect to home
        window.location.hash = "#/";
        return null;
      }
      return <AuthPage />;
    }
    if (route === "create") {
      return <CreateQuizPage />;
    }
    if (route === "presenter") {
      return <PresenterPage />;
    }
    if (route === "player") {
      return <PlayerPage />;
    }
    if (route === "users") {
      return <UsersPage />;
    }
    return <Accueil />;
  }, [route, user, loading]);

  const handleLogout = async () => {
    await logout();
    window.location.hash = "#/";
  };

  return (
    <div className="arena-app">
      <header className="arena-nav">
        <div className="arena-nav__brand">
          <span className="arena-nav__logo">IA</span>
          <span className="arena-nav__title">Quiz Arena</span>
        </div>
        <nav className="arena-nav__links">
          {ROUTES.map((item) => (
            <a
              key={item.key}
              href={`#/${item.key === "accueil" ? "" : item.key}`}
              className={`arena-nav__link ${
                route === item.key ? "arena-nav__link--active" : ""
              }`}
            >
              {item.label}
            </a>
          ))}
          {!loading && (
            <>
              {user ? (
                <button
                  onClick={handleLogout}
                  className="arena-nav__link arena-nav__link--auth"
                >
                  Déconnexion
                </button>
              ) : (
                <a
                  href="#/auth"
                  className={`arena-nav__link arena-nav__link--auth ${
                    route === "auth" ? "arena-nav__link--active" : ""
                  }`}
                >
                  Connexion
                </a>
              )}
            </>
          )}
        </nav>
      </header>

      <main className="arena-content">{content}</main>
    </div>
  );
}

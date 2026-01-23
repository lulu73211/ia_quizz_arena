import { useEffect, useMemo, useState } from "react";
import Accueil from "./pages/accueil_page/accueil";
import CreateQuizPage from "./pages/create_quiz_page/create-quiz";
import PresenterPage from "./pages/presenter_page/presenter";
import PlayerPage from "./pages/player_page/player";
import UsersPage from "./pages/quizzes_page/quizzes";
import AuthPage from "./pages/auth_page/auth";
import QuizRoomPage from "./pages/quiz_room_page/quiz-room";
import { useAuth } from "./contexts/AuthContext";
import "./app.css";

type RouteKey = "accueil" | "create" | "presenter" | "player" | "users" | "auth" | "room";

const ROUTES: { key: RouteKey; label: string; authRequired?: boolean }[] = [
  { key: "accueil", label: "Accueil" },
  { key: "room", label: "Quiz Live" },
  { key: "create", label: "Creation", authRequired: true },
  { key: "presenter", label: "Presentateur" },
  { key: "player", label: "Joueur" },
  { key: "users", label: "Liste des Quizzs", authRequired: true },
];

const getRouteFromHash = (): { route: RouteKey; roomCode?: string } => {
  const hash = window.location.hash.replace("#/", "");
  
  // Check for room/CODE pattern
  if (hash.startsWith("room/")) {
    const code = hash.replace("room/", "").toUpperCase();
    if (code.length > 0) {
      return { route: "room", roomCode: code };
    }
  }
  
  if (hash === "create" || hash === "presenter" || hash === "player" || hash === "room") {
    return { route: hash };
  }
  if (hash === "users") {
    return { route: "users" };
  }
  if (hash === "auth") {
    return { route: "auth" };
  }
  return { route: "accueil" };
};

export default function App() {
  const [route, setRoute] = useState<RouteKey>(() => getRouteFromHash().route);
  const [roomCode, setRoomCode] = useState<string | undefined>(() => getRouteFromHash().roomCode);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    const handleHash = () => {
      const { route: newRoute, roomCode: newRoomCode } = getRouteFromHash();
      setRoute(newRoute);
      setRoomCode(newRoomCode);
      setMenuOpen(false); // Close menu on navigation
    };
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
    if (route === "room") {
      return <QuizRoomPage initialRoomCode={roomCode} />;
    }
    return <Accueil />;
  }, [route, roomCode, user, loading]);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    window.location.hash = "#/";
  };

  const handleLinkClick = () => {
    setMenuOpen(false);
  };

  return (
    <div className="arena-app">
      <header className="arena-nav">
        <div className="arena-nav__brand">
          <span className="arena-nav__logo">IA</span>
          <span className="arena-nav__title">Quiz Arena</span>
          <button 
            className={`arena-nav__hamburger ${menuOpen ? 'arena-nav__hamburger--open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
        <nav className={`arena-nav__links ${menuOpen ? 'arena-nav__links--open' : ''}`}>
          {ROUTES.map((item) => (
            <a
              key={item.key}
              href={`#/${item.key === "accueil" ? "" : item.key}`}
              className={`arena-nav__link ${
                route === item.key ? "arena-nav__link--active" : ""
              }`}
              onClick={handleLinkClick}
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
                  onClick={handleLinkClick}
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

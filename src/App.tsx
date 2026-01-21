import { useEffect, useMemo, useState } from "react";
import Accueil from "./pages/accueil_page/accueil";
import CreateQuizPage from "./pages/create_quiz_page/create-quiz";
import PresenterPage from "./pages/presenter_page/presenter";
import PlayerPage from "./pages/player_page/player";
import UsersPage from "./pages/users_page/users";
import "./app.css";

type RouteKey = "accueil" | "create" | "presenter" | "player" | "users";

const ROUTES: { key: RouteKey; label: string }[] = [
  { key: "accueil", label: "Accueil" },
  { key: "create", label: "Creation" },
  { key: "presenter", label: "Presentateur" },
  { key: "player", label: "Joueur" },
  { key: "users", label: "CRUD users" },
];

const getRouteFromHash = (): RouteKey => {
  const hash = window.location.hash.replace("#/", "");
  if (hash === "create" || hash === "presenter" || hash === "player") {
    return hash;
  }
  if (hash === "users") {
    return "users";
  }
  return "accueil";
};

export default function App() {
  const [route, setRoute] = useState<RouteKey>(() => getRouteFromHash());

  useEffect(() => {
    const handleHash = () => setRoute(getRouteFromHash());
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const content = useMemo(() => {
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
  }, [route]);

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
        </nav>
      </header>

      <main className="arena-content">{content}</main>
    </div>
  );
}

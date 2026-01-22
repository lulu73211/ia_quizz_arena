import type { LeaderboardEntry } from "./types";
import "./quiz-components.css";

type UserCrudProps = {
  initialUsers?: LeaderboardEntry[];
};

export default function UserCrud({
  initialUsers,
}: UserCrudProps) {
  const users = initialUsers || [];

  return (
    <section className="quiz-card">
      <header className="quiz-card__header">
        <p className="quiz-card__eyebrow">Classement</p>
        <h2 className="quiz-card__title">Top Joueurs</h2>
        <p className="quiz-card__subtitle">
          Les meilleurs scores de l'arène.
        </p>
      </header>

      <div className="quiz-table">
        <div className="quiz-table__head">
          <span>Rang</span>
          <span>Nom</span>
          <span>Score</span>
          <span>Parties jouées</span>
        </div>
        {users.map((user) => (
          <div className="quiz-table__row" key={user.uid}>
            <span className="quiz-badge">#{user.rank}</span>
            <span>{user.displayName || "Anonyme"}</span>
            <span>{user.score}</span>
            <span>{user.gamesPlayed}</span>
          </div>
        ))}
        {users.length === 0 && (
          <div className="quiz-table__row">
            <span style={{ gridColumn: "1 / -1", textAlign: "center" }}>
              Aucun joueur trouvé.
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

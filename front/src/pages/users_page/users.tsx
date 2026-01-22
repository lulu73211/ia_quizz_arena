import { useEffect, useState } from "react";
import { UserCrud } from "../../components";
import type { LeaderboardEntry } from "../../components/types";
import { getLeaderboard } from "../../api/client";

export default function UsersPage() {
  const [users, setUsers] = useState<LeaderboardEntry[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => {
    getLeaderboard()
      .then((data) => {
        setUsers(data);
        setStatus("Leaderboard loaded.");
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Unable to load leaderboard."),
      );
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <section className="arena-page">
      <header className="arena-page__heading">
        <h1 className="arena-page__title">Classement</h1>
        <p className="arena-page__subtitle">
          Les meilleurs joueurs de l'arène.
        </p>
      </header>

      <div className="arena-panel">
        {status && <div className="arena-status">{status}</div>}
        {error && <div className="arena-status arena-status--error">{error}</div>}
        <UserCrud
          initialUsers={users}
        />
      </div>
    </section>
  );
}

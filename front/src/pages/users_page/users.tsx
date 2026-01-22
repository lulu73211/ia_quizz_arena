import { useEffect, useState } from "react";
import { UserCrud } from "../../components";
import type { UserProfile } from "../../components/types";
import { createUser, deleteUser, listUsers, updateUser } from "../../api/client";

export default function UsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => {
    listUsers()
      .then((data) => setUsers(data))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Unable to load users."),
      );
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleCreate = async (payload: Omit<UserProfile, "id">) => {
    setError(null);
    setStatus(null);
    try {
      await createUser(payload);
      setStatus("User created.");
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create user.");
    }
  };

  const handleUpdate = async (id: string, payload: Omit<UserProfile, "id">) => {
    setError(null);
    setStatus(null);
    try {
      await updateUser(id, payload);
      setStatus("User updated.");
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update user.");
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    setStatus(null);
    try {
      await deleteUser(id);
      setStatus("User deleted.");
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete user.");
    }
  };

  return (
    <section className="arena-page">
      <header className="arena-page__heading">
        <h1 className="arena-page__title">CRUD utilisateurs</h1>
        <p className="arena-page__subtitle">
          Gere les comptes joueurs et presentateurs.
        </p>
      </header>

      <div className="arena-panel">
        {status && <div className="arena-status">{status}</div>}
        {error && <div className="arena-status arena-status--error">{error}</div>}
        <UserCrud
          initialUsers={users}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      </div>
    </section>
  );
}

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import "./quiz-components.css";
import type { UserProfile } from "./types";

type UserCrudProps = {
  initialUsers?: UserProfile[];
  onUsersChange?: (users: UserProfile[]) => void;
  onCreate?: (payload: Omit<UserProfile, "id">) => void;
  onUpdate?: (id: string, payload: Omit<UserProfile, "id">) => void;
  onDelete?: (id: string) => void;
};

const DEFAULT_USERS: UserProfile[] = [
  { id: "u1", name: "Alex Morgan", email: "alex@example.com", role: "admin" },
  { id: "u2", name: "Riley Chen", email: "riley@example.com", role: "player" },
];

export default function UserCrud({
  initialUsers,
  onUsersChange,
  onCreate,
  onUpdate,
  onDelete,
}: UserCrudProps) {
  const [users, setUsers] = useState<UserProfile[]>(
    initialUsers && initialUsers.length > 0 ? initialUsers : DEFAULT_USERS,
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserProfile["role"]>("player");

  const editingUser = useMemo(
    () => users.find((user) => user.id === editingId) ?? null,
    [users, editingId],
  );

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setEmail("");
    setRole("player");
  };

  const syncUsers = (nextUsers: UserProfile[]) => {
    setUsers(nextUsers);
    onUsersChange?.(nextUsers);
  };

  const handleEdit = (user: UserProfile) => {
    setEditingId(user.id);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
  };

  const handleDelete = (userId: string) => {
    syncUsers(users.filter((user) => user.id !== userId));
    if (editingId === userId) {
      resetForm();
    }
    onDelete?.(userId);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !email.trim()) {
      return;
    }

    if (editingId) {
      const payload = { name: name.trim(), email: email.trim(), role };
      syncUsers(
        users.map((user) =>
          user.id === editingId
            ? { ...user, ...payload }
            : user,
        ),
      );
      onUpdate?.(editingId, payload);
      resetForm();
      return;
    }

    const newUserPayload = {
      name: name.trim(),
      email: email.trim(),
      role,
    };
    const newUser: UserProfile = {
      id: `u${Date.now()}`,
      ...newUserPayload,
    };
    syncUsers([newUser, ...users]);
    onCreate?.(newUserPayload);
    resetForm();
  };

  return (
    <section className="quiz-card">
      <header className="quiz-card__header">
        <p className="quiz-card__eyebrow">User admin</p>
        <h2 className="quiz-card__title">Manage players</h2>
        <p className="quiz-card__subtitle">
          Create, update, and remove quiz accounts.
        </p>
      </header>

      <form className="quiz-form" onSubmit={handleSubmit}>
        <div className="quiz-grid">
          <label className="quiz-field">
            <span className="quiz-field__label">Name</span>
            <input
              className="quiz-field__input"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Jamie Lee"
              required
            />
          </label>

          <label className="quiz-field">
            <span className="quiz-field__label">Email</span>
            <input
              className="quiz-field__input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="jamie@arena.io"
              required
            />
          </label>
        </div>

        <label className="quiz-field">
          <span className="quiz-field__label">Role</span>
          <select
            className="quiz-field__input"
            value={role}
            onChange={(event) =>
              setRole(event.target.value as UserProfile["role"])
            }
          >
            <option value="player">Player</option>
            <option value="presenter">Presenter</option>
            <option value="admin">Admin</option>
          </select>
        </label>

        <div className="quiz-actions">
          <button className="quiz-button" type="submit">
            {editingUser ? "Update user" : "Add user"}
          </button>
          {editingUser && (
            <button
              className="quiz-button quiz-button--ghost"
              type="button"
              onClick={resetForm}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="quiz-table">
        <div className="quiz-table__head">
          <span>Name</span>
          <span>Email</span>
          <span>Role</span>
          <span>Actions</span>
        </div>
        {users.map((user) => (
          <div className="quiz-table__row" key={user.id}>
            <span>{user.name}</span>
            <span>{user.email}</span>
            <span className="quiz-badge">{user.role}</span>
            <span className="quiz-table__actions">
              <button
                className="quiz-link"
                type="button"
                onClick={() => handleEdit(user)}
              >
                Edit
              </button>
              <button
                className="quiz-link quiz-link--danger"
                type="button"
                onClick={() => handleDelete(user.id)}
              >
                Delete
              </button>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

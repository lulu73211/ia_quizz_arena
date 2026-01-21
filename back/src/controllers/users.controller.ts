import { Request, Response } from "express";

type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: "player" | "presenter" | "admin";
};

const users: UserProfile[] = [
  { id: "u1", name: "Alex Morgan", email: "alex@example.com", role: "admin" },
  { id: "u2", name: "Riley Chen", email: "riley@example.com", role: "player" },
];

export const listUsers = (_req: Request, res: Response) => {
  res.json(users);
};

export const createUser = (req: Request, res: Response) => {
  const { name, email, role } = req.body as Omit<UserProfile, "id">;
  if (!name || !email) {
    res.status(400).json({ message: "Name and email are required." });
    return;
  }

  const newUser: UserProfile = {
    id: `u${Date.now()}`,
    name,
    email,
    role: role ?? "player",
  };
  users.unshift(newUser);
  res.status(201).json(newUser);
};

export const updateUser = (req: Request, res: Response) => {
  const { name, email, role } = req.body as Omit<UserProfile, "id">;
  const existing = users.find((user) => user.id === req.params.id);
  if (!existing) {
    res.status(404).json({ message: "User not found." });
    return;
  }
  if (!name || !email) {
    res.status(400).json({ message: "Name and email are required." });
    return;
  }

  existing.name = name;
  existing.email = email;
  existing.role = role ?? existing.role;
  res.json(existing);
};

export const deleteUser = (req: Request, res: Response) => {
  const index = users.findIndex((user) => user.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ message: "User not found." });
    return;
  }
  users.splice(index, 1);
  res.json({ ok: true });
};

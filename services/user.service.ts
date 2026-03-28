import { usersSeed } from "@/services/mock-db";
import { delay } from "@/utils/delay";
import { createId } from "@/utils/id";
import { User } from "@/types/user";

let users: User[] = [...usersSeed];

export async function listUsers() {
  await delay(400);
  return [...users];
}

export async function getUserById(id: string) {
  await delay(250);
  return users.find((user) => user.id === id) ?? null;
}

export async function createUser(input: Omit<User, "id" | "createdAt">) {
  await delay(450);
  const user: User = {
    ...input,
    id: createId("usr"),
    createdAt: new Date().toISOString(),
  };
  users = [user, ...users];
  return user;
}

export async function updateUser(id: string, input: Partial<Omit<User, "id" | "createdAt">>) {
  await delay(450);
  users = users.map((user) => (user.id === id ? { ...user, ...input } : user));
  return users.find((user) => user.id === id) ?? null;
}

export async function deleteUser(id: string) {
  await delay(350);
  users = users.filter((user) => user.id !== id);
  return true;
}

export async function listUserStats() {
  await delay(150);
  return {
    total: users.length,
    clients: users.filter((user) => user.role === "client").length,
    admins: users.filter((user) => user.role === "admin").length,
  };
}

export function getUserSnapshot() {
  return [...users];
}

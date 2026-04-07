import { eq } from "drizzle-orm";
import { getDb } from "../db/database";
import { user } from "../drizzle-out/auth-schema";

export async function getUserById(id: string) {
  const db = getDb();
  const rows = await db.select().from(user).where(eq(user.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getAllUsersWithEmail(): Promise<
  { id: string; email: string; name: string }[]
> {
  const db = getDb();
  return db.select({ id: user.id, email: user.email, name: user.name }).from(user);
}

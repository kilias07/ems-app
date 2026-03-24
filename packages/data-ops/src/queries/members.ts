import { eq } from "drizzle-orm";
import { getDb } from "../db/database";
import { memberProfile } from "../db/ems-schema";

export async function getMemberById(id: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(memberProfile)
    .where(eq(memberProfile.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function getMemberByNickname(nickname: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(memberProfile)
    .where(eq(memberProfile.nickname, nickname))
    .limit(1);
  return rows[0] ?? null;
}

export async function getAllMembers() {
  const db = getDb();
  return db.select().from(memberProfile).orderBy(memberProfile.nickname);
}

export async function createMemberProfile(data: {
  id: string;
  nickname?: string | null;
  role?: string;
  avatarUrl?: string | null;
}) {
  const db = getDb();
  await db.insert(memberProfile).values({
    id: data.id,
    nickname: data.nickname ?? null,
    role: data.role ?? "user",
    avatarUrl: data.avatarUrl ?? null,
  });
}

export async function updateNickname(
  id: string,
  nickname: string,
  suitSize?: string | null,
) {
  const db = getDb();
  await db
    .update(memberProfile)
    .set({ nickname, profileComplete: 1, ...(suitSize ? { suitSize } : {}) })
    .where(eq(memberProfile.id, id));
}

export async function updateSuitSize(id: string, suitSize: string) {
  const db = getDb();
  await db
    .update(memberProfile)
    .set({ suitSize })
    .where(eq(memberProfile.id, id));
}

export async function setMemberActive(id: string, active: boolean) {
  const db = getDb();
  await db
    .update(memberProfile)
    .set({ isActive: active ? 1 : 0 })
    .where(eq(memberProfile.id, id));
}

export async function setMemberRole(id: string, role: string) {
  const db = getDb();
  await db
    .update(memberProfile)
    .set({ role })
    .where(eq(memberProfile.id, id));
}

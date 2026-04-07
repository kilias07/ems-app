import { eq, isNull, or } from "drizzle-orm";
import { getDb } from "../db/database";
import { memberProfile } from "../db/ems-schema";
import { user as authUser } from "../drizzle-out/auth-schema";

export async function deleteAccount(id: string) {
  const db = getDb();
  // member_profile → training_session cascade; user → session/account cascade
  await db.delete(memberProfile).where(eq(memberProfile.id, id));
  await db.delete(authUser).where(eq(authUser.id, id));
}

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
  const rows = await db
    .select({
      id: memberProfile.id,
      nickname: memberProfile.nickname,
      role: memberProfile.role,
      status: memberProfile.status,
      isActive: memberProfile.isActive,
      profileComplete: memberProfile.profileComplete,
      suitSize: memberProfile.suitSize,
      avatarUrl: memberProfile.avatarUrl,
      trainerId: memberProfile.trainerId,
      clubPlaceId: memberProfile.clubPlaceId,
      joinedAt: memberProfile.joinedAt,
      email: authUser.email,
      name: authUser.name,
    })
    .from(memberProfile)
    .leftJoin(authUser, eq(memberProfile.id, authUser.id))
    .orderBy(memberProfile.nickname);
  return rows;
}

export async function getPendingMembers() {
  const db = getDb();
  const rows = await db
    .select({
      id: memberProfile.id,
      nickname: memberProfile.nickname,
      role: memberProfile.role,
      status: memberProfile.status,
      isActive: memberProfile.isActive,
      profileComplete: memberProfile.profileComplete,
      suitSize: memberProfile.suitSize,
      avatarUrl: memberProfile.avatarUrl,
      trainerId: memberProfile.trainerId,
      clubPlaceId: memberProfile.clubPlaceId,
      joinedAt: memberProfile.joinedAt,
      email: authUser.email,
      name: authUser.name,
    })
    .from(memberProfile)
    .leftJoin(authUser, eq(memberProfile.id, authUser.id))
    .where(eq(memberProfile.status, "pending"))
    .orderBy(memberProfile.joinedAt);
  return rows;
}

export async function createMemberProfile(data: {
  id: string;
  nickname?: string | null;
  role?: string;
  status?: string;
  avatarUrl?: string | null;
}) {
  const db = getDb();
  await db.insert(memberProfile).values({
    id: data.id,
    nickname: data.nickname ?? null,
    role: data.role ?? "user",
    status: data.status ?? "pending",
    avatarUrl: data.avatarUrl ?? null,
  });
}

export async function updateNickname(id: string, nickname: string) {
  const db = getDb();
  await db
    .update(memberProfile)
    .set({ nickname, profileComplete: 1 })
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

export async function approveMember(id: string) {
  const db = getDb();
  await db
    .update(memberProfile)
    .set({ status: "approved" })
    .where(eq(memberProfile.id, id));
}

export async function assignTrainerToUser(userId: string, trainerId: string | null) {
  const db = getDb();
  await db
    .update(memberProfile)
    .set({ trainerId })
    .where(eq(memberProfile.id, userId));
}

export async function assignClubPlaceToUser(userId: string, clubPlaceId: string | null) {
  const db = getDb();
  await db
    .update(memberProfile)
    .set({ clubPlaceId })
    .where(eq(memberProfile.id, userId));
}

export async function getUnassignedOrMyUsers(trainerId: string) {
  const db = getDb();
  return db
    .select()
    .from(memberProfile)
    .where(
      or(
        eq(memberProfile.trainerId, trainerId),
        isNull(memberProfile.trainerId),
      ),
    )
    .orderBy(memberProfile.nickname);
}

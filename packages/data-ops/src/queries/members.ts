import { and, eq, inArray, isNull, or } from "drizzle-orm";
import { getDb } from "../db/database";
import { clubTrainer, memberProfile } from "../db/ems-schema";
import { user as authUser } from "../drizzle-out/auth-schema";
import { HOME_CLUB_ID } from "../utils/suit-multipliers";

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

const memberSelect = {
  id: memberProfile.id,
  nickname: memberProfile.nickname,
  role: memberProfile.role,
  status: memberProfile.status,
  isActive: memberProfile.isActive,
  profileComplete: memberProfile.profileComplete,
  suitSize: memberProfile.suitSize,
  avatarUrl: memberProfile.avatarUrl,
  clubPlaceId: memberProfile.clubPlaceId,
  joinedAt: memberProfile.joinedAt,
  email: authUser.email,
  name: authUser.name,
};

export async function getAllMembers() {
  const db = getDb();
  return db
    .select(memberSelect)
    .from(memberProfile)
    .leftJoin(authUser, eq(memberProfile.id, authUser.id))
    .orderBy(memberProfile.nickname);
}

export async function getPendingMembers() {
  const db = getDb();
  return db
    .select(memberSelect)
    .from(memberProfile)
    .leftJoin(authUser, eq(memberProfile.id, authUser.id))
    .where(eq(memberProfile.status, "pending"))
    .orderBy(memberProfile.joinedAt);
}

/**
 * Members that a trainer is allowed to manage:
 * - users in any of the trainer's assigned clubs
 * - users in the open pool: clubPlaceId = 'home' OR clubPlaceId IS NULL
 */
export async function getMembersForTrainer(trainerId: string) {
  const db = getDb();
  const clubIdRows = await db
    .select({ id: clubTrainer.clubPlaceId })
    .from(clubTrainer)
    .where(eq(clubTrainer.trainerId, trainerId));
  const clubIds = clubIdRows.map((r) => r.id);

  const inClubs = clubIds.length > 0 ? inArray(memberProfile.clubPlaceId, clubIds) : undefined;
  const openPool = or(
    isNull(memberProfile.clubPlaceId),
    eq(memberProfile.clubPlaceId, HOME_CLUB_ID),
  );
  const scope = inClubs ? or(inClubs, openPool) : openPool;

  return db
    .select(memberSelect)
    .from(memberProfile)
    .leftJoin(authUser, eq(memberProfile.id, authUser.id))
    .where(scope)
    .orderBy(memberProfile.nickname);
}

export async function getPendingMembersForTrainer(trainerId: string) {
  const db = getDb();
  const clubIdRows = await db
    .select({ id: clubTrainer.clubPlaceId })
    .from(clubTrainer)
    .where(eq(clubTrainer.trainerId, trainerId));
  const clubIds = clubIdRows.map((r) => r.id);

  const inClubs = clubIds.length > 0 ? inArray(memberProfile.clubPlaceId, clubIds) : undefined;
  const openPool = or(
    isNull(memberProfile.clubPlaceId),
    eq(memberProfile.clubPlaceId, HOME_CLUB_ID),
  );
  const scope = inClubs ? or(inClubs, openPool) : openPool;

  return db
    .select(memberSelect)
    .from(memberProfile)
    .leftJoin(authUser, eq(memberProfile.id, authUser.id))
    .where(and(eq(memberProfile.status, "pending"), scope))
    .orderBy(memberProfile.joinedAt);
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

export async function assignClubPlaceToUser(
  userId: string,
  clubPlaceId: string | null,
  city: string | null,
) {
  const db = getDb();
  await db
    .update(memberProfile)
    .set({ clubPlaceId, city })
    .where(eq(memberProfile.id, userId));
}


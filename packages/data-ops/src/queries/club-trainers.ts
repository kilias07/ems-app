import { and, eq, sql } from "drizzle-orm";
import { getDb } from "../db/database";
import { clubPlace, clubTrainer, memberProfile } from "../db/ems-schema";

export async function assignTrainerToClub(trainerId: string, clubPlaceId: string) {
  const db = getDb();
  // INSERT OR IGNORE — idempotent
  await db
    .insert(clubTrainer)
    .values({ trainerId, clubPlaceId })
    .onConflictDoNothing();
}

export async function unassignTrainerFromClub(trainerId: string, clubPlaceId: string) {
  const db = getDb();
  await db
    .delete(clubTrainer)
    .where(
      and(
        eq(clubTrainer.trainerId, trainerId),
        eq(clubTrainer.clubPlaceId, clubPlaceId),
      ),
    );
}

export async function getClubsForTrainer(trainerId: string) {
  const db = getDb();
  return db
    .select({
      id: clubPlace.id,
      name: clubPlace.name,
      city: clubPlace.city,
      address: clubPlace.address,
    })
    .from(clubTrainer)
    .innerJoin(clubPlace, eq(clubTrainer.clubPlaceId, clubPlace.id))
    .where(eq(clubTrainer.trainerId, trainerId))
    .orderBy(clubPlace.name);
}

export async function getTrainersForClub(clubPlaceId: string) {
  const db = getDb();
  return db
    .select({
      id: memberProfile.id,
      nickname: memberProfile.nickname,
      role: memberProfile.role,
      avatarUrl: memberProfile.avatarUrl,
    })
    .from(clubTrainer)
    .innerJoin(memberProfile, eq(clubTrainer.trainerId, memberProfile.id))
    .where(eq(clubTrainer.clubPlaceId, clubPlaceId))
    .orderBy(memberProfile.nickname);
}

export async function getClubPlaceIdsForTrainer(trainerId: string): Promise<string[]> {
  const db = getDb();
  const rows = await db
    .select({ id: clubTrainer.clubPlaceId })
    .from(clubTrainer)
    .where(eq(clubTrainer.trainerId, trainerId));
  return rows.map((r) => r.id);
}

export async function isTrainerInClub(
  trainerId: string,
  clubPlaceId: string,
): Promise<boolean> {
  const db = getDb();
  const rows = await db
    .select({ one: sql<number>`1` })
    .from(clubTrainer)
    .where(
      and(
        eq(clubTrainer.trainerId, trainerId),
        eq(clubTrainer.clubPlaceId, clubPlaceId),
      ),
    )
    .limit(1);
  return rows.length > 0;
}

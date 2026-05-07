import { eq, sql } from "drizzle-orm";
import { getDb } from "../db/database";
import { clubPlace } from "../db/ems-schema";

export async function getAllClubPlaces() {
  const db = getDb();
  return db.select().from(clubPlace).orderBy(clubPlace.name);
}

export async function getRankingCities(): Promise<string[]> {
  const db = getDb();
  const rows = await db
    .selectDistinct({ city: clubPlace.city })
    .from(clubPlace)
    .where(sql`${clubPlace.city} != ''`)
    .orderBy(clubPlace.city);
  return rows.map((r) => r.city);
}

export async function getClubPlaceById(id: string) {
  const db = getDb();
  const rows = await db.select().from(clubPlace).where(eq(clubPlace.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function createClubPlace(data: {
  id: string;
  name: string;
  city: string;
  address: string;
  openHours?: string | null;
  createdBy: string;
}) {
  const db = getDb();
  await db.insert(clubPlace).values(data);
}

export async function updateClubPlace(
  id: string,
  data: { name?: string; city?: string; address?: string; openHours?: string | null },
) {
  const db = getDb();
  await db.update(clubPlace).set(data).where(eq(clubPlace.id, id));
}

export async function deleteClubPlace(id: string) {
  const db = getDb();
  await db.delete(clubPlace).where(eq(clubPlace.id, id));
}

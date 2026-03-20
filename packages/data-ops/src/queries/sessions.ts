import { and, eq, gte, lte, sql, desc } from "drizzle-orm";
import { getDb } from "../db/database";
import { trainingSession } from "../db/ems-schema";

export async function getSessionsByMember(
  memberId: string,
  opts: { page?: number; dateFrom?: string; dateTo?: string } = {},
) {
  const db = getDb();
  const PAGE_SIZE = 20;
  const offset = ((opts.page ?? 1) - 1) * PAGE_SIZE;

  const conditions = [eq(trainingSession.memberId, memberId)];
  if (opts.dateFrom) conditions.push(gte(trainingSession.sessionDate, opts.dateFrom));
  if (opts.dateTo) conditions.push(lte(trainingSession.sessionDate, opts.dateTo));

  const rows = await db
    .select()
    .from(trainingSession)
    .where(and(...conditions))
    .orderBy(desc(trainingSession.sessionDate))
    .limit(PAGE_SIZE)
    .offset(offset);

  const countRows = await db
    .select({ count: sql<number>`count(*)` })
    .from(trainingSession)
    .where(and(...conditions));

  return {
    data: rows,
    total: countRows[0]?.count ?? 0,
    page: opts.page ?? 1,
    pageSize: PAGE_SIZE,
  };
}

export async function getMemberStats(memberId: string) {
  const db = getDb();

  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + 1); // Monday
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  const [totals, weekly, monthly] = await Promise.all([
    db
      .select({
        totalSessions: sql<number>`count(*)`,
        totalPoints: sql<number>`sum(${trainingSession.correctedPoints})`,
      })
      .from(trainingSession)
      .where(eq(trainingSession.memberId, memberId)),

    db
      .select({ count: sql<number>`count(*)` })
      .from(trainingSession)
      .where(
        and(
          eq(trainingSession.memberId, memberId),
          gte(trainingSession.sessionDate, fmt(weekStart)),
        ),
      ),

    db
      .select({ points: sql<number>`sum(${trainingSession.correctedPoints})` })
      .from(trainingSession)
      .where(
        and(
          eq(trainingSession.memberId, memberId),
          gte(trainingSession.sessionDate, fmt(monthStart)),
        ),
      ),
  ]);

  return {
    totalSessions: totals[0]?.totalSessions ?? 0,
    totalPoints: totals[0]?.totalPoints ?? 0,
    weekSessions: weekly[0]?.count ?? 0,
    monthPoints: monthly[0]?.points ?? 0,
  };
}

export async function getWeeklyPointsHistory(memberId: string) {
  const db = getDb();
  const weeks: { weekStart: string; weekEnd: string; points: number }[] = [];
  const today = new Date();

  for (let i = 7; i >= 0; i--) {
    const weekEnd = new Date(today);
    weekEnd.setDate(today.getDate() - today.getDay() + 1 - (i - 1) * 7);
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekEnd.getDate() - 6);

    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    const result = await db
      .select({ points: sql<number>`sum(${trainingSession.correctedPoints})` })
      .from(trainingSession)
      .where(
        and(
          eq(trainingSession.memberId, memberId),
          gte(trainingSession.sessionDate, fmt(weekStart)),
          lte(trainingSession.sessionDate, fmt(weekEnd)),
        ),
      );

    weeks.push({
      weekStart: fmt(weekStart),
      weekEnd: fmt(weekEnd),
      points: result[0]?.points ?? 0,
    });
  }

  return weeks;
}

export async function insertSession(data: {
  id: string;
  memberId: string;
  sessionDate: string;
  suitSize: string;
  rawPoints: number;
  correctedPoints: number;
  createdBy: string;
  notes?: string | null;
}) {
  const db = getDb();
  await db.insert(trainingSession).values(data);
}

export async function insertSessionsBatch(
  rows: {
    id: string;
    memberId: string;
    sessionDate: string;
    suitSize: string;
    rawPoints: number;
    correctedPoints: number;
    createdBy: string;
    notes?: string | null;
  }[],
) {
  const db = getDb();
  if (rows.length === 0) return;
  await db.insert(trainingSession).values(rows);
}

export async function deleteSession(sessionId: string) {
  const db = getDb();
  await db.delete(trainingSession).where(eq(trainingSession.id, sessionId));
}

import { and, eq, gte, lte, sql, desc } from "drizzle-orm";
import { getDb } from "../db/database";
import { memberProfile, trainingSession } from "../db/ems-schema";

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
  weekStart.setDate(today.getDate() - today.getDay() + 1);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  const approvedOnly = eq(trainingSession.status, "approved");

  const [totals, weekly, monthly] = await Promise.all([
    db
      .select({
        totalSessions: sql<number>`count(*)`,
        totalPoints: sql<number>`sum(${trainingSession.correctedPoints})`,
      })
      .from(trainingSession)
      .where(and(eq(trainingSession.memberId, memberId), approvedOnly)),

    db
      .select({
        count: sql<number>`count(*)`,
        points: sql<number>`sum(${trainingSession.correctedPoints})`,
      })
      .from(trainingSession)
      .where(
        and(
          eq(trainingSession.memberId, memberId),
          approvedOnly,
          gte(trainingSession.sessionDate, fmt(weekStart)),
        ),
      ),

    db
      .select({
        count: sql<number>`count(*)`,
        points: sql<number>`sum(${trainingSession.correctedPoints})`,
      })
      .from(trainingSession)
      .where(
        and(
          eq(trainingSession.memberId, memberId),
          approvedOnly,
          gte(trainingSession.sessionDate, fmt(monthStart)),
        ),
      ),
  ]);

  return {
    totalSessions: totals[0]?.totalSessions ?? 0,
    totalPoints: totals[0]?.totalPoints ?? 0,
    weekSessions: weekly[0]?.count ?? 0,
    weekPoints: weekly[0]?.points ?? 0,
    monthSessions: monthly[0]?.count ?? 0,
    monthPoints: monthly[0]?.points ?? 0,
  };
}

export async function getWeeklyPointsHistory(memberId: string) {
  const db = getDb();
  const today = new Date();
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  // Compute 8 Monday-based weeks (Mon-Sun)
  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ...
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const thisMonday = new Date(today);
  thisMonday.setDate(today.getDate() + mondayOffset);

  const weekMondays: string[] = [];
  for (let i = 7; i >= 0; i--) {
    const monday = new Date(thisMonday);
    monday.setDate(thisMonday.getDate() - i * 7);
    weekMondays.push(fmt(monday));
  }

  const earliest = weekMondays[0];
  const lastMonday = weekMondays[weekMondays.length - 1];
  const lastSunday = new Date(lastMonday);
  lastSunday.setDate(lastSunday.getDate() + 6);
  const latest = fmt(lastSunday);

  // Single query: group by Monday of each week (SQLite)
  const rows = await db
    .select({
      weekMonday: sql<string>`date(${trainingSession.sessionDate}, 'weekday 1', '-7 days')`,
      points: sql<number>`sum(${trainingSession.correctedPoints})`,
    })
    .from(trainingSession)
    .where(
      and(
        eq(trainingSession.memberId, memberId),
        eq(trainingSession.status, "approved"),
        gte(trainingSession.sessionDate, earliest),
        lte(trainingSession.sessionDate, latest),
      ),
    )
    .groupBy(sql`date(${trainingSession.sessionDate}, 'weekday 1', '-7 days')`);

  const pointsMap = new Map(rows.map((r) => [r.weekMonday, r.points]));

  return weekMondays.map((monday) => {
    const sun = new Date(monday);
    sun.setDate(sun.getDate() + 6);
    return {
      weekStart: monday,
      weekEnd: fmt(sun),
      points: pointsMap.get(monday) ?? 0,
    };
  });
}

export async function getMonthlyPointsHistory(memberId: string) {
  const db = getDb();
  const today = new Date();

  // Compute 6 month keys
  const monthKeys: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    monthKeys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  const earliest = monthKeys[0] + "-01";

  // Single query: group by year-month
  const rows = await db
    .select({
      month: sql<string>`substr(${trainingSession.sessionDate}, 1, 7)`,
      points: sql<number>`coalesce(sum(${trainingSession.correctedPoints}), 0)`,
      sessions: sql<number>`count(*)`,
    })
    .from(trainingSession)
    .where(
      and(
        eq(trainingSession.memberId, memberId),
        eq(trainingSession.status, "approved"),
        gte(trainingSession.sessionDate, earliest),
      ),
    )
    .groupBy(sql`substr(${trainingSession.sessionDate}, 1, 7)`);

  const dataMap = new Map(rows.map((r) => [r.month, r]));

  return monthKeys.map((key) => ({
    month: key,
    points: dataMap.get(key)?.points ?? 0,
    sessions: dataMap.get(key)?.sessions ?? 0,
  }));
}

export async function getDayOfWeekDistribution(memberId: string) {
  const db = getDb();

  const rows = await db
    .select({
      dow: sql<number>`cast(strftime('%w', ${trainingSession.sessionDate}) as integer)`,
      sessions: sql<number>`count(*)`,
    })
    .from(trainingSession)
    .where(
      and(
        eq(trainingSession.memberId, memberId),
        eq(trainingSession.status, "approved"),
      ),
    )
    .groupBy(sql`strftime('%w', ${trainingSession.sessionDate})`);

  const dayNames = ["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "Sb"];
  // Return all 7 days, Mon-Sun order
  const reordered = [1, 2, 3, 4, 5, 6, 0];
  return reordered.map((dow) => {
    const row = rows.find((r) => r.dow === dow);
    return { day: dayNames[dow], sessions: row?.sessions ?? 0 };
  });
}

export async function insertSession(data: {
  id: string;
  memberId: string;
  sessionDate: string;
  suitSize: string;
  rawPoints: number;
  correctedPoints: number;
  status?: string;
  createdBy: string;
  notes?: string | null;
}) {
  const db = getDb();
  await db.insert(trainingSession).values({
    ...data,
    status: data.status ?? "pending",
  });
}

export async function insertSessionsBatch(
  rows: {
    id: string;
    memberId: string;
    sessionDate: string;
    suitSize: string;
    rawPoints: number;
    correctedPoints: number;
    status?: string;
    createdBy: string;
    notes?: string | null;
  }[],
) {
  const db = getDb();
  if (rows.length === 0) return;
  await db.insert(trainingSession).values(
    rows.map((r) => ({ ...r, status: r.status ?? "pending" })),
  );
}

export async function approveSession(
  sessionId: string,
  reviewedBy: string,
  edits?: { rawPoints?: number; correctedPoints?: number; notes?: string | null },
) {
  const db = getDb();
  await db
    .update(trainingSession)
    .set({
      status: "approved",
      reviewedBy,
      rejectionNote: null,
      ...(edits ?? {}),
    })
    .where(eq(trainingSession.id, sessionId));
}

export async function rejectSession(
  sessionId: string,
  reviewedBy: string,
  rejectionNote: string,
) {
  const db = getDb();
  await db
    .update(trainingSession)
    .set({ status: "rejected", reviewedBy, rejectionNote })
    .where(eq(trainingSession.id, sessionId));
}

export async function resubmitSession(sessionId: string, memberId: string) {
  const db = getDb();
  await db
    .update(trainingSession)
    .set({ status: "pending", rejectionNote: null, reviewedBy: null })
    .where(and(eq(trainingSession.id, sessionId), eq(trainingSession.memberId, memberId)));
}

export async function getPendingSessionsForTrainer(trainerId: string) {
  const db = getDb();
  const rows = await db
    .select({
      session: trainingSession,
      memberNickname: memberProfile.nickname,
    })
    .from(trainingSession)
    .innerJoin(memberProfile, eq(trainingSession.memberId, memberProfile.id))
    .where(
      and(
        eq(trainingSession.status, "pending"),
        eq(memberProfile.trainerId, trainerId),
      ),
    )
    .orderBy(desc(trainingSession.createdAt));

  return rows.map((r) => ({ ...r.session, memberNickname: r.memberNickname }));
}

export async function getAllPendingSessions() {
  const db = getDb();
  const rows = await db
    .select({
      session: trainingSession,
      memberNickname: memberProfile.nickname,
    })
    .from(trainingSession)
    .innerJoin(memberProfile, eq(trainingSession.memberId, memberProfile.id))
    .where(eq(trainingSession.status, "pending"))
    .orderBy(desc(trainingSession.createdAt));

  return rows.map((r) => ({ ...r.session, memberNickname: r.memberNickname }));
}

export async function deleteSession(sessionId: string) {
  const db = getDb();
  await db.delete(trainingSession).where(eq(trainingSession.id, sessionId));
}

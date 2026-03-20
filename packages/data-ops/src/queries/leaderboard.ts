import { and, gte, lte, sql } from "drizzle-orm";
import { getDb } from "../db/database";
import { memberProfile, trainingSession } from "../db/ems-schema";

export type LeaderboardPeriod = "all" | "monthly" | "weekly";

function buildDateFilter(period: LeaderboardPeriod, periodKey?: string) {
  if (period === "all") return undefined;

  if (period === "monthly" && periodKey) {
    // periodKey = "2026-03"
    return sql`${trainingSession.sessionDate} LIKE ${periodKey + "%"}`;
  }

  if (period === "weekly" && periodKey) {
    // periodKey = "2026-03-14" (Monday)
    const start = periodKey;
    const end = new Date(periodKey);
    end.setDate(end.getDate() + 6);
    const endStr = end.toISOString().slice(0, 10);
    return and(
      gte(trainingSession.sessionDate, start),
      lte(trainingSession.sessionDate, endStr),
    );
  }

  return undefined;
}

export async function getLeaderboard(
  period: LeaderboardPeriod,
  periodKey?: string,
) {
  const db = getDb();
  const dateFilter = buildDateFilter(period, periodKey);

  const rows = await db
    .select({
      memberId: trainingSession.memberId,
      totalScore: sql<number>`sum(${trainingSession.correctedPoints})`,
      sessions: sql<number>`count(*)`,
    })
    .from(trainingSession)
    .where(dateFilter)
    .groupBy(trainingSession.memberId)
    .orderBy(sql`sum(${trainingSession.correctedPoints}) DESC`);

  if (rows.length === 0) return [];

  const memberIds = rows.map((r) => r.memberId);

  const profiles = await db
    .select({
      id: memberProfile.id,
      nickname: memberProfile.nickname,
      avatarUrl: memberProfile.avatarUrl,
    })
    .from(memberProfile);

  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  return rows.map((row, index) => {
    const profile = profileMap.get(row.memberId);
    return {
      rank: index + 1,
      memberId: row.memberId,
      nickname: profile?.nickname ?? "Unknown",
      avatarUrl: profile?.avatarUrl ?? null,
      totalScore: row.totalScore ?? 0,
      sessions: row.sessions ?? 0,
    };
  });
}

export async function getMemberRank(
  memberId: string,
  period: LeaderboardPeriod,
  periodKey?: string,
) {
  const board = await getLeaderboard(period, periodKey);
  const entry = board.find((r) => r.memberId === memberId);
  return entry ?? null;
}

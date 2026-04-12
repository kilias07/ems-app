import { and, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { getDb } from "../db/database";
import { clubPlace, memberProfile, trainingSession } from "../db/ems-schema";

export type LeaderboardPeriod = "all" | "monthly" | "weekly";
export type LeaderboardScope = "club" | "city" | "country";

function buildDateFilter(period: LeaderboardPeriod, periodKey?: string) {
  if (period === "all") return undefined;

  if (period === "monthly" && periodKey) {
    return sql`${trainingSession.sessionDate} LIKE ${periodKey + "%"}`;
  }

  if (period === "weekly" && periodKey) {
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
  scope?: LeaderboardScope,
  scopeKey?: string | null,
) {
  const db = getDb();
  const dateFilter = buildDateFilter(period, periodKey);

  const approvedFilter = eq(trainingSession.status, "approved");
  const activeFilter = eq(memberProfile.isActive, 1);

  const filters = [approvedFilter, activeFilter];
  if (dateFilter) filters.push(dateFilter);

  if (scope === "club" && scopeKey) {
    filters.push(eq(memberProfile.clubPlaceId, scopeKey));
  } else if (scope === "city" && scopeKey) {
    filters.push(eq(clubPlace.city, scopeKey));
  }

  const needsClubJoin = scope === "city";

  const baseQuery = db
    .select({
      memberId: trainingSession.memberId,
      totalScore: sql<number>`sum(${trainingSession.correctedPoints})`,
      sessions: sql<number>`count(*)`,
    })
    .from(trainingSession)
    .innerJoin(memberProfile, eq(trainingSession.memberId, memberProfile.id));

  const query = needsClubJoin
    ? baseQuery
        .innerJoin(clubPlace, eq(memberProfile.clubPlaceId, clubPlace.id))
        .where(and(...filters))
        .groupBy(trainingSession.memberId)
        .orderBy(sql`sum(${trainingSession.correctedPoints}) DESC`)
    : baseQuery
        .where(and(...filters))
        .groupBy(trainingSession.memberId)
        .orderBy(sql`sum(${trainingSession.correctedPoints}) DESC`);

  const rows = await query;

  if (rows.length === 0) return [];

  const memberIds = rows.map((r) => r.memberId);

  const profiles = await db
    .select({
      id: memberProfile.id,
      nickname: memberProfile.nickname,
      avatarUrl: memberProfile.avatarUrl,
    })
    .from(memberProfile)
    .where(inArray(memberProfile.id, memberIds));

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
  scope?: LeaderboardScope,
  scopeKey?: string | null,
) {
  const board = await getLeaderboard(period, periodKey, scope, scopeKey);
  const entry = board.find((r) => r.memberId === memberId);
  return entry ?? null;
}

export async function getMemberRanks(
  memberId: string,
  period: LeaderboardPeriod,
  periodKey?: string,
  clubPlaceId?: string | null,
  city?: string | null,
) {
  const [clubRank, cityRank, countryRank] = await Promise.all([
    clubPlaceId
      ? getMemberRank(memberId, period, periodKey, "club", clubPlaceId)
      : null,
    city
      ? getMemberRank(memberId, period, periodKey, "city", city)
      : null,
    getMemberRank(memberId, period, periodKey, "country"),
  ]);

  return { clubRank, cityRank, countryRank };
}

import { t } from "@/worker/trpc/trpc-instance";
import { z } from "zod";
import {
  getLeaderboard,
  getMemberRanks,
} from "@repo/data-ops/queries/leaderboard";
import { getClubPlaceById } from "@repo/data-ops/queries/club-places";
const HOME_CLUB_ID = "home";
const HOME_CLUB_NAME = "Trening w domu";

const periodSchema = z.enum(["all", "monthly", "weekly"]);
const scopeSchema = z.enum(["club", "city", "country"]);

export const leaderboardRoutes = t.router({
  getMyClubInfo: t.procedure.query(async ({ ctx }) => {
    const clubPlaceId = ctx.userInfo.clubPlaceId;
    if (!clubPlaceId) return null;
    if (clubPlaceId === HOME_CLUB_ID) {
      return { id: HOME_CLUB_ID, name: HOME_CLUB_NAME, city: null };
    }
    const club = await getClubPlaceById(clubPlaceId);
    if (!club) return null;
    return { id: club.id, name: club.name, city: club.city };
  }),

  getLeaderboard: t.procedure
    .input(
      z.object({
        period: periodSchema,
        periodKey: z.string().optional(),
        scope: scopeSchema.default("country"),
        scopeKey: z.string().nullish(),
      }),
    )
    .query(async ({ input }) => {
      return getLeaderboard(
        input.period,
        input.periodKey,
        input.scope,
        input.scopeKey,
      );
    }),

  getMyRanks: t.procedure
    .input(
      z.object({
        period: periodSchema,
        periodKey: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const clubPlaceId = ctx.userInfo.clubPlaceId;
      let city: string | null = null;

      if (clubPlaceId && clubPlaceId !== HOME_CLUB_ID) {
        const club = await getClubPlaceById(clubPlaceId);
        city = club?.city ?? null;
      }

      return getMemberRanks(
        ctx.userInfo.userId,
        input.period,
        input.periodKey,
        clubPlaceId,
        city,
      );
    }),
});

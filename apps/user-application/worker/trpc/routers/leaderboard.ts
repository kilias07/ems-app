import { t } from "@/worker/trpc/trpc-instance";
import { z } from "zod";
import {
  getLeaderboard,
  getMemberRanks,
} from "@repo/data-ops/queries/leaderboard";
import { getEarliestSessionDate } from "@repo/data-ops/queries/sessions";
import { getClubPlaceById } from "@repo/data-ops/queries/club-places";
import { HOME_CLUB_ID, HOME_CLUB_NAME } from "@repo/data-ops/utils/suit-multipliers";

const periodSchema = z.enum(["all", "yearly", "monthly", "weekly"]);
const scopeSchema = z.enum(["club", "city", "country"]);

export const leaderboardRoutes = t.router({
  getMyClubInfo: t.procedure.query(async ({ ctx }) => {
    const clubPlaceId = ctx.userInfo.clubPlaceId;
    if (!clubPlaceId) return null;
    if (clubPlaceId === HOME_CLUB_ID) {
      return { id: HOME_CLUB_ID, name: HOME_CLUB_NAME, city: ctx.userInfo.city };
    }
    const club = await getClubPlaceById(clubPlaceId);
    if (!club) return null;
    return { id: club.id, name: club.name, city: club.city };
  }),

  getEarliestSessionDate: t.procedure.query(async () => {
    return getEarliestSessionDate();
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

      if (clubPlaceId === HOME_CLUB_ID) {
        city = ctx.userInfo.city;
      } else if (clubPlaceId) {
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

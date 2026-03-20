import { t } from "@/worker/trpc/trpc-instance";
import { z } from "zod";
import {
  getLeaderboard,
  getMemberRank,
} from "@repo/data-ops/queries/leaderboard";

const periodSchema = z.enum(["all", "monthly", "weekly"]);

export const leaderboardRoutes = t.router({
  getLeaderboard: t.procedure
    .input(
      z.object({
        period: periodSchema,
        periodKey: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      return getLeaderboard(input.period, input.periodKey);
    }),

  getMyRank: t.procedure
    .input(
      z.object({
        period: periodSchema,
        periodKey: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return getMemberRank(ctx.userInfo.userId, input.period, input.periodKey);
    }),
});

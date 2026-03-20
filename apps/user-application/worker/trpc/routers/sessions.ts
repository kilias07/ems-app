import { t } from "@/worker/trpc/trpc-instance";
import { z } from "zod";
import {
  getSessionsByMember,
  getMemberStats,
  getWeeklyPointsHistory,
} from "@repo/data-ops/queries/sessions";

export const sessionsRoutes = t.router({
  getMySessions: t.procedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return getSessionsByMember(ctx.userInfo.userId, input);
    }),

  getMyStats: t.procedure.query(async ({ ctx }) => {
    return getMemberStats(ctx.userInfo.userId);
  }),

  getWeeklyHistory: t.procedure.query(async ({ ctx }) => {
    return getWeeklyPointsHistory(ctx.userInfo.userId);
  }),
});

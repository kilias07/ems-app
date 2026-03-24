import { t } from "@/worker/trpc/trpc-instance";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  getSessionsByMember,
  getMemberStats,
  getWeeklyPointsHistory,
  insertSession,
} from "@repo/data-ops/queries/sessions";
import { SUIT_MULTIPLIERS } from "@repo/data-ops/utils/suit-multipliers";

const genId = () => crypto.randomUUID();

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

  logMySession: t.procedure
    .input(
      z.object({
        sessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        rawPoints: z.number().int().positive(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const suitSize = ctx.userInfo.suitSize;
      if (!suitSize) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Please set your suit size in your profile before logging sessions.",
        });
      }
      const correctedPoints = input.rawPoints * SUIT_MULTIPLIERS[suitSize];
      await insertSession({
        id: genId(),
        memberId: ctx.userInfo.userId,
        sessionDate: input.sessionDate,
        suitSize,
        rawPoints: input.rawPoints,
        correctedPoints,
        createdBy: ctx.userInfo.userId,
        notes: input.notes ?? null,
      });
      return { correctedPoints };
    }),
});

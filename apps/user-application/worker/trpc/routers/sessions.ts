import { t, userProcedure } from "@/worker/trpc/trpc-instance";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  getSessionsByMember,
  getMemberStats,
  getWeeklyPointsHistory,
  getMonthlyPointsHistory,
  getDayOfWeekDistribution,
  insertSession,
  resubmitSession,
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

  getMonthlyHistory: t.procedure.query(async ({ ctx }) => {
    return getMonthlyPointsHistory(ctx.userInfo.userId);
  }),

  getDayOfWeekDistribution: t.procedure.query(async ({ ctx }) => {
    return getDayOfWeekDistribution(ctx.userInfo.userId);
  }),

  logMySession: userProcedure
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
          message: "Trener musi najpierw ustawić Twój rozmiar kombinezonu.",
        });
      }
      const correctedPoints = input.rawPoints * SUIT_MULTIPLIERS[suitSize];
      const isTrainerOrAdmin = ctx.userInfo.role === "trainer" || ctx.userInfo.role === "admin";
      await insertSession({
        id: genId(),
        memberId: ctx.userInfo.userId,
        sessionDate: input.sessionDate,
        suitSize,
        rawPoints: input.rawPoints,
        correctedPoints,
        status: isTrainerOrAdmin ? "approved" : "pending",
        createdBy: ctx.userInfo.userId,
        notes: input.notes ?? null,
      });
      return { correctedPoints };
    }),

  resubmitSession: userProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await resubmitSession(input.sessionId, ctx.userInfo.userId);
      return { success: true };
    }),
});

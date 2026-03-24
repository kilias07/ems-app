import { t } from "@/worker/trpc/trpc-instance";
import { z } from "zod";
import {
  getSessionsByMember,
  getMemberStats,
  getWeeklyPointsHistory,
  insertSession,
} from "@repo/data-ops/queries/sessions";
import { SUIT_MULTIPLIERS } from "@repo/data-ops/utils/suit-multipliers";

const genId = () => crypto.randomUUID();
const suitSizeSchema = z.enum(["R0", "R1", "RW2", "R2", "R3", "R4", "R5"]);

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
        suitSize: suitSizeSchema,
        rawPoints: z.number().int().positive(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const correctedPoints = input.rawPoints * SUIT_MULTIPLIERS[input.suitSize];
      await insertSession({
        id: genId(),
        memberId: ctx.userInfo.userId,
        sessionDate: input.sessionDate,
        suitSize: input.suitSize,
        rawPoints: input.rawPoints,
        correctedPoints,
        createdBy: ctx.userInfo.userId,
        notes: input.notes ?? null,
      });
      return { correctedPoints };
    }),
});

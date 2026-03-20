import { adminProcedure, trainerProcedure, t } from "@/worker/trpc/trpc-instance";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
const genId = () => crypto.randomUUID();
import {
  getAllMembers,
  createMemberProfile,
  setMemberActive,
  setMemberRole,
  getMemberByNickname,
} from "@repo/data-ops/queries/members";
import {
  insertSession,
  insertSessionsBatch,
  deleteSession,
  getSessionsByMember,
} from "@repo/data-ops/queries/sessions";
import { SUIT_MULTIPLIERS } from "@repo/data-ops/utils/suit-multipliers";

const suitSizeSchema = z.enum(["R0", "R1", "RW2", "R2", "R3", "R4", "R5"]);

export const adminRoutes = t.router({
  // ── Trainer + Admin ───────────────────────────────────────────────────────

  listMembers: trainerProcedure.query(async () => {
    return getAllMembers();
  }),

  logSession: trainerProcedure
    .input(
      z.object({
        memberId: z.string(),
        sessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        suitSize: suitSizeSchema,
        rawPoints: z.number().int().positive(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const multiplier = SUIT_MULTIPLIERS[input.suitSize];
      const correctedPoints = input.rawPoints * multiplier;

      await insertSession({
        id: genId(),
        memberId: input.memberId,
        sessionDate: input.sessionDate,
        suitSize: input.suitSize,
        rawPoints: input.rawPoints,
        correctedPoints,
        createdBy: ctx.userInfo.userId,
        notes: input.notes ?? null,
      });

      return { correctedPoints };
    }),

  deleteSession: trainerProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input }) => {
      await deleteSession(input.sessionId);
      return { success: true };
    }),

  getMemberSessions: trainerProcedure
    .input(
      z.object({
        memberId: z.string(),
        page: z.number().min(1).default(1),
      }),
    )
    .query(async ({ input }) => {
      return getSessionsByMember(input.memberId, { page: input.page });
    }),

  createMember: trainerProcedure
    .input(z.object({ nickname: z.string().min(2).max(30) }))
    .mutation(async ({ input }) => {
      const existing = await getMemberByNickname(input.nickname);
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Nickname already exists",
        });
      }
      const id = genId();
      await createMemberProfile({ id, nickname: input.nickname, role: "user" });
      return { id };
    }),

  setMemberActive: trainerProcedure
    .input(z.object({ memberId: z.string(), active: z.boolean() }))
    .mutation(async ({ input }) => {
      await setMemberActive(input.memberId, input.active);
      return { success: true };
    }),

  // ── Admin only ────────────────────────────────────────────────────────────

  setMemberRole: adminProcedure
    .input(
      z.object({
        memberId: z.string(),
        role: z.enum(["user", "trainer", "admin"]),
      }),
    )
    .mutation(async ({ input }) => {
      await setMemberRole(input.memberId, input.role);
      return { success: true };
    }),

  bulkImportSessions: adminProcedure
    .input(
      z.array(
        z.object({
          memberId: z.string(),
          sessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
          suitSize: suitSizeSchema,
          rawPoints: z.number().int().positive(),
          notes: z.string().optional(),
        }),
      ),
    )
    .mutation(async ({ ctx, input }) => {
      const rows = input.map((row) => ({
        id: genId(),
        memberId: row.memberId,
        sessionDate: row.sessionDate,
        suitSize: row.suitSize,
        rawPoints: row.rawPoints,
        correctedPoints: row.rawPoints * SUIT_MULTIPLIERS[row.suitSize],
        createdBy: ctx.userInfo.userId,
        notes: row.notes ?? null,
      }));

      await insertSessionsBatch(rows);
      return { inserted: rows.length };
    }),
});

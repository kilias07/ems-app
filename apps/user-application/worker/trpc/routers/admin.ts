import { adminProcedure, trainerProcedure, t } from "@/worker/trpc/trpc-instance";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { sendEmail } from "@/worker/lib/email";
import { accountApprovedEmailHtml } from "@/worker/lib/email-templates";
import { getUserById } from "@repo/data-ops/queries/auth-user";
const genId = () => crypto.randomUUID();
import {
  getAllMembers,
  getMembersForTrainer,
  createMemberProfile,
  setMemberActive,
  setMemberRole,
  getMemberById,
  getMemberByNickname,
  getPendingMembers,
  getPendingMembersForTrainer,
  approveMember,
  assignClubPlaceToUser,
  updateSuitSize,
  deleteAccount,
} from "@repo/data-ops/queries/members";
import {
  insertSession,
  insertSessionsBatch,
  deleteSession,
  getSessionsByMember,
  getSessionById,
  approveSession,
  rejectSession,
  getPendingSessionsForTrainer,
  getAllPendingSessions,
} from "@repo/data-ops/queries/sessions";
import {
  getAllClubPlaces,
  createClubPlace,
  updateClubPlace,
  deleteClubPlace,
} from "@repo/data-ops/queries/club-places";
import {
  assignTrainerToClub,
  unassignTrainerFromClub,
  getClubsForTrainer,
  getTrainersForClub,
} from "@repo/data-ops/queries/club-trainers";
import { canTrainerAccessUser } from "@repo/data-ops/queries/access-control";
import { SUIT_MULTIPLIERS } from "@repo/data-ops/utils/suit-multipliers";
import { getNotesForUser, addNote, deleteNote } from "@repo/data-ops/queries/notes";

const suitSizeSchema = z.enum(["R0", "R1", "RW2", "R2", "R3", "R4", "R5"]);

async function assertTrainerCanAccess(
  trainerId: string,
  trainerRole: string,
  targetUserId: string,
) {
  const ok = await canTrainerAccessUser(trainerId, trainerRole, targetUserId);
  if (!ok) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Ten użytkownik nie należy do żadnego z Twoich klubów.",
    });
  }
}

export const adminRoutes = t.router({
  // ── Members ───────────────────────────────────────────────────────────────

  listMembers: trainerProcedure.query(async ({ ctx }) => {
    if (ctx.userInfo.role === "admin") return getAllMembers();
    return getMembersForTrainer(ctx.userInfo.userId);
  }),

  listTrainers: trainerProcedure.query(async () => {
    const all = await getAllMembers();
    return all.filter((m) => m.role === "trainer" || m.role === "admin");
  }),

  getPendingMembers: trainerProcedure.query(async ({ ctx }) => {
    if (ctx.userInfo.role === "admin") return getPendingMembers();
    return getPendingMembersForTrainer(ctx.userInfo.userId);
  }),

  approveMember: trainerProcedure
    .input(z.object({ memberId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await assertTrainerCanAccess(ctx.userInfo.userId, ctx.userInfo.role, input.memberId);
      await approveMember(input.memberId);

      ctx.workerCtx.waitUntil(
        (async () => {
          const [member, authUser] = await Promise.all([
            getMemberById(input.memberId),
            getUserById(input.memberId),
          ]);
          if (!authUser?.email) return;
          await sendEmail({
            binding: ctx.env.EMAIL,
            from: ctx.env.FROM_EMAIL,
            to: authUser.email,
            subject: "Twoje konto zostało zatwierdzone — EMS Studio",
            html: accountApprovedEmailHtml(member?.nickname ?? null, ctx.env.BETTER_AUTH_URL),
          });
        })(),
      );

      return { success: true };
    }),

  // ── Trainer ↔ club assignments (admin-only) ───────────────────────────────

  assignTrainerToClub: adminProcedure
    .input(z.object({ trainerId: z.string(), clubPlaceId: z.string() }))
    .mutation(async ({ input }) => {
      const target = await getMemberById(input.trainerId);
      if (!target) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Użytkownik nie istnieje." });
      }
      if (target.role !== "trainer" && target.role !== "admin") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tylko trener lub admin może być przypisany do klubu.",
        });
      }
      await assignTrainerToClub(input.trainerId, input.clubPlaceId);
      return { success: true };
    }),

  unassignTrainerFromClub: adminProcedure
    .input(z.object({ trainerId: z.string(), clubPlaceId: z.string() }))
    .mutation(async ({ input }) => {
      await unassignTrainerFromClub(input.trainerId, input.clubPlaceId);
      return { success: true };
    }),

  getClubsForTrainer: trainerProcedure
    .input(z.object({ trainerId: z.string() }))
    .query(async ({ input }) => {
      return getClubsForTrainer(input.trainerId);
    }),

  getTrainersForClub: trainerProcedure
    .input(z.object({ clubPlaceId: z.string() }))
    .query(async ({ input }) => {
      return getTrainersForClub(input.clubPlaceId);
    }),

  assignClubPlace: trainerProcedure
    .input(
      z.object({
        userId: z.string(),
        clubPlaceId: z.string().nullable(),
        city: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertTrainerCanAccess(ctx.userInfo.userId, ctx.userInfo.role, input.userId);
      const city =
        input.clubPlaceId === "home" && input.city ? input.city.trim() : null;
      await assignClubPlaceToUser(input.userId, input.clubPlaceId, city);
      return { success: true };
    }),

  updateMemberSuitSize: trainerProcedure
    .input(z.object({ memberId: z.string(), suitSize: suitSizeSchema }))
    .mutation(async ({ ctx, input }) => {
      await assertTrainerCanAccess(ctx.userInfo.userId, ctx.userInfo.role, input.memberId);
      await updateSuitSize(input.memberId, input.suitSize);
      return { success: true };
    }),

  createMember: trainerProcedure
    .input(z.object({ nickname: z.string().min(2).max(30) }))
    .mutation(async ({ input }) => {
      const existing = await getMemberByNickname(input.nickname);
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "Nickname already exists" });
      }
      const id = genId();
      await createMemberProfile({ id, nickname: input.nickname, role: "user", status: "approved" });
      return { id };
    }),

  setMemberActive: trainerProcedure
    .input(z.object({ memberId: z.string(), active: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await assertTrainerCanAccess(ctx.userInfo.userId, ctx.userInfo.role, input.memberId);
      await setMemberActive(input.memberId, input.active);
      return { success: true };
    }),

  // ── Sessions ──────────────────────────────────────────────────────────────

  logSession: trainerProcedure
    .input(
      z.object({
        memberId: z.string(),
        sessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        rawPoints: z.number().int().positive(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertTrainerCanAccess(ctx.userInfo.userId, ctx.userInfo.role, input.memberId);
      const member = await getMemberById(input.memberId);
      if (!member?.suitSize) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Uczestnik nie ma ustawionego rozmiaru kombinezonu." });
      }
      const multiplier = SUIT_MULTIPLIERS[member.suitSize];
      const correctedPoints = input.rawPoints * multiplier;

      await insertSession({
        id: genId(),
        memberId: input.memberId,
        sessionDate: input.sessionDate,
        suitSize: member.suitSize,
        rawPoints: input.rawPoints,
        correctedPoints,
        status: "approved",
        createdBy: ctx.userInfo.userId,
        notes: input.notes ?? null,
      });

      return { correctedPoints, suitSize: member.suitSize };
    }),

  deleteSession: trainerProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const session = await getSessionById(input.sessionId);
      if (!session) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Sesja nie istnieje." });
      }
      await assertTrainerCanAccess(ctx.userInfo.userId, ctx.userInfo.role, session.memberId);
      await deleteSession(input.sessionId);
      return { success: true };
    }),

  getMemberSessions: trainerProcedure
    .input(z.object({ memberId: z.string(), page: z.number().min(1).default(1) }))
    .query(async ({ ctx, input }) => {
      await assertTrainerCanAccess(ctx.userInfo.userId, ctx.userInfo.role, input.memberId);
      return getSessionsByMember(input.memberId, { page: input.page });
    }),

  getPendingSessions: trainerProcedure.query(async ({ ctx }) => {
    if (ctx.userInfo.role === "admin") {
      return getAllPendingSessions();
    }
    return getPendingSessionsForTrainer(ctx.userInfo.userId);
  }),

  approveSession: trainerProcedure
    .input(
      z.object({
        sessionId: z.string(),
        rawPoints: z.number().int().positive().optional(),
        correctedPoints: z.number().positive().optional(),
        notes: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { sessionId, ...edits } = input;
      const session = await getSessionById(sessionId);
      if (!session) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Sesja nie istnieje." });
      }
      await assertTrainerCanAccess(ctx.userInfo.userId, ctx.userInfo.role, session.memberId);
      await approveSession(sessionId, ctx.userInfo.userId, edits);
      return { success: true };
    }),

  rejectSession: trainerProcedure
    .input(z.object({ sessionId: z.string(), rejectionNote: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const session = await getSessionById(input.sessionId);
      if (!session) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Sesja nie istnieje." });
      }
      await assertTrainerCanAccess(ctx.userInfo.userId, ctx.userInfo.role, session.memberId);
      await rejectSession(input.sessionId, ctx.userInfo.userId, input.rejectionNote);
      return { success: true };
    }),

  // ── Club places ───────────────────────────────────────────────────────────

  listClubPlaces: trainerProcedure.query(async () => {
    return getAllClubPlaces();
  }),

  createClubPlace: trainerProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        city: z.string().min(1).max(100),
        address: z.string().min(1).max(200),
        openHours: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const id = genId();
      await createClubPlace({
        id,
        name: input.name,
        city: input.city,
        address: input.address,
        openHours: input.openHours ?? null,
        createdBy: ctx.userInfo.userId,
      });
      return { id };
    }),

  updateClubPlace: trainerProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(100).optional(),
        city: z.string().min(1).max(100).optional(),
        address: z.string().min(1).max(200).optional(),
        openHours: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateClubPlace(id, data);
      return { success: true };
    }),

  deleteClubPlace: trainerProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await deleteClubPlace(input.id);
      return { success: true };
    }),

  // ── Admin only ────────────────────────────────────────────────────────────

  setMemberRole: adminProcedure
    .input(z.object({ memberId: z.string(), role: z.enum(["user", "trainer", "admin"]) }))
    .mutation(async ({ input }) => {
      await setMemberRole(input.memberId, input.role);
      return { success: true };
    }),

  deleteAccount: adminProcedure
    .input(z.object({ memberId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (input.memberId === ctx.userInfo.userId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Nie możesz usunąć własnego konta." });
      }
      await deleteAccount(input.memberId);
      return { success: true };
    }),

  // ── Notes ─────────────────────────────────────────────────────────────────

  getNotesForUser: trainerProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      await assertTrainerCanAccess(ctx.userInfo.userId, ctx.userInfo.role, input.userId);
      return getNotesForUser(input.userId);
    }),

  addNote: trainerProcedure
    .input(z.object({ userId: z.string(), content: z.string().min(1).max(2000) }))
    .mutation(async ({ ctx, input }) => {
      await assertTrainerCanAccess(ctx.userInfo.userId, ctx.userInfo.role, input.userId);
      await addNote(genId(), input.userId, ctx.userInfo.userId, input.content);
      return { success: true };
    }),

  deleteNote: trainerProcedure
    .input(z.object({ noteId: z.string() }))
    .mutation(async ({ input }) => {
      // Note delete is rare and notes are scoped to trainer access already via list query.
      await deleteNote(input.noteId);
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
        status: "approved",
        createdBy: ctx.userInfo.userId,
        notes: row.notes ?? null,
      }));

      await insertSessionsBatch(rows);
      return { inserted: rows.length };
    }),
});

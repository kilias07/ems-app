import { t } from "@/worker/trpc/trpc-instance";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  updateNickname,
  getMemberByNickname,
  updateSuitSize,
  deleteAccount,
  setMemberActive,
} from "@repo/data-ops/queries/members";
import { getNotesForUser } from "@repo/data-ops/queries/notes";
import { getUserById } from "@repo/data-ops/queries/auth-user";
import { sendEmail } from "@/worker/lib/email";
import { welcomeEmailHtml } from "@/worker/lib/email-templates";

export const profileRoutes = t.router({
  getMyProfile: t.procedure.query(({ ctx }) => {
    return {
      userId: ctx.userInfo.userId,
      role: ctx.userInfo.role,
      status: ctx.userInfo.status,
      nickname: ctx.userInfo.nickname,
      profileComplete: ctx.userInfo.profileComplete,
      avatarUrl: ctx.userInfo.avatarUrl,
      suitSize: ctx.userInfo.suitSize,
    };
  }),

  updateNickname: t.procedure
    .input(
      z.object({
        nickname: z
          .string()
          .min(2)
          .max(30)
          .regex(
            /^[a-z0-9]+(-[a-z0-9]+)*$/,
            "Nickname must be lowercase letters, numbers, and hyphens only",
          ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await getMemberByNickname(input.nickname);
      if (existing && existing.id !== ctx.userInfo.userId) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Nickname already taken",
        });
      }
      await updateNickname(ctx.userInfo.userId, input.nickname);

      ctx.workerCtx.waitUntil(
        getUserById(ctx.userInfo.userId).then((authUser) => {
          if (!authUser?.email) return;
          return sendEmail({
            apiKey: ctx.env.RESEND_API_KEY,
            from: ctx.env.RESEND_FROM_EMAIL,
            to: authUser.email,
            subject: "Witaj w EMS Studio!",
            html: welcomeEmailHtml(input.nickname),
          });
        }),
      );

      return { success: true };
    }),

  updateSuitSize: t.procedure
    .input(z.object({ suitSize: z.enum(["R0", "R1", "RW2", "R2", "R3", "R4", "R5"]) }))
    .mutation(async ({ ctx, input }) => {
      await updateSuitSize(ctx.userInfo.userId, input.suitSize);
      return { success: true };
    }),

  getMyNotes: t.procedure.query(async ({ ctx }) => {
    return getNotesForUser(ctx.userInfo.userId);
  }),

  deleteMyAccount: t.procedure.mutation(async ({ ctx }) => {
    await deleteAccount(ctx.userInfo.userId);
    return { success: true };
  }),

  deactivateMyAccount: t.procedure.mutation(async ({ ctx }) => {
    await setMemberActive(ctx.userInfo.userId, false);
    return { success: true };
  }),
});

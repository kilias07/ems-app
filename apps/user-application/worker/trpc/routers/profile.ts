import { t } from "@/worker/trpc/trpc-instance";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  updateNickname,
  getMemberByNickname,
} from "@repo/data-ops/queries/members";

export const profileRoutes = t.router({
  getMyProfile: t.procedure.query(({ ctx }) => {
    return {
      userId: ctx.userInfo.userId,
      role: ctx.userInfo.role,
      nickname: ctx.userInfo.nickname,
      profileComplete: ctx.userInfo.profileComplete,
      avatarUrl: ctx.userInfo.avatarUrl,
    };
  }),

  updateNickname: t.procedure
    .input(
      z.object({
        nickname: z.string().min(2).max(30).regex(/^\S+$/, "No spaces allowed"),
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
      return { success: true };
    }),
});

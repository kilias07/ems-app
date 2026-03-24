import { t } from "@/worker/trpc/trpc-instance";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  updateNickname,
  updateSuitSize,
  getMemberByNickname,
} from "@repo/data-ops/queries/members";

const suitSizeSchema = z.enum(["R0", "R1", "RW2", "R2", "R3", "R4", "R5"]);

export const profileRoutes = t.router({
  getMyProfile: t.procedure.query(({ ctx }) => {
    return {
      userId: ctx.userInfo.userId,
      role: ctx.userInfo.role,
      nickname: ctx.userInfo.nickname,
      profileComplete: ctx.userInfo.profileComplete,
      avatarUrl: ctx.userInfo.avatarUrl,
      suitSize: ctx.userInfo.suitSize,
    };
  }),

  // Called during initial setup — saves nickname + optional suit size
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
        suitSize: suitSizeSchema.optional(),
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
      await updateNickname(ctx.userInfo.userId, input.nickname, input.suitSize);
      return { success: true };
    }),

  // Called from profile settings to change suit size later
  updateSuitSize: t.procedure
    .input(z.object({ suitSize: suitSizeSchema }))
    .mutation(async ({ ctx, input }) => {
      await updateSuitSize(ctx.userInfo.userId, input.suitSize);
      return { success: true };
    }),
});

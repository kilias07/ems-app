import { t } from "@/worker/trpc/trpc-instance";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  updateNickname,
  getMemberByNickname,
  updateSuitSize,
  deleteAccount,
  setMemberActive,
  setAvatarUrl,
  assignClubPlaceToUser,
} from "@repo/data-ops/queries/members";
import { getAllClubPlaces, getRankingCities } from "@repo/data-ops/queries/club-places";
import { HOME_CLUB_ID } from "@repo/data-ops/utils/suit-multipliers";
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
      clubPlaceId: ctx.userInfo.clubPlaceId,
      city: ctx.userInfo.city,
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
            binding: ctx.env.EMAIL,
            from: ctx.env.FROM_EMAIL,
            to: authUser.email,
            subject: "Witaj w EMS Studio!",
            html: welcomeEmailHtml(input.nickname, ctx.env.BETTER_AUTH_URL),
          });
        }),
      );

      return { success: true };
    }),

  updateSuitSize: t.procedure
    .input(z.object({ suitSize: z.enum(["R0", "R1", "RW2", "R2", "R3", "R4", "R5"]) }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.userInfo.nickname) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Najpierw ustaw pseudonim.",
        });
      }
      await updateSuitSize(ctx.userInfo.userId, input.suitSize);
      return { success: true };
    }),

  listClubPlaces: t.procedure.query(async () => {
    return getAllClubPlaces();
  }),

  listRankingCities: t.procedure.query(async () => {
    return getRankingCities();
  }),

  updateMyClubPlace: t.procedure
    .input(
      z.object({
        clubPlaceId: z.string().nullable(),
        city: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.userInfo.nickname) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Najpierw ustaw pseudonim.",
        });
      }
      // For home users, city is required and used directly.
      // For real-club users, city is derived from clubPlace at query time, so we store NULL.
      if (input.clubPlaceId === HOME_CLUB_ID) {
        if (!input.city || !input.city.trim()) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Wybierz miasto rankingowe dla treningu w domu.",
          });
        }
        await assignClubPlaceToUser(ctx.userInfo.userId, HOME_CLUB_ID, input.city.trim());
      } else {
        await assignClubPlaceToUser(ctx.userInfo.userId, input.clubPlaceId, null);
      }
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

  uploadAvatar: t.procedure
    .input(
      z.object({
        // Data URL like "data:image/jpeg;base64,..." — frontend resizes to ≤256x256 first.
        dataUrl: z.string().startsWith("data:image/").max(500_000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const match = input.dataUrl.match(/^data:(image\/(jpeg|png|webp));base64,(.+)$/);
      if (!match) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Nieobsługiwany format obrazka. Dozwolone: JPEG, PNG, WEBP.",
        });
      }
      const contentType = match[1];
      const ext = match[2] === "jpeg" ? "jpg" : match[2];
      const base64 = match[3];

      // base64 → bytes
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

      if (bytes.byteLength > 350_000) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Obrazek za duży (max 350KB po kompresji).",
        });
      }

      // Cache-busting suffix so browsers refresh after re-upload
      const suffix = Math.random().toString(36).slice(2, 10);
      const key = `users/${ctx.userInfo.userId}-${suffix}.${ext}`;

      await ctx.env.AVATARS.put(key, bytes, {
        httpMetadata: { contentType, cacheControl: "public, max-age=31536000, immutable" },
      });

      const url = `${ctx.env.AVATAR_PUBLIC_URL}/${key}`;
      await setAvatarUrl(ctx.userInfo.userId, url);
      return { url };
    }),

  removeMyAvatar: t.procedure.mutation(async ({ ctx }) => {
    await setAvatarUrl(ctx.userInfo.userId, null);
    return { success: true };
  }),
});

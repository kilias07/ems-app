import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "./context";

export const t = initTRPC.context<Context>().create();

// trainer + admin
export const trainerProcedure = t.procedure.use(async ({ ctx, next }) => {
  const role = ctx.userInfo.role;
  if (role !== "trainer" && role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Trainer access required" });
  }
  return next({ ctx });
});

// admin only
export const adminProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (ctx.userInfo.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

// authenticated user with completed profile (nickname set, profile_complete=1)
export const userProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.userInfo.profileComplete || !ctx.userInfo.nickname) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Najpierw uzupełnij profil (pseudonim).",
    });
  }
  return next({ ctx });
});

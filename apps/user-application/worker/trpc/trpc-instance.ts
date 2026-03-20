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

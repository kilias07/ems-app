import { t } from "@/worker/trpc/trpc-instance";
import { profileRoutes } from "@/worker/trpc/routers/profile";
import { sessionsRoutes } from "@/worker/trpc/routers/sessions";
import { leaderboardRoutes } from "@/worker/trpc/routers/leaderboard";
import { adminRoutes } from "@/worker/trpc/routers/admin";

export const appRouter = t.router({
  profile: profileRoutes,
  sessions: sessionsRoutes,
  leaderboard: leaderboardRoutes,
  admin: adminRoutes,
});

export type AppRouter = typeof appRouter;

import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/worker/trpc/router";

type TRPCOutput = inferRouterOutputs<AppRouter>;
export type LeaderboardEntry = TRPCOutput["leaderboard"]["getLeaderboard"][0];
export type MemberProfile = TRPCOutput["profile"]["getMyProfile"];
export type SessionItem = TRPCOutput["sessions"]["getMySessions"]["data"][0];

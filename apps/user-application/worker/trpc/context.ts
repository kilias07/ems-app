import { getMemberById } from "@repo/data-ops/queries/members";

export async function createContext({
  req,
  env,
  workerCtx,
  userId,
}: {
  req: Request;
  env: ServiceBindings;
  workerCtx: ExecutionContext;
  userId: string;
}) {
  const profile = await getMemberById(userId);

  return {
    req,
    env,
    workerCtx,
    userInfo: {
      userId,
      role: profile?.role ?? "member",
      nickname: profile?.nickname ?? null,
      profileComplete: profile?.profileComplete === 1,
      avatarUrl: profile?.avatarUrl ?? null,
    },
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

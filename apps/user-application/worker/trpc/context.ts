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
      role: profile?.role ?? "user",
      status: profile?.status ?? "pending",
      nickname: profile?.nickname ?? null,
      profileComplete: profile?.profileComplete === 1,
      avatarUrl: profile?.avatarUrl ?? null,
      suitSize: profile?.suitSize ?? null,
      clubPlaceId: profile?.clubPlaceId ?? null,
    },
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "./db/database";
import { account, session, user, verification } from "./drizzle-out/auth-schema";
import { createMemberProfile } from "./queries/members";

let auth: ReturnType<typeof betterAuth>;

export function createBetterAuth(
  database: NonNullable<Parameters<typeof betterAuth>[0]>["database"],
  google?: { clientId: string; clientSecret: string },
): ReturnType<typeof betterAuth> {
  return betterAuth({
    database,
    emailAndPassword: {
      enabled: false,
    },
    socialProviders: {
      google: {
        clientId: google?.clientId ?? "",
        clientSecret: google?.clientSecret ?? "",
      },
    },
    databaseHooks: {
      user: {
        create: {
          after: async (newUser) => {
            await createMemberProfile({
              id: newUser.id,
              avatarUrl: newUser.image ?? null,
            });
          },
        },
      },
    },
  });
}

export function getAuth(
  google: { clientId: string; clientSecret: string },
): ReturnType<typeof betterAuth> {
  if (auth) return auth;

  auth = createBetterAuth(
    drizzleAdapter(getDb(), {
      provider: "sqlite",
      schema: {
        user,
        session,
        account,
        verification,
      },
    }),
    google,
  );
  return auth;
}

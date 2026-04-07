import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "./db/database";
import { account, session, user, verification } from "./drizzle-out/auth-schema";
import { createMemberProfile } from "./queries/members";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let auth: any;

const ADMIN_EMAILS = ["arekjuve@googlemail.com", "kamilkiliasinski@gmail.com"];

export function createBetterAuth(
  database: NonNullable<Parameters<typeof betterAuth>[0]>["database"],
  google?: { clientId: string; clientSecret: string },
) {
  return betterAuth({
    database,
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    socialProviders: {
      google: {
        clientId: google?.clientId ?? "",
        clientSecret: google?.clientSecret ?? "",
      },
    },
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ["google"],
      },
    },
    databaseHooks: {
      user: {
        create: {
          after: async (newUser) => {
            const isAdmin = ADMIN_EMAILS.includes(newUser.email);
            await createMemberProfile({
              id: newUser.id,
              avatarUrl: newUser.image ?? null,
              role: isAdmin ? "admin" : "user",
              status: isAdmin ? "approved" : "pending",
            });
          },
        },
      },
    },
  });
}

export function getAuth(google: { clientId: string; clientSecret: string }) {
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

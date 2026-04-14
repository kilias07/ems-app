import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "./db/database";
import { account, session, user, verification } from "./drizzle-out/auth-schema";
import { createMemberProfile } from "./queries/members";

const ADMIN_EMAILS = ["arekjuve@googlemail.com", "arekjuve@gmail.com", "kamilkiliasinski@gmail.com", "ad@emspro.pl"];

export function createBetterAuth(
  database: NonNullable<Parameters<typeof betterAuth>[0]>["database"],
  google?: { clientId: string; clientSecret: string },
  email?: { apiKey: string; from: string },
) {
  return betterAuth({
    database,
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
    },
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: email
        ? async ({ user, url }: { user: { email: string }; url: string }) => {
            // Replace default callbackURL with /app/pending?verified=1
            const verifyUrl = new URL(url);
            verifyUrl.searchParams.set("callbackURL", "/app/setup-profile?verified=1");
            const finalUrl = verifyUrl.toString();
            console.log(`[auth] Sending verification email to ${user.email}`);
            const res = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${email.apiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                from: email.from,
                to: user.email,
                subject: "Zweryfikuj swój adres e-mail — EMS Studio",
                html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:40px 20px">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:40px;box-shadow:0 1px 4px rgba(0,0,0,.08)">
    <h1 style="margin:0 0 8px;font-size:24px;color:#111">Zweryfikuj swój e-mail</h1>
    <p style="color:#555;margin:0 0 32px;font-size:15px;line-height:1.5">
      Kliknij poniższy przycisk, aby zweryfikować swój adres e-mail i aktywować konto w EMS Studio.
    </p>
    <a href="${finalUrl}"
       style="display:inline-block;background:#18181b;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:15px;font-weight:600">
      Zweryfikuj e-mail
    </a>
    <p style="color:#999;margin:32px 0 0;font-size:13px">
      Jeśli nie rejestrowałeś się w EMS Studio, zignoruj tę wiadomość.
    </p>
  </div>
</body>
</html>`,
              }),
            });
            if (!res.ok) {
              const text = await res.text();
              console.error(`[auth] Resend error ${res.status}: ${text}`);
            } else {
              console.log(`[auth] Verification email sent to ${user.email}`);
            }
          }
        : undefined,
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

export function getAuth(
  google: { clientId: string; clientSecret: string },
  email?: { apiKey: string; from: string },
) {
  return createBetterAuth(
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
    email,
  );
}

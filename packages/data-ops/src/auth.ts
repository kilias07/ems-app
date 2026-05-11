import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "./db/database";
import { account, session, user, verification } from "./drizzle-out/auth-schema";

export const ADMIN_EMAILS = ["kamilkiliasinski@gmail.com", "ad@emspro.pl"];

/**
 * Structural type matching Cloudflare's `send_email` binding (Email Service public beta).
 * Kept here (rather than imported) so this package has no Workers-types dependency.
 */
export type EmailBinding = {
  send: (params: {
    from: string;
    to: string;
    subject: string;
    html: string;
  }) => Promise<unknown>;
};

export function createBetterAuth(
  database: NonNullable<Parameters<typeof betterAuth>[0]>["database"],
  google?: { clientId: string; clientSecret: string },
  email?: { binding: EmailBinding; from: string },
  baseUrl?: string,
) {
  return betterAuth({
    database,
    baseURL: baseUrl,
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      sendResetPassword: email
        ? async ({ user, url }: { user: { email: string }; url: string }) => {
            console.log(`[auth] Sending password reset email to ${user.email}`);
            try {
              await email.binding.send({
                from: email.from,
                to: user.email,
                subject: "Resetowanie hasła — EMS Studio",
                html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:40px 20px">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:40px;box-shadow:0 1px 4px rgba(0,0,0,.08)">
    <h1 style="margin:0 0 8px;font-size:24px;color:#111">Resetowanie hasła</h1>
    <p style="color:#555;margin:0 0 32px;font-size:15px;line-height:1.5">
      Kliknij poniższy przycisk, aby ustawić nowe hasło do swojego konta w EMS Studio.
    </p>
    <a href="${url}"
       style="display:inline-block;background:#18181b;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:15px;font-weight:600">
      Ustaw nowe hasło
    </a>
    <p style="color:#999;margin:32px 0 0;font-size:13px">
      Jeśli nie prosiłeś o reset hasła, zignoruj tę wiadomość.
    </p>
  </div>
</body>
</html>`,
              });
              console.log(`[auth] Password reset email sent to ${user.email}`);
            } catch (err) {
              console.error(`[auth] Reset email error:`, err);
            }
          }
        : undefined,
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
            try {
              await email.binding.send({
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
              });
              console.log(`[auth] Verification email sent to ${user.email}`);
            } catch (err) {
              console.error(`[auth] Verification email error:`, err);
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
  });
}

export function getAuth(
  google: { clientId: string; clientSecret: string },
  email?: { binding: EmailBinding; from: string },
  baseUrl?: string,
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
    baseUrl,
  );
}

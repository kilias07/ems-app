import { createFileRoute, redirect, isRedirect, useSearch } from "@tanstack/react-router";
import { IconBolt, IconCircleCheck } from "@tabler/icons-react";
import { authClient } from "@/components/auth/client";
import { z } from "zod";

const pendingSearchSchema = z.object({
  verified: z.coerce.number().optional(),
});

export const Route = createFileRoute("/app/pending")({
  validateSearch: pendingSearchSchema,
  loader: async ({ context }) => {
    try {
      const profile = await context.queryClient.fetchQuery(
        context.trpc.profile.getMyProfile.queryOptions(),
      );
      if (profile.status === "approved") {
        throw redirect({ to: "/app" });
      }
    } catch (err) {
      if (isRedirect(err)) throw err;
      throw redirect({ to: "/" });
    }
  },
  component: PendingPage,
});

function PendingPage() {
  const { verified } = useSearch({ from: "/app/pending" });

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {verified === 1 && (
          <div className="rounded-lg border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30 px-4 py-3 flex items-center gap-3 text-sm text-green-800 dark:text-green-300">
            <IconCircleCheck className="size-5 shrink-0" />
            <span>E-mail zweryfikowany pomyślnie! Twoje konto zostało utworzone.</span>
          </div>
        )}
        <div className="flex justify-center">
          <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
            <IconBolt className="size-8 text-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Konto oczekuje na akceptację</h1>
          <p className="text-muted-foreground">
            Twoje konto zostało zarejestrowane i oczekuje na weryfikację przez trenera lub
            administratora. Zostaniesz powiadomiony e-mailem, gdy Twoje konto zostanie aktywowane.
          </p>
        </div>
        <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          Jeśli masz pytania, skontaktuj się z trenerem lub administratorem klubu.
        </div>
        <button
          className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          onClick={() => authClient.signOut({ fetchOptions: { onSuccess: () => { window.location.href = "/"; } } })}
        >
          Wyloguj się
        </button>
      </div>
    </div>
  );
}

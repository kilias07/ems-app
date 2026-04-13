import { createFileRoute, redirect, isRedirect } from "@tanstack/react-router";
import { IconBolt } from "@tabler/icons-react";
import { authClient } from "@/components/auth/client";

export const Route = createFileRoute("/app/pending")({
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
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
            <IconBolt className="size-8 text-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Konto oczekuje na akceptację</h1>
          <p className="text-muted-foreground">
            Twój profil został zapisany. Teraz oczekuje na weryfikację przez trenera lub
            administratora. Otrzymasz e-mail, gdy Twoje konto zostanie aktywowane.
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

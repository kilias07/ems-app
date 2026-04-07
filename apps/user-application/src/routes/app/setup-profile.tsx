import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { trpc } from "@/router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { IconBolt } from "@tabler/icons-react";
import { isRedirect } from "@tanstack/react-router";

export const Route = createFileRoute("/app/setup-profile")({
  loader: async ({ context }) => {
    try {
      const profile = await context.queryClient.fetchQuery(
        context.trpc.profile.getMyProfile.queryOptions(),
      );
      if (profile.profileComplete) {
        throw redirect({ to: "/app" });
      }
    } catch (err) {
      if (isRedirect(err)) throw err;
      throw redirect({ to: "/" });
    }
  },
  component: SetupProfilePage,
});

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
}

function SetupProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [raw, setRaw] = useState("");
  const [error, setError] = useState("");

  const nickname = slugify(raw);

  const updateNickname = useMutation(
    trpc.profile.updateNickname.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.profile.getMyProfile.queryKey(),
        });
        toast.success("Profil ustawiony! Witaj w EMS Studio.");
        router.navigate({ to: "/app" });
      },
      onError: (err) => {
        setError(err.message);
      },
    }),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    updateNickname.mutate({ nickname });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Toaster />
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center">
            <IconBolt className="size-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Uzupełnij profil</CardTitle>
          <CardDescription>
            Ustaw pseudonim, aby ukończyć rejestrację. Po akceptacji przez trenera uzyskasz pełny dostęp.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nickname */}
            <div className="space-y-2">
              <Label htmlFor="nickname">Pseudonim</Label>
              <Input
                id="nickname"
                placeholder="np. Żelazny Marek, Flash Kamil"
                value={raw}
                onChange={(e) => {
                  setRaw(e.target.value);
                  setError("");
                }}
                maxLength={40}
                required
                autoFocus
              />
              {raw !== nickname && nickname.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Zostanie zapisane jako:{" "}
                  <span className="font-medium text-foreground">{nickname}</span>
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Tylko litery, cyfry i myślniki. Spacje zamieniają się w myślniki.
              </p>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              type="submit"
              className="w-full"
              disabled={updateNickname.isPending || nickname.length < 2 || nickname.length > 30}
            >
              {updateNickname.isPending ? "Zapisywanie…" : "Przejdź do panelu"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

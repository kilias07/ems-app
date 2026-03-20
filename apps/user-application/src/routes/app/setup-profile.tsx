import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { trpc } from "@/router";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
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

function SetupProfilePage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");

  const updateNickname = useMutation(
    trpc.profile.updateNickname.mutationOptions({
      onSuccess: () => {
        toast.success("Profile set up! Welcome to EMS Studio.");
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
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center">
            <IconBolt className="size-10 text-yellow-400" />
          </div>
          <CardTitle className="text-2xl">Set Your Nickname</CardTitle>
          <CardDescription>
            Choose a unique nickname that will appear on the leaderboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="e.g. IronMike, FlashKamil"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                minLength={2}
                maxLength={30}
                required
                autoFocus
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <p className="text-xs text-muted-foreground">
                2–30 characters, no spaces.
              </p>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={updateNickname.isPending || nickname.length < 2}
            >
              {updateNickname.isPending ? "Saving…" : "Continue to Dashboard"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

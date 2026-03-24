import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { trpc } from "@/router";
import { useMutation } from "@tanstack/react-query";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { IconBolt } from "@tabler/icons-react";
import { isRedirect } from "@tanstack/react-router";
import { SUIT_MULTIPLIERS, SUIT_SIZES } from "@repo/data-ops/utils/suit-multipliers";

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
  const [raw, setRaw] = useState("");
  const [suitSize, setSuitSize] = useState("");
  const [error, setError] = useState("");

  const nickname = slugify(raw);

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
    updateNickname.mutate({
      nickname,
      suitSize: (suitSize as any) || undefined,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Toaster />
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center">
            <IconBolt className="size-10 text-yellow-400" />
          </div>
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>
            Set your nickname and suit size to get started on the leaderboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nickname */}
            <div className="space-y-2">
              <Label htmlFor="nickname">Nickname</Label>
              <Input
                id="nickname"
                placeholder="e.g. Iron Mike, Flash Kamil"
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
                  Will be saved as:{" "}
                  <span className="font-medium text-foreground">{nickname}</span>
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Letters, numbers, and hyphens only. Spaces become hyphens.
              </p>
            </div>

            {/* Suit size */}
            <div className="space-y-2">
              <Label htmlFor="suit-size">EMS Suit Size</Label>
              <Select value={suitSize} onValueChange={setSuitSize}>
                <SelectTrigger id="suit-size">
                  <SelectValue placeholder="Select your suit size…" />
                </SelectTrigger>
                <SelectContent>
                  {SUIT_SIZES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                      <span className="ml-2 text-muted-foreground text-xs">
                        ×{SUIT_MULTIPLIERS[s]} multiplier
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Your suit size determines the point multiplier. You can change
                this later in your profile.
              </p>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              type="submit"
              className="w-full"
              disabled={updateNickname.isPending || nickname.length < 2 || nickname.length > 30}
            >
              {updateNickname.isPending ? "Saving…" : "Continue to Dashboard"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

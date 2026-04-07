import { createFileRoute } from "@tanstack/react-router";
import { trpc } from "@/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { SUIT_MULTIPLIERS, SUIT_SIZES } from "@repo/data-ops/utils/suit-multipliers";

export const Route = createFileRoute("/app/_authed/settings")({
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery(
      context.trpc.profile.getMyProfile.queryOptions(),
    );
  },
  component: SettingsPage,
});

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
}

function SettingsPage() {
  const queryClient = useQueryClient();
  const { data: profile } = useQuery(trpc.profile.getMyProfile.queryOptions());

  // ── Nickname ──────────────────────────────────────────────────────────────
  const [rawNickname, setRawNickname] = useState("");
  const [nicknameError, setNicknameError] = useState("");
  const nickname = slugify(rawNickname);
  const nicknameChanged = nickname.length >= 2 && nickname !== profile?.nickname;

  // ── Suit size ─────────────────────────────────────────────────────────────
  const [suitSize, setSuitSize] = useState("");

  const updateSuit = useMutation(
    trpc.profile.updateSuitSize.mutationOptions({
      onSuccess: () => {
        toast.success("Rozmiar kombinezonu zaktualizowany.");
        setSuitSize("");
        queryClient.invalidateQueries({ queryKey: trpc.profile.getMyProfile.queryKey() });
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  const updateNickname = useMutation(
    trpc.profile.updateNickname.mutationOptions({
      onSuccess: () => {
        toast.success("Pseudonim zaktualizowany.");
        setRawNickname("");
        setNicknameError("");
        queryClient.invalidateQueries({
          queryKey: trpc.profile.getMyProfile.queryKey(),
        });
      },
      onError: (err) => setNicknameError(err.message),
    }),
  );

  return (
    <div className="flex flex-col gap-8 p-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ustawienia konta</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Zarządzaj swoim profilem i preferencjami EMS.
        </p>
      </div>

      {/* Current profile summary */}
      <div className="rounded-lg border bg-muted/40 px-4 py-3 flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{profile?.nickname}</p>
          <p className="text-xs text-muted-foreground capitalize">{profile?.role}</p>
        </div>
        {profile?.suitSize && (
          <Badge variant="secondary" className="font-mono shrink-0">
            Kombinezon {profile.suitSize} &times;{SUIT_MULTIPLIERS[profile.suitSize as keyof typeof SUIT_MULTIPLIERS]}
          </Badge>
        )}
      </div>

      <Separator />

      {/* Nickname */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold">Pseudonim</h2>
          <p className="text-sm text-muted-foreground">
            To jest Twoja publiczna nazwa w rankingu.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="nickname">Nowy pseudonim</Label>
          <Input
            id="nickname"
            placeholder={profile?.nickname ?? "Wpisz nowy pseudonim"}
            value={rawNickname}
            onChange={(e) => {
              setRawNickname(e.target.value);
              setNicknameError("");
            }}
            maxLength={40}
          />
          {rawNickname !== nickname && nickname.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Zostanie zapisane jako:{" "}
              <span className="font-medium text-foreground">{nickname}</span>
            </p>
          )}
          {nicknameError && (
            <p className="text-sm text-destructive">{nicknameError}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Tylko litery, cyfry i myślniki. Spacje zamieniają się w myślniki.
          </p>
        </div>
        <Button
          disabled={!nicknameChanged || nickname.length > 30 || updateNickname.isPending}
          onClick={() => updateNickname.mutate({ nickname })}
        >
          {updateNickname.isPending ? "Zapisywanie…" : "Zaktualizuj pseudonim"}
        </Button>
      </section>

      <Separator />

      {/* Suit size */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold">Rozmiar kombinezonu EMS</h2>
          <p className="text-sm text-muted-foreground">
            Wybierz swój rozmiar kombinezonu. Wpływa on na mnożnik punktów w każdej sesji.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="suit-size">Rozmiar kombinezonu</Label>
          <Select value={suitSize || profile?.suitSize || ""} onValueChange={setSuitSize}>
            <SelectTrigger id="suit-size" className="w-52">
              <SelectValue placeholder="Wybierz rozmiar…" />
            </SelectTrigger>
            <SelectContent>
              {SUIT_SIZES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                  <span className="ml-2 text-muted-foreground text-xs">
                    &times;{SUIT_MULTIPLIERS[s]} mnożnik
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          disabled={!suitSize || suitSize === profile?.suitSize || updateSuit.isPending}
          onClick={() => updateSuit.mutate({ suitSize: suitSize as any })}
        >
          {updateSuit.isPending ? "Zapisywanie…" : "Zaktualizuj rozmiar"}
        </Button>
      </section>
    </div>
  );
}

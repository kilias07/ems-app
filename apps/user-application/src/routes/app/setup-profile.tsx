import { createFileRoute, redirect, useRouter, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { trpc } from "@/router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { IconBolt, IconCircleCheck } from "@tabler/icons-react";
import { isRedirect } from "@tanstack/react-router";
import { SUIT_MULTIPLIERS, SUIT_SIZES } from "@repo/data-ops/utils/suit-multipliers";
import { z } from "zod";

const HOME_CLUB_ID = "home";
const HOME_CLUB_NAME = "Trening w domu";

const searchSchema = z.object({
  verified: z.coerce.number().optional(),
});

export const Route = createFileRoute("/app/setup-profile")({
  validateSearch: searchSchema,
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
    .replace(/ł/g, "l")
    .replace(/Ł/g, "L")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
}

function SetupProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { verified } = useSearch({ from: "/app/setup-profile" });

  const [raw, setRaw] = useState("");
  const [suitSize, setSuitSize] = useState("");
  const [clubPlaceId, setClubPlaceId] = useState("");
  const [homeCity, setHomeCity] = useState("");
  const [error, setError] = useState("");

  const nickname = slugify(raw);

  const { data: clubPlaces } = useQuery(trpc.profile.listClubPlaces.queryOptions());
  const { data: rankingCities } = useQuery(trpc.profile.listRankingCities.queryOptions());

  const updateNickname = useMutation(
    trpc.profile.updateNickname.mutationOptions(),
  );
  const updateSuit = useMutation(
    trpc.profile.updateSuitSize.mutationOptions(),
  );
  const updateClub = useMutation(
    trpc.profile.updateMyClubPlace.mutationOptions(),
  );

  const isPending = updateNickname.isPending || updateSuit.isPending || updateClub.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await updateNickname.mutateAsync({ nickname });

      const promises = [];
      if (suitSize) {
        promises.push(updateSuit.mutateAsync({ suitSize: suitSize as any }));
      }
      if (clubPlaceId) {
        if (clubPlaceId === HOME_CLUB_ID && !homeCity) {
          setError("Wybierz najbliższe miasto rankingowe dla treningu w domu.");
          return;
        }
        promises.push(
          updateClub.mutateAsync({
            clubPlaceId,
            city: clubPlaceId === HOME_CLUB_ID ? homeCity : null,
          }),
        );
      }
      if (promises.length > 0) {
        await Promise.all(promises);
      }

      const profile = await queryClient.fetchQuery({
        ...trpc.profile.getMyProfile.queryOptions(),
        staleTime: 0,
      });

      if (profile.status === "pending") {
        router.navigate({ to: "/app/pending" });
      } else {
        router.navigate({ to: "/app" });
      }
    } catch (err: any) {
      setError(err?.message ?? "Wystąpił błąd. Spróbuj ponownie.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          {verified === 1 && (
            <div className="rounded-lg border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30 px-4 py-3 flex items-center gap-3 text-sm text-green-800 dark:text-green-300 text-left mb-2">
              <IconCircleCheck className="size-5 shrink-0" />
              <span>E-mail zweryfikowany pomyślnie! Twoje konto zostało utworzone.</span>
            </div>
          )}
          <div className="flex justify-center">
            <IconBolt className="size-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Uzupełnij profil</CardTitle>
          <CardDescription>
            Ustaw swoje dane, aby dokończyć rejestrację. Po zapisaniu Twoje konto zostanie przesłane do akceptacji przez trenera.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nickname */}
            <div className="space-y-2">
              <Label htmlFor="nickname">
                Pseudonim <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nickname"
                placeholder="np. zelazny-marek"
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
              {raw.trim().length > 0 && nickname.length < 2 && (
                <p className="text-sm text-destructive">
                  Pseudonim musi mieć min. 2 znaki (litery łacińskie lub cyfry, polskie znaki dozwolone — zostaną zamienione).
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Twoja publiczna nazwa w rankingu. Tylko litery, cyfry i myślniki.
              </p>
            </div>

            {/* Suit size */}
            <div className="space-y-2">
              <Label htmlFor="suit-size">Rozmiar kombinezonu</Label>
              <Select value={suitSize} onValueChange={setSuitSize}>
                <SelectTrigger id="suit-size">
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
              <p className="text-xs text-muted-foreground">
                Wpływa na mnożnik punktów. Możesz zmienić później w ustawieniach.
              </p>
            </div>

            {/* Club */}
            <div className="space-y-2">
              <Label htmlFor="club-place">Klub</Label>
              <Select value={clubPlaceId} onValueChange={setClubPlaceId}>
                <SelectTrigger id="club-place">
                  <SelectValue placeholder="Wybierz klub…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={HOME_CLUB_ID}>{HOME_CLUB_NAME}</SelectItem>
                  {clubPlaces?.map((cp) => (
                    <SelectItem key={cp.id} value={cp.id}>
                      {cp.name}
                      <span className="ml-2 text-muted-foreground text-xs">
                        {cp.city}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Wpływa na ranking klubowy i miejski. Możesz zmienić później.
              </p>
            </div>

            {/* Home city — only when training at home */}
            {clubPlaceId === HOME_CLUB_ID && (
              <div className="space-y-2">
                <Label htmlFor="home-city">
                  Najbliższe miasto rankingowe <span className="text-destructive">*</span>
                </Label>
                <Select value={homeCity} onValueChange={setHomeCity}>
                  <SelectTrigger id="home-city">
                    <SelectValue placeholder="Wybierz miasto…" />
                  </SelectTrigger>
                  <SelectContent>
                    {rankingCities?.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Trenujesz w domu — wybierz miasto, w którego rankingu chcesz brać udział.
                </p>
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              type="submit"
              className="w-full"
              disabled={isPending || nickname.length < 2 || nickname.length > 30}
            >
              {isPending ? "Zapisywanie…" : "Zapisz i kontynuuj"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

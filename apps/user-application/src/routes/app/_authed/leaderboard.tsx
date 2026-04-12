import { createFileRoute } from "@tanstack/react-router";
import { trpc } from "@/router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

function getCurrentMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getCurrentWeekKey() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  return monday.toISOString().slice(0, 10);
}

type Period = "all" | "monthly" | "weekly";
type Scope = "club" | "city" | "country";

function LeaderboardTable({
  period,
  periodKey,
  scope,
  scopeKey,
}: {
  period: Period;
  periodKey?: string;
  scope: Scope;
  scopeKey?: string | null;
}) {
  const { data: board } = useSuspenseQuery({
    ...trpc.leaderboard.getLeaderboard.queryOptions({
      period,
      periodKey,
      scope,
      scopeKey,
    }),
    staleTime: 5 * 60 * 1000,
  });
  const { data: myProfile } = useSuspenseQuery({
    ...trpc.profile.getMyProfile.queryOptions(),
    staleTime: 5 * 60 * 1000,
  });

  const trophy = ["🥇", "🥈", "🥉"];

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Miejsce</TableHead>
            <TableHead>Uczestnik</TableHead>
            <TableHead className="text-right">Sesje</TableHead>
            <TableHead className="text-right">Łączne punkty</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {board.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                Brak danych dla tego okresu.
              </TableCell>
            </TableRow>
          ) : (
            board.map((entry) => {
              const isMe = entry.memberId === myProfile.userId;
              return (
                <TableRow
                  key={entry.memberId}
                  className={isMe ? "bg-primary/5 font-semibold" : ""}
                >
                  <TableCell className="text-center text-lg">
                    {entry.rank <= 3 ? trophy[entry.rank - 1] : entry.rank}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        {entry.avatarUrl && (
                          <AvatarImage src={entry.avatarUrl} alt={entry.nickname} />
                        )}
                        <AvatarFallback className="text-xs">
                          {entry.nickname.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{entry.nickname}</span>
                      {isMe && (
                        <Badge variant="outline" className="text-xs">
                          Ty
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{entry.sessions}</TableCell>
                  <TableCell className="text-right font-mono">
                    {entry.totalScore.toFixed(1)}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export const Route = createFileRoute("/app/_authed/leaderboard")({
  loader: async ({ context }) => {
    const monthKey = getCurrentMonthKey();
    const weekKey = getCurrentWeekKey();
    await Promise.all([
      context.queryClient.prefetchQuery(
        context.trpc.leaderboard.getLeaderboard.queryOptions({
          period: "all",
          scope: "country",
        }),
      ),
      context.queryClient.prefetchQuery(
        context.trpc.leaderboard.getLeaderboard.queryOptions({
          period: "monthly",
          periodKey: monthKey,
          scope: "country",
        }),
      ),
      context.queryClient.prefetchQuery(
        context.trpc.leaderboard.getLeaderboard.queryOptions({
          period: "weekly",
          periodKey: weekKey,
          scope: "country",
        }),
      ),
      context.queryClient.prefetchQuery(
        context.trpc.profile.getMyProfile.queryOptions(),
      ),
    ]);
  },
  component: LeaderboardPage,
});

function LeaderboardPage() {
  const [period, setPeriod] = useState<Period>("all");
  const [scope, setScope] = useState<Scope>("club");

  const { data: profile } = useSuspenseQuery({
    ...trpc.profile.getMyProfile.queryOptions(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: clubPlaces } = useSuspenseQuery({
    ...trpc.leaderboard.getMyClubInfo.queryOptions(),
    staleTime: 5 * 60 * 1000,
  });

  const periodKey =
    period === "monthly"
      ? getCurrentMonthKey()
      : period === "weekly"
        ? getCurrentWeekKey()
        : undefined;

  const scopeKey =
    scope === "club"
      ? profile.clubPlaceId
      : scope === "city"
        ? clubPlaces?.city
        : undefined;

  const noClub = !profile.clubPlaceId;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Ranking</h1>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={scope} onValueChange={(v) => setScope(v as Scope)}>
          <TabsList>
            <TabsTrigger value="club" disabled={noClub}>
              Klub
            </TabsTrigger>
            <TabsTrigger value="city" disabled={noClub}>
              Miasto
            </TabsTrigger>
            <TabsTrigger value="country">Kraj</TabsTrigger>
          </TabsList>
        </Tabs>

        <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <TabsList>
            <TabsTrigger value="all">Wszystkie czasy</TabsTrigger>
            <TabsTrigger value="monthly">Ten miesiąc</TabsTrigger>
            <TabsTrigger value="weekly">Ten tydzień</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {noClub && scope !== "country" ? (
        <div className="rounded-md border p-8 text-center text-muted-foreground">
          Nie jesteś przypisany do żadnego klubu. Skontaktuj się z trenerem.
        </div>
      ) : (
        <LeaderboardTable
          period={period}
          periodKey={periodKey}
          scope={scope}
          scopeKey={scopeKey}
        />
      )}
    </div>
  );
}

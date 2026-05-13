import { createFileRoute } from "@tanstack/react-router";
import { trpc } from "@/router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Skeleton } from "@/components/ui/skeleton";

const MONTH_NAMES_PL = [
  "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec",
  "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień",
];

const MONTH_GENITIVE_PL = [
  "stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca",
  "lipca", "sierpnia", "września", "października", "listopada", "grudnia",
];

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function ymd(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function getCurrentMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}

function getCurrentYearKey() {
  return String(new Date().getFullYear());
}

function mondayOf(d: Date): Date {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.getFullYear(), d.getMonth(), diff);
  return monday;
}

function getCurrentWeekKey() {
  return ymd(mondayOf(new Date()));
}

function getMonthOptions(earliestDate: string, today: Date) {
  const [ey, em] = earliestDate.split("-").map(Number);
  const startY = ey;
  const startM = em - 1;
  const endY = today.getFullYear();
  const endM = today.getMonth();
  const options: { value: string; label: string }[] = [];
  for (let y = endY; y >= startY; y--) {
    const monthStart = y === endY ? endM : 11;
    const monthEnd = y === startY ? startM : 0;
    for (let m = monthStart; m >= monthEnd; m--) {
      options.push({
        value: `${y}-${pad2(m + 1)}`,
        label: `${MONTH_NAMES_PL[m]} ${y}`,
      });
    }
  }
  return options;
}

function getYearOptions(earliestDate: string, today: Date) {
  const startY = Number(earliestDate.slice(0, 4));
  const endY = today.getFullYear();
  const options: { value: string; label: string }[] = [];
  for (let y = endY; y >= startY; y--) {
    options.push({ value: String(y), label: String(y) });
  }
  return options;
}

function getWeekOptions(earliestDate: string, today: Date) {
  const earliestMonday = mondayOf(new Date(earliestDate));
  const currentMonday = mondayOf(today);
  const options: { value: string; label: string }[] = [];
  let cursor = new Date(currentMonday);
  while (cursor >= earliestMonday) {
    const sunday = new Date(cursor);
    sunday.setDate(sunday.getDate() + 6);
    const mDay = cursor.getDate();
    const mMonthIdx = cursor.getMonth();
    const sDay = sunday.getDate();
    const sMonthIdx = sunday.getMonth();
    const sYear = sunday.getFullYear();
    let label: string;
    if (mMonthIdx === sMonthIdx && cursor.getFullYear() === sYear) {
      label = `${mDay}–${sDay} ${MONTH_GENITIVE_PL[mMonthIdx]} ${sYear}`;
    } else if (cursor.getFullYear() === sYear) {
      label = `${mDay} ${MONTH_GENITIVE_PL[mMonthIdx]} – ${sDay} ${MONTH_GENITIVE_PL[sMonthIdx]} ${sYear}`;
    } else {
      label = `${mDay} ${MONTH_GENITIVE_PL[mMonthIdx]} ${cursor.getFullYear()} – ${sDay} ${MONTH_GENITIVE_PL[sMonthIdx]} ${sYear}`;
    }
    options.push({ value: ymd(cursor), label });
    cursor.setDate(cursor.getDate() - 7);
  }
  return options;
}

function defaultKeyForPeriod(period: Period): string | undefined {
  if (period === "weekly") return getCurrentWeekKey();
  if (period === "monthly") return getCurrentMonthKey();
  if (period === "yearly") return getCurrentYearKey();
  return undefined;
}

type Period = "all" | "yearly" | "monthly" | "weekly";
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

  const showClub = scope === "city";
  const showCity = scope === "country";
  const colSpan = 4 + (showClub || showCity ? 1 : 0);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Miejsce</TableHead>
            <TableHead>Uczestnik</TableHead>
            {showClub && <TableHead>Klub</TableHead>}
            {showCity && <TableHead>Miasto</TableHead>}
            <TableHead className="text-right">Sesje</TableHead>
            <TableHead className="text-right">Łączne punkty</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {board.length === 0 ? (
            <TableRow>
              <TableCell colSpan={colSpan} className="text-center h-24 text-muted-foreground">
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
                  {showClub && (
                    <TableCell className="text-muted-foreground text-sm">
                      {entry.clubName ?? "—"}
                    </TableCell>
                  )}
                  {showCity && (
                    <TableCell className="text-muted-foreground text-sm">
                      {entry.cityName ?? "—"}
                    </TableCell>
                  )}
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

function LeaderboardTableSkeleton({ scope }: { scope: Scope }) {
  const showClub = scope === "city";
  const showCity = scope === "country";

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Miejsce</TableHead>
            <TableHead>Uczestnik</TableHead>
            {showClub && <TableHead>Klub</TableHead>}
            {showCity && <TableHead>Miasto</TableHead>}
            <TableHead className="text-right">Sesje</TableHead>
            <TableHead className="text-right">Łączne punkty</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 8 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-5 w-6 mx-auto" />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Skeleton className="size-8 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </TableCell>
              {showClub && (
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
              )}
              {showCity && (
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
              )}
              <TableCell className="text-right">
                <Skeleton className="h-4 w-8 ml-auto" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="h-4 w-16 ml-auto" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export const Route = createFileRoute("/app/_authed/leaderboard")({
  loader: async ({ context }) => {
    const monthKey = getCurrentMonthKey();
    const weekKey = getCurrentWeekKey();
    const yearKey = getCurrentYearKey();
    await Promise.all([
      context.queryClient.prefetchQuery(
        context.trpc.leaderboard.getLeaderboard.queryOptions({
          period: "all",
          scope: "country",
        }),
      ),
      context.queryClient.prefetchQuery(
        context.trpc.leaderboard.getLeaderboard.queryOptions({
          period: "yearly",
          periodKey: yearKey,
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
      context.queryClient.prefetchQuery(
        context.trpc.leaderboard.getMyClubInfo.queryOptions(),
      ),
      context.queryClient.prefetchQuery(
        context.trpc.leaderboard.getEarliestSessionDate.queryOptions(),
      ),
    ]);
  },
  component: LeaderboardPage,
});

function LeaderboardPage() {
  const [period, setPeriod] = useState<Period>("all");
  const [periodKey, setPeriodKey] = useState<string | undefined>(undefined);

  const { data: profile } = useSuspenseQuery({
    ...trpc.profile.getMyProfile.queryOptions(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: clubPlaces } = useSuspenseQuery({
    ...trpc.leaderboard.getMyClubInfo.queryOptions(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: earliestDate } = useSuspenseQuery({
    ...trpc.leaderboard.getEarliestSessionDate.queryOptions(),
    staleTime: 60 * 60 * 1000,
  });

  const initialScope: Scope = !profile.clubPlaceId
    ? "country"
    : profile.clubPlaceId === "home"
      ? "city"
      : "club";
  const [scope, setScope] = useState<Scope>(initialScope);

  const today = useMemo(() => new Date(), []);
  const lowerBound = earliestDate ?? ymd(today);

  const periodOptions = useMemo(() => {
    if (period === "weekly") return getWeekOptions(lowerBound, today);
    if (period === "monthly") return getMonthOptions(lowerBound, today);
    if (period === "yearly") return getYearOptions(lowerBound, today);
    return [];
  }, [period, lowerBound, today]);

  const handlePeriodChange = (value: string) => {
    const next = value as Period;
    setPeriod(next);
    setPeriodKey(defaultKeyForPeriod(next));
  };

  const scopeKey =
    scope === "club"
      ? profile.clubPlaceId
      : scope === "city"
        ? clubPlaces?.city
        : undefined;

  const noClub = !profile.clubPlaceId;
  const isHome = profile.clubPlaceId === "home";
  const noCity = !clubPlaces?.city;

  const showPeriodSelect = period !== "all" && periodOptions.length > 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Ranking</h1>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={scope} onValueChange={(v) => setScope(v as Scope)}>
          <TabsList>
            <TabsTrigger value="club" disabled={noClub || isHome}>
              Klub
            </TabsTrigger>
            <TabsTrigger value="city" disabled={noClub || noCity}>
              Miasto
            </TabsTrigger>
            <TabsTrigger value="country">Kraj</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Tabs value={period} onValueChange={handlePeriodChange}>
            <TabsList>
              <TabsTrigger value="weekly">Tydzień</TabsTrigger>
              <TabsTrigger value="monthly">Miesiąc</TabsTrigger>
              <TabsTrigger value="yearly">Rok</TabsTrigger>
              <TabsTrigger value="all">Wszystkie</TabsTrigger>
            </TabsList>
          </Tabs>

          {showPeriodSelect && (
            <Select
              value={periodKey}
              onValueChange={(v) => setPeriodKey(v)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periodOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {noClub && scope !== "country" ? (
        <div className="rounded-md border p-8 text-center text-muted-foreground">
          Nie jesteś przypisany do żadnego klubu. Skontaktuj się z trenerem.
        </div>
      ) : (
        <Suspense fallback={<LeaderboardTableSkeleton scope={scope} />}>
          <LeaderboardTable
            period={period}
            periodKey={periodKey}
            scope={scope}
            scopeKey={scopeKey}
          />
        </Suspense>
      )}
    </div>
  );
}

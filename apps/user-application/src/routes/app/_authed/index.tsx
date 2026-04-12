import { createFileRoute } from "@tanstack/react-router";
import { trpc } from "@/router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  IconBolt,
  IconTrophy,
  IconCalendar,
  IconFlame,
  IconChartBar,
  IconBuildingCommunity,
  IconMapPin,
  IconFlag,
} from "@tabler/icons-react";

export const Route = createFileRoute("/app/_authed/")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.prefetchQuery(
        context.trpc.sessions.getMyStats.queryOptions(),
      ),
      context.queryClient.prefetchQuery(
        context.trpc.sessions.getWeeklyHistory.queryOptions(),
      ),
      context.queryClient.prefetchQuery(
        context.trpc.leaderboard.getMyRanks.queryOptions({ period: "all" }),
      ),
      context.queryClient.prefetchQuery(
        context.trpc.profile.getMyProfile.queryOptions(),
      ),
      context.queryClient.prefetchQuery(
        context.trpc.leaderboard.getMyClubInfo.queryOptions(),
      ),
    ]);
  },
  component: DashboardPage,
});

function DashboardPage() {
  const { data: stats } = useSuspenseQuery(
    trpc.sessions.getMyStats.queryOptions(),
  );
  const { data: weeklyHistory } = useSuspenseQuery(
    trpc.sessions.getWeeklyHistory.queryOptions(),
  );
  const { data: myRanks } = useSuspenseQuery(
    trpc.leaderboard.getMyRanks.queryOptions({ period: "all" }),
  );
  const { data: profile } = useSuspenseQuery(
    trpc.profile.getMyProfile.queryOptions(),
  );
  const { data: clubInfo } = useSuspenseQuery(
    trpc.leaderboard.getMyClubInfo.queryOptions(),
  );

  const maxPoints = Math.max(...weeklyHistory.map((w) => w.points), 1);

  const statCards = [
    {
      title: "Wszystkie sesje",
      value: stats.totalSessions,
      description: "Łącznie",
      icon: IconCalendar,
      iconClass: "text-muted-foreground",
    },
    {
      title: "Łączne punkty",
      value: stats.totalPoints.toFixed(0),
      description: "Punkty skorygowane",
      icon: IconBolt,
      iconClass: "text-primary",
      suffix: "pkt",
    },
    {
      title: "Ten tydzień",
      value: stats.weekSessions,
      description: `${stats.weekPoints.toFixed(0)} pkt`,
      icon: IconFlame,
      iconClass: "text-orange-500",
      suffix: "sesje",
    },
    {
      title: "Ten miesiąc",
      value: stats.monthSessions,
      description: `${stats.monthPoints.toFixed(0)} pkt`,
      icon: IconTrophy,
      iconClass: "text-blue-500",
      suffix: "sesje",
    },
  ];

  const rankBadges = [
    {
      label: "Klub",
      rank: myRanks.clubRank?.rank,
      icon: IconBuildingCommunity,
      detail: clubInfo?.name,
    },
    {
      label: "Miasto",
      rank: myRanks.cityRank?.rank,
      icon: IconMapPin,
      detail: clubInfo?.city,
    },
    {
      label: "Kraj",
      rank: myRanks.countryRank?.rank,
      icon: IconFlag,
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Witaj ponownie, {profile.nickname}
          </h1>
          <p className="text-sm text-muted-foreground">
            Oto przegląd Twoich treningów EMS.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {rankBadges.map(
            (badge) =>
              badge.rank != null && (
                <Badge
                  key={badge.label}
                  variant="outline"
                  className="gap-1.5 px-3 py-1.5 text-sm"
                >
                  <badge.icon className="size-4 text-primary" />
                  {badge.label} #{badge.rank}
                  {badge.detail && (
                    <span className="text-muted-foreground">
                      ({badge.detail})
                    </span>
                  )}
                </Badge>
              ),
          )}
        </div>
      </div>

      <Separator />

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className={`size-4 ${card.iconClass}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {card.value}
                {card.suffix && (
                  <span className="ml-1 text-sm font-normal text-muted-foreground">
                    {card.suffix}
                  </span>
                )}
              </div>
              <CardDescription className="mt-1">{card.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Weekly chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <IconChartBar className="size-4 text-muted-foreground" />
            <CardTitle className="text-base">Punkty tygodniowe</CardTitle>
          </div>
          <CardDescription>Twoje skorygowane punkty z ostatnich 8 tygodni</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 h-40">
            {weeklyHistory.map((week, i) => {
              const pct = maxPoints > 0 ? (week.points / maxPoints) * 100 : 0;
              const isCurrent = i === weeklyHistory.length - 1;
              return (
                <div
                  key={week.weekStart}
                  className="group flex flex-1 flex-col items-center gap-1"
                >
                  <span className="invisible text-xs text-muted-foreground group-hover:visible">
                    {week.points > 0 ? week.points.toFixed(0) : "—"}
                  </span>
                  <div className="relative w-full flex items-end justify-center h-32">
                    <div
                      className={`w-full rounded-t transition-all ${
                        isCurrent
                          ? "bg-primary"
                          : "bg-primary/30 hover:bg-primary/50"
                      }`}
                      style={{ height: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {week.weekStart.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

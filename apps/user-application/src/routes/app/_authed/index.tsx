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
        context.trpc.leaderboard.getMyRank.queryOptions({ period: "all" }),
      ),
      context.queryClient.prefetchQuery(
        context.trpc.profile.getMyProfile.queryOptions(),
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
  const { data: myRank } = useSuspenseQuery(
    trpc.leaderboard.getMyRank.queryOptions({ period: "all" }),
  );
  const { data: profile } = useSuspenseQuery(
    trpc.profile.getMyProfile.queryOptions(),
  );

  const maxPoints = Math.max(...weeklyHistory.map((w) => w.points), 1);

  const statCards = [
    {
      title: "Total Sessions",
      value: stats.totalSessions,
      description: "All time",
      icon: IconCalendar,
      iconClass: "text-muted-foreground",
    },
    {
      title: "Total Points",
      value: stats.totalPoints.toFixed(0),
      description: "Corrected points",
      icon: IconBolt,
      iconClass: "text-yellow-500",
      suffix: "pts",
    },
    {
      title: "This Week",
      value: stats.weekSessions,
      description: "Sessions this week",
      icon: IconFlame,
      iconClass: "text-orange-500",
      suffix: "sessions",
    },
    {
      title: "This Month",
      value: stats.monthPoints.toFixed(0),
      description: "Corrected points",
      icon: IconTrophy,
      iconClass: "text-blue-500",
      suffix: "pts",
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {profile.nickname}
          </h1>
          <p className="text-sm text-muted-foreground">
            Here's your EMS training overview.
          </p>
        </div>
        {myRank && (
          <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-sm">
            <IconTrophy className="size-4 text-yellow-500" />
            All-Time Rank #{myRank.rank}
          </Badge>
        )}
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
            <CardTitle className="text-base">Weekly Points</CardTitle>
          </div>
          <CardDescription>Your corrected points over the last 8 weeks</CardDescription>
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
                          ? "bg-yellow-400"
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

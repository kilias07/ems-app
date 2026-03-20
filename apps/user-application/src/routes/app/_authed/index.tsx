import { createFileRoute } from "@tanstack/react-router";
import { trpc } from "@/router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconBolt, IconTrophy, IconCalendar, IconFlame } from "@tabler/icons-react";

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
        context.trpc.leaderboard.getMyRank.queryOptions({
          period: "all",
        }),
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

  const maxPoints = Math.max(...weeklyHistory.map((w) => w.points), 1);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        {myRank && (
          <Badge variant="outline" className="text-base px-3 py-1">
            <IconTrophy className="size-4 mr-1 text-yellow-400" />
            All-Time Rank #{myRank.rank}
          </Badge>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Sessions"
          value={stats.totalSessions}
          icon={<IconCalendar className="size-5 text-muted-foreground" />}
        />
        <StatCard
          title="Total Points"
          value={stats.totalPoints.toFixed(0)}
          icon={<IconBolt className="size-5 text-yellow-400" />}
          suffix="pts"
        />
        <StatCard
          title="This Week"
          value={stats.weekSessions}
          icon={<IconFlame className="size-5 text-orange-400" />}
          suffix="sessions"
        />
        <StatCard
          title="This Month"
          value={stats.monthPoints.toFixed(0)}
          icon={<IconTrophy className="size-5 text-blue-400" />}
          suffix="pts"
        />
      </div>

      {/* Weekly chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Weekly Points — Last 8 Weeks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 h-32">
            {weeklyHistory.map((week, i) => {
              const height = maxPoints > 0 ? (week.points / maxPoints) * 100 : 0;
              const isCurrentWeek = i === weeklyHistory.length - 1;
              return (
                <div
                  key={week.weekStart}
                  className="flex-1 flex flex-col items-center gap-1 group"
                  title={`${week.weekStart}: ${week.points.toFixed(0)} pts`}
                >
                  <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    {week.points.toFixed(0)}
                  </span>
                  <div
                    className={`w-full rounded-t transition-all ${
                      isCurrentWeek ? "bg-yellow-400" : "bg-primary/40"
                    }`}
                    style={{ height: `${Math.max(height, 2)}%` }}
                  />
                  <span className="text-[10px] text-muted-foreground rotate-45 origin-left ml-2 hidden md:block">
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

function StatCard({
  title,
  value,
  icon,
  suffix,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  suffix?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value}
          {suffix && (
            <span className="text-sm font-normal text-muted-foreground ml-1">
              {suffix}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

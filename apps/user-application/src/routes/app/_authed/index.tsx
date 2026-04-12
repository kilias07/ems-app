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
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Area,
  AreaChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  CartesianGrid,
} from "recharts";
import {
  IconBolt,
  IconTrophy,
  IconCalendar,
  IconFlame,
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
        context.trpc.sessions.getMonthlyHistory.queryOptions(),
      ),
      context.queryClient.prefetchQuery(
        context.trpc.sessions.getDayOfWeekDistribution.queryOptions(),
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

const weeklyChartConfig = {
  points: {
    label: "Punkty",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const monthlyChartConfig = {
  points: {
    label: "Punkty",
    color: "var(--chart-2)",
  },
  sessions: {
    label: "Sesje",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

const radarChartConfig = {
  sessions: {
    label: "Sesje",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

const MONTH_NAMES: Record<string, string> = {
  "01": "Sty",
  "02": "Lut",
  "03": "Mar",
  "04": "Kwi",
  "05": "Maj",
  "06": "Cze",
  "07": "Lip",
  "08": "Sie",
  "09": "Wrz",
  "10": "Paź",
  "11": "Lis",
  "12": "Gru",
};

function DashboardPage() {
  const { data: stats } = useSuspenseQuery(
    trpc.sessions.getMyStats.queryOptions(),
  );
  const { data: weeklyHistory } = useSuspenseQuery(
    trpc.sessions.getWeeklyHistory.queryOptions(),
  );
  const { data: monthlyHistory } = useSuspenseQuery(
    trpc.sessions.getMonthlyHistory.queryOptions(),
  );
  const { data: dowDistribution } = useSuspenseQuery(
    trpc.sessions.getDayOfWeekDistribution.queryOptions(),
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
      description: "Łącznie",
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

  const weeklyData = weeklyHistory.map((w) => ({
    week: w.weekStart.slice(5),
    points: Math.round(w.points),
  }));

  const monthlyData = monthlyHistory.map((m) => ({
    month: MONTH_NAMES[m.month.slice(5)] ?? m.month.slice(5),
    points: Math.round(m.points),
    sessions: m.sessions,
  }));

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

      {/* Weekly points bar chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Punkty tygodniowe</CardTitle>
          <CardDescription>Skorygowane punkty z ostatnich 8 tygodni</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={weeklyChartConfig} className="h-48 w-full">
            <BarChart data={weeklyData} accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="week"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
              />
              <YAxis tickLine={false} axisLine={false} width={40} fontSize={12} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="points"
                fill="var(--color-points)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Monthly trend area chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Trend miesięczny</CardTitle>
            <CardDescription>Punkty i sesje z ostatnich 6 miesięcy</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={monthlyChartConfig} className="h-48 w-full">
              <AreaChart data={monthlyData} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={12}
                />
                <YAxis tickLine={false} axisLine={false} width={40} fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  dataKey="points"
                  type="monotone"
                  fill="var(--color-points)"
                  fillOpacity={0.2}
                  stroke="var(--color-points)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Day of week radar chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dni treningowe</CardTitle>
            <CardDescription>W które dni najczęściej trenujesz</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={radarChartConfig} className="h-48 w-full">
              <RadarChart data={dowDistribution}>
                <PolarGrid />
                <PolarAngleAxis dataKey="day" fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Radar
                  dataKey="sessions"
                  fill="var(--color-sessions)"
                  fillOpacity={0.3}
                  stroke="var(--color-sessions)"
                  strokeWidth={2}
                />
              </RadarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

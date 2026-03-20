import { createFileRoute } from "@tanstack/react-router";
import { trpc } from "@/router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  const monday = new Date(d);
  monday.setDate(diff);
  return monday.toISOString().slice(0, 10);
}

type Period = "all" | "monthly" | "weekly";

function LeaderboardTable({ period, periodKey }: { period: Period; periodKey?: string }) {
  const { data: board } = useSuspenseQuery(
    trpc.leaderboard.getLeaderboard.queryOptions({ period, periodKey }),
  );
  const { data: myProfile } = useSuspenseQuery(
    trpc.profile.getMyProfile.queryOptions(),
  );

  const trophy = ["🥇", "🥈", "🥉"];

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Rank</TableHead>
            <TableHead>Member</TableHead>
            <TableHead className="text-right">Sessions</TableHead>
            <TableHead className="text-right">Total Points</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {board.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                No data for this period yet.
              </TableCell>
            </TableRow>
          ) : (
            board.map((entry) => {
              const isMe = entry.memberId === myProfile.userId;
              return (
                <TableRow
                  key={entry.memberId}
                  className={isMe ? "bg-yellow-400/5 font-semibold" : ""}
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
                          You
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
    await Promise.all([
      context.queryClient.prefetchQuery(
        context.trpc.leaderboard.getLeaderboard.queryOptions({ period: "all" }),
      ),
      context.queryClient.prefetchQuery(
        context.trpc.profile.getMyProfile.queryOptions(),
      ),
    ]);
  },
  component: LeaderboardPage,
});

function LeaderboardPage() {
  const [tab, setTab] = useState<Period>("all");

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>

      <Tabs value={tab} onValueChange={(v) => setTab(v as Period)}>
        <TabsList>
          <TabsTrigger value="all">All Time</TabsTrigger>
          <TabsTrigger value="monthly">This Month</TabsTrigger>
          <TabsTrigger value="weekly">This Week</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <LeaderboardTable period="all" />
        </TabsContent>
        <TabsContent value="monthly" className="mt-4">
          <LeaderboardTable period="monthly" periodKey={getCurrentMonthKey()} />
        </TabsContent>
        <TabsContent value="weekly" className="mt-4">
          <LeaderboardTable period="weekly" periodKey={getCurrentWeekKey()} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { trpc } from "@/router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/app/_authed/my-sessions")({
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery(
      context.trpc.sessions.getMySessions.queryOptions({
        page: 1,
      }),
    );
  },
  component: MySessionsPage,
});

function MySessionsPage() {
  const [page, setPage] = useState(1);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filters, setFilters] = useState<{
    page: number;
    dateFrom?: string;
    dateTo?: string;
  }>({ page: 1 });

  const { data } = useSuspenseQuery(
    trpc.sessions.getMySessions.queryOptions(filters),
  );

  const applyFilters = () => {
    setPage(1);
    setFilters({
      page: 1,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    });
  };

  const changePage = (newPage: number) => {
    setPage(newPage);
    setFilters((f) => ({ ...f, page: newPage }));
  };

  const totalPages = Math.ceil(data.total / data.pageSize);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">My Sessions</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filter by Date</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end flex-wrap">
            <div className="space-y-1">
              <Label>From</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="space-y-1">
              <Label>To</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-40"
              />
            </div>
            <Button onClick={applyFilters}>Apply</Button>
            <Button
              variant="outline"
              onClick={() => {
                setDateFrom("");
                setDateTo("");
                setPage(1);
                setFilters({ page: 1 });
              }}
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Suit</TableHead>
              <TableHead className="text-right">Raw Points</TableHead>
              <TableHead className="text-right">Corrected Points</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                  No sessions found.
                </TableCell>
              </TableRow>
            ) : (
              data.data.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>{session.sessionDate}</TableCell>
                  <TableCell>
                    <span className="font-mono text-sm bg-muted px-2 py-0.5 rounded">
                      {session.suitSize}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{session.rawPoints}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {session.correctedPoints.toFixed(1)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm max-w-xs truncate">
                    {session.notes ?? "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages} · {data.total} sessions total
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => changePage(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => changePage(page + 1)}
              disabled={page >= totalPages}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

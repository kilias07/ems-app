import { createFileRoute } from "@tanstack/react-router";
import { trpc } from "@/router";
import { useSuspenseQuery, useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { IconPlus } from "@tabler/icons-react";
import { toast } from "sonner";
import { SUIT_MULTIPLIERS, SUIT_SIZES } from "@repo/data-ops/utils/suit-multipliers";

export const Route = createFileRoute("/app/_authed/my-sessions")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.prefetchQuery(
        context.trpc.sessions.getMySessions.queryOptions({ page: 1 }),
      ),
      context.queryClient.prefetchQuery(
        context.trpc.profile.getMyProfile.queryOptions(),
      ),
    ]);
  },
  component: MySessionsPage,
});

function LogSessionDialog({ defaultSuitSize }: { defaultSuitSize?: string | null }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const [sessionDate, setSessionDate] = useState(today);
  const [suitSize, setSuitSize] = useState(defaultSuitSize ?? "");
  const [rawPoints, setRawPoints] = useState("");
  const [notes, setNotes] = useState("");

  const correctedPreview = useMemo(() => {
    if (!suitSize || !rawPoints) return null;
    const pts = parseInt(rawPoints);
    if (isNaN(pts) || pts <= 0) return null;
    return (pts * SUIT_MULTIPLIERS[suitSize]).toFixed(1);
  }, [suitSize, rawPoints]);

  const logSession = useMutation(
    trpc.sessions.logMySession.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Session logged! Corrected points: ${data.correctedPoints.toFixed(1)}`);
        setOpen(false);
        setSessionDate(today);
        setSuitSize(defaultSuitSize ?? "");
        setRawPoints("");
        setNotes("");
        queryClient.invalidateQueries({ queryKey: trpc.sessions.getMySessions.queryKey() });
        queryClient.invalidateQueries({ queryKey: trpc.sessions.getMyStats.queryKey() });
        queryClient.invalidateQueries({ queryKey: trpc.sessions.getWeeklyHistory.queryKey() });
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suitSize || !rawPoints) return;
    logSession.mutate({
      sessionDate,
      suitSize: suitSize as any,
      rawPoints: parseInt(rawPoints),
      notes: notes || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <IconPlus className="size-4 mr-1" />
          Log Session
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Log My Session</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1">
            <Label>Date</Label>
            <Input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <Label>Suit Size</Label>
            <Select value={suitSize} onValueChange={setSuitSize}>
              <SelectTrigger>
                <SelectValue placeholder="Select suit…" />
              </SelectTrigger>
              <SelectContent>
                {SUIT_SIZES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s} <span className="text-muted-foreground text-xs">×{SUIT_MULTIPLIERS[s]}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Raw Points</Label>
            <Input
              type="number"
              min="1"
              placeholder="e.g. 850"
              value={rawPoints}
              onChange={(e) => setRawPoints(e.target.value)}
              required
            />
            {correctedPreview && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-sm text-muted-foreground">Corrected points:</span>
                <Badge variant="secondary" className="font-mono">{correctedPreview}</Badge>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <Label>Notes <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Textarea
              placeholder="Any observations…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={logSession.isPending || !suitSize || !rawPoints}
          >
            {logSession.isPending ? "Saving…" : "Save Session"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function MySessionsPage() {
  const { data: profile } = useQuery(trpc.profile.getMyProfile.queryOptions());
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
    setFilters({ page: 1, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined });
  };

  const changePage = (newPage: number) => {
    setPage(newPage);
    setFilters((f) => ({ ...f, page: newPage }));
  };

  const totalPages = Math.ceil(data.total / data.pageSize);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">My Sessions</h1>
        <LogSessionDialog defaultSuitSize={profile?.suitSize} />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Filter by Date</CardTitle>
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

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {data.total} session{data.total !== 1 ? "s" : ""} total
          </CardTitle>
          {profile?.suitSize && (
            <CardDescription>Your suit: <span className="font-mono font-semibold">{profile.suitSize}</span></CardDescription>
          )}
        </CardHeader>
        <CardContent className="p-0">
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
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => changePage(page - 1)} disabled={page === 1}>
              <ChevronLeft className="size-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => changePage(page + 1)} disabled={page >= totalPages}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

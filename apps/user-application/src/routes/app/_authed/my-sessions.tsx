import { createFileRoute } from "@tanstack/react-router";
import { trpc } from "@/router";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, ChevronLeft, ChevronRight, X, RotateCcw, Settings } from "lucide-react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { IconPlus } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { SUIT_MULTIPLIERS } from "@repo/data-ops/utils/suit-multipliers";

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

const STATUS_LABELS: Record<string, string> = {
  pending: "Oczekuje",
  approved: "Zatwierdzona",
  rejected: "Odrzucona",
};

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
};

// ── Log session dialog ─────────────────────────────────────────────────────

function LogSessionDialog({ suitSize }: { suitSize?: string | null }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const [sessionDate, setSessionDate] = useState(today);
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
      onSuccess: () => {
        toast.success("Sesja wysłana do zatwierdzenia przez trenera.");
        setOpen(false);
        setSessionDate(today);
        setRawPoints("");
        setNotes("");
        queryClient.invalidateQueries({ queryKey: trpc.sessions.getMySessions.queryKey() });
        queryClient.invalidateQueries({ queryKey: trpc.sessions.getMyStats.queryKey() });
        queryClient.invalidateQueries({ queryKey: trpc.sessions.getWeeklyHistory.queryKey() });
        queryClient.invalidateQueries({ queryKey: trpc.sessions.getMonthlyHistory.queryKey() });
        queryClient.invalidateQueries({ queryKey: trpc.sessions.getDayOfWeekDistribution.queryKey() });
        queryClient.invalidateQueries({ queryKey: trpc.leaderboard.getLeaderboard.queryKey() });
        queryClient.invalidateQueries({ queryKey: trpc.leaderboard.getMyRanks.queryKey() });
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  if (!suitSize) {
    return (
      <Button disabled>
        <IconPlus className="size-4 mr-1" />
        Dodaj sesję
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <IconPlus className="size-4 mr-1" />
          Dodaj sesję
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Zgłoś swoją sesję</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!rawPoints) return;
            logSession.mutate({
              sessionDate,
              rawPoints: parseInt(rawPoints),
              notes: notes || undefined,
            });
          }}
          className="space-y-4 pt-2"
        >
          <div className="flex items-center justify-between rounded-md border px-3 py-2 bg-muted/40">
            <span className="text-sm text-muted-foreground">Rozmiar kombinezonu</span>
            <span className="font-mono font-semibold">{suitSize}</span>
          </div>

          <div className="space-y-1">
            <Label>Data</Label>
            <Input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <Label>Surowe punkty</Label>
            <Input
              type="number"
              min="1"
              placeholder="np. 850"
              value={rawPoints}
              onChange={(e) => setRawPoints(e.target.value)}
              required
              autoFocus
            />
            {correctedPreview && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-sm text-muted-foreground">Szacowane punkty skorygowane:</span>
                <Badge variant="secondary" className="font-mono">{correctedPreview}</Badge>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <Label>
              Notatki{" "}
              <span className="text-muted-foreground text-xs">(opcjonalnie)</span>
            </Label>
            <Textarea
              placeholder="Dowolne obserwacje…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Sesja zostanie wysłana do zatwierdzenia przez trenera.
          </p>

          <Button
            type="submit"
            className="w-full"
            disabled={logSession.isPending || !rawPoints}
          >
            {logSession.isPending ? "Wysyłanie…" : "Wyślij do zatwierdzenia"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

function MySessionsPage() {
  const queryClient = useQueryClient();
  const { data: profile } = useQuery(trpc.profile.getMyProfile.queryOptions());
  const [page, setPage] = useState(1);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [range, setRange] = useState<DateRange | undefined>();
  const [appliedRange, setAppliedRange] = useState<DateRange | undefined>();
  const [filters, setFilters] = useState<{
    page: number;
    dateFrom?: string;
    dateTo?: string;
  }>({ page: 1 });

  const { data } = useQuery(trpc.sessions.getMySessions.queryOptions(filters));

  const resubmit = useMutation(
    trpc.sessions.resubmitSession.mutationOptions({
      onSuccess: () => {
        toast.success("Sesja wysłana ponownie do zatwierdzenia.");
        queryClient.invalidateQueries({ queryKey: trpc.sessions.getMySessions.queryKey() });
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  const applyRange = () => {
    if (!range?.from || !range?.to) return;
    setAppliedRange(range);
    setCalendarOpen(false);
    setPage(1);
    setFilters({
      page: 1,
      dateFrom: format(range.from, "yyyy-MM-dd"),
      dateTo: format(range.to, "yyyy-MM-dd"),
    });
  };

  const clearRange = () => {
    setRange(undefined);
    setAppliedRange(undefined);
    setPage(1);
    setFilters({ page: 1 });
  };

  const changePage = (newPage: number) => {
    setPage(newPage);
    setFilters((f) => ({ ...f, page: newPage }));
  };

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Moje sesje</h1>
        <LogSessionDialog suitSize={profile?.suitSize} />
      </div>

      <div className={`rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400 flex items-center justify-between gap-4 transition-opacity ${profile && !profile.suitSize ? "opacity-100" : "opacity-0 pointer-events-none select-none"}`}>
        <span>Ustaw rozmiar kombinezonu, aby móc dodawać sesje.</span>
        <Link to="/app/settings">
          <Button variant="outline" size="sm" className="gap-1 shrink-0 border-amber-500/50 text-amber-700 hover:bg-amber-500/10">
            <Settings className="size-3" />
            Ustawienia
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Popover
          open={calendarOpen}
          onOpenChange={(open) => {
            if (open) setRange(appliedRange);
            setCalendarOpen(open);
          }}
        >
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <CalendarIcon className="size-4" />
              {appliedRange?.from && appliedRange?.to
                ? `${format(appliedRange.from, "MMM d, yyyy")} – ${format(appliedRange.to, "MMM d, yyyy")}`
                : "Filtruj według dat"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              defaultMonth={range?.from}
              selected={range}
              onSelect={setRange}
              numberOfMonths={2}
              disabled={(date) =>
                date > new Date() || date < new Date("1900-01-01")
              }
            />
            <div className="flex gap-2 border-t p-3">
              <Button
                size="sm"
                className="flex-1"
                disabled={!range?.from || !range?.to}
                onClick={applyRange}
              >
                Zastosuj
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setRange(undefined);
                  setCalendarOpen(false);
                  setPage(1);
                  setFilters({ page: 1 });
                }}
              >
                Wyczyść
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        {appliedRange?.from && (
          <Button variant="ghost" size="icon" onClick={clearRange} aria-label="Wyczyść filtr dat">
            <X className="size-4" />
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Kombinezon</TableHead>
              <TableHead className="text-right">Surowe</TableHead>
              <TableHead className="text-right">Skorygowane</TableHead>
              <TableHead>Notatki</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {!data || data.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                  Brak sesji.
                </TableCell>
              </TableRow>
            ) : (
              data.data.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>{session.sessionDate}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANTS[session.status] ?? "outline"}>
                      {STATUS_LABELS[session.status] ?? session.status}
                    </Badge>
                    {session.status === "rejected" && session.rejectionNote && (
                      <p className="text-xs text-muted-foreground mt-1 max-w-[180px] truncate" title={session.rejectionNote}>
                        {session.rejectionNote}
                      </p>
                    )}
                  </TableCell>
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
                  <TableCell>
                    {session.status === "rejected" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1 text-xs"
                        disabled={resubmit.isPending}
                        onClick={() => resubmit.mutate({ sessionId: session.id })}
                      >
                        <RotateCcw className="size-3" />
                        Ponów
                      </Button>
                    )}
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
            Strona {page} z {totalPages} · {data?.total} sesji
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

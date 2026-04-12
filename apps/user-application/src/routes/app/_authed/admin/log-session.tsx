import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { trpc } from "@/router";
import { useMutation, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { SUIT_MULTIPLIERS } from "@repo/data-ops/utils/suit-multipliers";

export const Route = createFileRoute("/app/_authed/admin/log-session")({
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery(
      context.trpc.admin.listMembers.queryOptions(),
    );
  },
  component: LogSessionPage,
});

function LogSessionPage() {
  const queryClient = useQueryClient();
  const { data: members } = useSuspenseQuery(
    trpc.admin.listMembers.queryOptions(),
  );

  const today = new Date().toISOString().slice(0, 10);

  const [memberId, setMemberId] = useState("");
  const [sessionDate, setSessionDate] = useState(today);
  const [rawPoints, setRawPoints] = useState("");
  const [notes, setNotes] = useState("");
  const [memberOpen, setMemberOpen] = useState(false);

  const activeMembers = members.filter((m) => m.isActive === 1 && m.nickname);
  const selectedMember = activeMembers.find((m) => m.id === memberId);
  const suitSize = selectedMember?.suitSize ?? null;

  const correctedPreview = useMemo(() => {
    if (!suitSize || !rawPoints) return null;
    const pts = parseInt(rawPoints);
    if (isNaN(pts) || pts <= 0) return null;
    return (pts * SUIT_MULTIPLIERS[suitSize]).toFixed(1);
  }, [suitSize, rawPoints]);

  const logSession = useMutation(
    trpc.admin.logSession.mutationOptions({
      onSuccess: (data) => {
        toast.success(
          `Sesja dodana! Punkty skorygowane: ${data.correctedPoints.toFixed(1)}`,
        );
        setMemberId("");
        setSessionDate(today);
        setRawPoints("");
        setNotes("");
        queryClient.invalidateQueries({ queryKey: trpc.sessions.getMyStats.queryKey() });
        queryClient.invalidateQueries({ queryKey: trpc.sessions.getWeeklyHistory.queryKey() });
        queryClient.invalidateQueries({ queryKey: trpc.sessions.getMonthlyHistory.queryKey() });
        queryClient.invalidateQueries({ queryKey: trpc.sessions.getDayOfWeekDistribution.queryKey() });
        queryClient.invalidateQueries({ queryKey: trpc.leaderboard.getLeaderboard.queryKey() });
        queryClient.invalidateQueries({ queryKey: trpc.leaderboard.getMyRanks.queryKey() });
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId || !rawPoints) return;
    logSession.mutate({
      memberId,
      sessionDate,
      rawPoints: parseInt(rawPoints),
      notes: notes || undefined,
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-lg space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dodaj sesję</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nowa sesja</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Member picker */}
            <div className="space-y-1">
              <Label>Uczestnik</Label>
              <Popover open={memberOpen} onOpenChange={setMemberOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                  >
                    {selectedMember?.nickname ?? "Wybierz uczestnika…"}
                    <ChevronsUpDown className="ml-2 size-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Szukaj pseudonimu…" />
                    <CommandList>
                      <CommandEmpty>Nie znaleziono uczestnika.</CommandEmpty>
                      <CommandGroup>
                        {activeMembers.map((m) => (
                          <CommandItem
                            key={m.id}
                            value={m.nickname ?? ""}
                            onSelect={() => {
                              setMemberId(m.id);
                              setMemberOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 size-4",
                                memberId === m.id ? "opacity-100" : "opacity-0",
                              )}
                            />
                            {m.nickname}
                            {m.suitSize && (
                              <span className="ml-auto text-xs text-muted-foreground font-mono">
                                {m.suitSize}
                              </span>
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Suit size — read-only from member profile */}
            {selectedMember && (
              <div className="flex items-center justify-between rounded-md border px-3 py-2 bg-muted/40">
                <span className="text-sm text-muted-foreground">Kombinezon</span>
                {suitSize ? (
                  <span className="font-mono font-semibold">
                    {suitSize} <span className="text-muted-foreground font-normal text-xs">×{SUIT_MULTIPLIERS[suitSize]}</span>
                  </span>
                ) : (
                  <span className="text-sm text-destructive">Brak ustawionego rozmiaru</span>
                )}
              </div>
            )}

            {/* Date */}
            <div className="space-y-1">
              <Label>Data sesji</Label>
              <Input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                required
              />
            </div>

            {/* Raw points */}
            <div className="space-y-1">
              <Label>Surowe punkty</Label>
              <Input
                type="number"
                min="1"
                placeholder="np. 850"
                value={rawPoints}
                onChange={(e) => setRawPoints(e.target.value)}
                required
              />
              {correctedPreview && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Punkty skorygowane:
                  </span>
                  <Badge variant="secondary" className="font-mono">
                    {correctedPreview}
                  </Badge>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <Label>Notatki (opcjonalnie)</Label>
              <Textarea
                placeholder="Dowolne obserwacje…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={
                logSession.isPending ||
                !memberId ||
                !suitSize ||
                !rawPoints
              }
            >
              {logSession.isPending ? "Zapisywanie…" : "Dodaj sesję"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

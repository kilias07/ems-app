import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { trpc } from "@/router";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { SUIT_MULTIPLIERS, SUIT_SIZES } from "@repo/data-ops/utils/suit-multipliers";

export const Route = createFileRoute("/app/_authed/admin/log-session")({
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery(
      context.trpc.admin.listMembers.queryOptions(),
    );
  },
  component: LogSessionPage,
});

function LogSessionPage() {
  const { data: members } = useSuspenseQuery(
    trpc.admin.listMembers.queryOptions(),
  );

  const today = new Date().toISOString().slice(0, 10);

  const [memberId, setMemberId] = useState("");
  const [sessionDate, setSessionDate] = useState(today);
  const [suitSize, setSuitSize] = useState("");
  const [rawPoints, setRawPoints] = useState("");
  const [notes, setNotes] = useState("");
  const [memberOpen, setMemberOpen] = useState(false);

  const correctedPreview = useMemo(() => {
    if (!suitSize || !rawPoints) return null;
    const pts = parseInt(rawPoints);
    if (isNaN(pts) || pts <= 0) return null;
    const multiplier = SUIT_MULTIPLIERS[suitSize];
    return (pts * multiplier).toFixed(1);
  }, [suitSize, rawPoints]);

  const logSession = useMutation(
    trpc.admin.logSession.mutationOptions({
      onSuccess: (data) => {
        toast.success(
          `Session logged! Corrected points: ${data.correctedPoints.toFixed(1)}`,
        );
        setMemberId("");
        setSessionDate(today);
        setSuitSize("");
        setRawPoints("");
        setNotes("");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }),
  );

  const activeMembers = members.filter((m) => m.isActive === 1 && m.nickname);
  const selectedMember = activeMembers.find((m) => m.id === memberId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId || !suitSize || !rawPoints) return;
    logSession.mutate({
      memberId,
      sessionDate,
      suitSize: suitSize as any,
      rawPoints: parseInt(rawPoints),
      notes: notes || undefined,
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-lg space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Log Session</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">New Session</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Member picker */}
            <div className="space-y-1">
              <Label>Member</Label>
              <Popover open={memberOpen} onOpenChange={setMemberOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                  >
                    {selectedMember?.nickname ?? "Select member…"}
                    <ChevronsUpDown className="ml-2 size-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search nickname…" />
                    <CommandList>
                      <CommandEmpty>No member found.</CommandEmpty>
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
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Date */}
            <div className="space-y-1">
              <Label>Session Date</Label>
              <Input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                required
              />
            </div>

            {/* Suit size */}
            <div className="space-y-1">
              <Label>Suit Size</Label>
              <Select value={suitSize} onValueChange={setSuitSize}>
                <SelectTrigger>
                  <SelectValue placeholder="Select suit…" />
                </SelectTrigger>
                <SelectContent>
                  {SUIT_SIZES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s} (×{SUIT_MULTIPLIERS[s]})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Raw points */}
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
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Corrected points:
                  </span>
                  <Badge variant="secondary" className="font-mono">
                    {correctedPreview}
                  </Badge>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <Label>Notes (optional)</Label>
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
              disabled={
                logSession.isPending ||
                !memberId ||
                !suitSize ||
                !rawPoints
              }
            >
              {logSession.isPending ? "Saving…" : "Log Session"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

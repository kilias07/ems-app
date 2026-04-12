import { createFileRoute } from "@tanstack/react-router";
import { trpc } from "@/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

export const Route = createFileRoute("/app/_authed/admin/inbox")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.prefetchQuery({
        ...context.trpc.admin.getPendingMembers.queryOptions(),
        staleTime: 0,
      }),
      context.queryClient.prefetchQuery({
        ...context.trpc.admin.getPendingSessions.queryOptions(),
        staleTime: 0,
      }),
    ]);
  },
  component: InboxPage,
});

function InboxPage() {
  const queryClient = useQueryClient();

  const { data: pendingMembers } = useQuery({
    ...trpc.admin.getPendingMembers.queryOptions(),
    staleTime: 0,
  });
  const { data: pendingSessions } = useQuery({
    ...trpc.admin.getPendingSessions.queryOptions(),
    staleTime: 0,
  });

  const invalidateMembers = () =>
    queryClient.invalidateQueries({ queryKey: trpc.admin.getPendingMembers.queryKey() });
  const invalidateSessions = () =>
    queryClient.invalidateQueries({ queryKey: trpc.admin.getPendingSessions.queryKey() });

  const approveMember = useMutation(
    trpc.admin.approveMember.mutationOptions({
      onSuccess: () => { toast.success("Uczestnik zaakceptowany."); invalidateMembers(); },
      onError: (err) => toast.error(err.message),
    }),
  );

  const approveSession = useMutation(
    trpc.admin.approveSession.mutationOptions({
      onSuccess: () => {
        toast.success("Sesja zatwierdzona.");
        invalidateSessions();
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

  // Reject session dialog state
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectSessionId, setRejectSessionId] = useState<string | null>(null);
  const [rejectionNote, setRejectionNote] = useState("");

  const rejectSession = useMutation(
    trpc.admin.rejectSession.mutationOptions({
      onSuccess: () => {
        toast.success("Sesja odrzucona.");
        setRejectDialogOpen(false);
        setRejectionNote("");
        setRejectSessionId(null);
        invalidateSessions();
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  const openRejectDialog = (sessionId: string) => {
    setRejectSessionId(sessionId);
    setRejectionNote("");
    setRejectDialogOpen(true);
  };

  const memberCount = pendingMembers?.length ?? 0;
  const sessionCount = pendingSessions?.length ?? 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Skrzynka odbiorcza</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Wnioski oczekujące na Twoją akceptację.
        </p>
      </div>

      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members">
            Uczestnicy
            {memberCount > 0 && (
              <Badge variant="destructive" className="ml-2 size-5 justify-center p-0 text-xs">
                {memberCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sessions">
            Sesje
            {sessionCount > 0 && (
              <Badge variant="destructive" className="ml-2 size-5 justify-center p-0 text-xs">
                {sessionCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Pending members */}
        <TabsContent value="members" className="mt-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Imię i nazwisko</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Pseudonim</TableHead>
                  <TableHead>Dołączył</TableHead>
                  <TableHead className="text-right">Akcja</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!pendingMembers || pendingMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-20 text-muted-foreground">
                      Brak oczekujących uczestników.
                    </TableCell>
                  </TableRow>
                ) : (
                  pendingMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {member.name ?? <span className="italic text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                        {member.email ?? <span className="italic">—</span>}
                      </TableCell>
                      <TableCell>
                        {member.nickname ?? (
                          <span className="italic text-muted-foreground">(brak)</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {member.joinedAt.slice(0, 10)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          disabled={approveMember.isPending}
                          onClick={() => approveMember.mutate({ memberId: member.id })}
                        >
                          <Check className="size-4 mr-1" />
                          Akceptuj
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Pending sessions */}
        <TabsContent value="sessions" className="mt-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Uczestnik</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Kombinezon</TableHead>
                  <TableHead className="text-right">Surowe</TableHead>
                  <TableHead className="text-right">Skorygowane</TableHead>
                  <TableHead>Notatki</TableHead>
                  <TableHead className="text-right">Akcja</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!pendingSessions || pendingSessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-20 text-muted-foreground">
                      Brak oczekujących sesji.
                    </TableCell>
                  </TableRow>
                ) : (
                  pendingSessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">
                        {session.memberNickname ?? "—"}
                      </TableCell>
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
                      <TableCell className="text-muted-foreground text-sm max-w-[150px] truncate">
                        {session.notes ?? "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            disabled={approveSession.isPending}
                            onClick={() => approveSession.mutate({ sessionId: session.id })}
                          >
                            <Check className="size-4 mr-1" />
                            Zatwierdź
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => openRejectDialog(session.id)}
                          >
                            <X className="size-4 mr-1" />
                            Odrzuć
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Reject dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Odrzuć sesję</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label>Powód odrzucenia</Label>
              <Textarea
                placeholder="Wpisz powód odrzucenia…"
                value={rejectionNote}
                onChange={(e) => setRejectionNote(e.target.value)}
                rows={3}
                autoFocus
              />
            </div>
            <Button
              className="w-full"
              variant="destructive"
              disabled={!rejectionNote.trim() || rejectSession.isPending}
              onClick={() => {
                if (rejectSessionId)
                  rejectSession.mutate({ sessionId: rejectSessionId, rejectionNote });
              }}
            >
              {rejectSession.isPending ? "Odrzucanie…" : "Odrzuć sesję"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

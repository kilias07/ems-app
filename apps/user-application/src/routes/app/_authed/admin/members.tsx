import { createFileRoute } from "@tanstack/react-router";
import { trpc } from "@/router";
import { useMutation, useSuspenseQuery, useQueryClient, useQuery } from "@tanstack/react-query";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Check, Trash2, StickyNote } from "lucide-react";
import { format, parseISO } from "date-fns";
import { pl } from "date-fns/locale";

export const Route = createFileRoute("/app/_authed/admin/members")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.prefetchQuery(
        context.trpc.admin.listMembers.queryOptions(),
      ),
      context.queryClient.prefetchQuery(
        context.trpc.admin.listClubPlaces.queryOptions(),
      ),
    ]);
  },
  component: MembersPage,
});

const ROLE_LABELS: Record<string, string> = {
  user: "Użytkownik",
  trainer: "Trener",
  admin: "Admin",
};

const ROLE_VARIANTS: Record<string, "default" | "secondary" | "outline"> = {
  admin: "default",
  trainer: "secondary",
  user: "outline",
};

function MembersPage() {
  const queryClient = useQueryClient();
  const { data: members } = useSuspenseQuery(trpc.admin.listMembers.queryOptions());
  const { data: myProfile } = useQuery(trpc.profile.getMyProfile.queryOptions());
  const { data: clubPlaces } = useQuery(trpc.admin.listClubPlaces.queryOptions());

  const isAdmin = myProfile?.role === "admin";

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string | null } | null>(null);
  const [notesTarget, setNotesTarget] = useState<{ id: string; name: string | null } | null>(null);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: trpc.admin.listMembers.queryKey() });

  const setActive = useMutation(
    trpc.admin.setMemberActive.mutationOptions({
      onSuccess: invalidate,
      onError: (err) => toast.error(err.message),
    }),
  );

  const setRole = useMutation(
    trpc.admin.setMemberRole.mutationOptions({
      onSuccess: invalidate,
      onError: (err) => toast.error(err.message),
    }),
  );

  const approveMember = useMutation(
    trpc.admin.approveMember.mutationOptions({
      onSuccess: () => { toast.success("Uczestnik zaakceptowany."); invalidate(); },
      onError: (err) => toast.error(err.message),
    }),
  );

  const [clubsTarget, setClubsTarget] = useState<{ id: string; name: string | null } | null>(null);

  const assignClubPlace = useMutation(
    trpc.admin.assignClubPlace.mutationOptions({
      onSuccess: invalidate,
      onError: (err) => toast.error(err.message),
    }),
  );

  const deleteAccount = useMutation(
    trpc.admin.deleteAccount.mutationOptions({
      onSuccess: () => {
        toast.success("Konto usunięte.");
        setDeleteTarget(null);
        invalidate();
      },
      onError: (err) => { toast.error(err.message); setDeleteTarget(null); },
    }),
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Uczestnicy</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Zarządzaj kontami uczestników, którzy się zarejestrowali.
        </p>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Imię i nazwisko</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Pseudonim</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Rola</TableHead>
              {isAdmin && <TableHead>Kluby trenera</TableHead>}
              <TableHead>Miejsce</TableHead>
              <TableHead className="text-right">Aktywny</TableHead>
              <TableHead />
              {isAdmin && <TableHead />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium whitespace-nowrap">
                  {member.name ?? (
                    <span className="italic text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                  {member.email ?? (
                    <span className="italic">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {member.nickname ?? (
                    <span className="italic text-muted-foreground">(brak)</span>
                  )}
                </TableCell>
                <TableCell>
                  {member.status === "pending" ? (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Oczekuje</Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-xs"
                        disabled={approveMember.isPending}
                        onClick={() => approveMember.mutate({ memberId: member.id })}
                      >
                        <Check className="size-3 mr-1" />
                        Akceptuj
                      </Button>
                    </div>
                  ) : (
                    <Badge variant="outline">Aktywny</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {isAdmin ? (
                    <Select
                      value={member.role}
                      onValueChange={(role) =>
                        setRole.mutate({ memberId: member.id, role: role as "user" | "trainer" | "admin" })
                      }
                    >
                      <SelectTrigger className="h-7 w-28 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Użytkownik</SelectItem>
                        <SelectItem value="trainer">Trener</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant={ROLE_VARIANTS[member.role] ?? "outline"}>
                      {ROLE_LABELS[member.role] ?? member.role}
                    </Badge>
                  )}
                </TableCell>
                {isAdmin && (
                  <TableCell>
                    {member.role === "trainer" || member.role === "admin" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setClubsTarget({ id: member.id, name: member.nickname ?? member.name })}
                      >
                        Zarządzaj
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                )}
                <TableCell>
                  <Select
                    value={member.clubPlaceId ?? "__none__"}
                    onValueChange={(val) =>
                      assignClubPlace.mutate({
                        userId: member.id,
                        clubPlaceId: val === "__none__" ? null : val,
                      })
                    }
                  >
                    <SelectTrigger className="h-7 w-36 text-xs">
                      <SelectValue placeholder="Brak" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Brak</SelectItem>
                      {(clubPlaces ?? []).map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right">
                  <Switch
                    checked={member.isActive === 1}
                    onCheckedChange={(checked) =>
                      setActive.mutate({ memberId: member.id, active: checked })
                    }
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setNotesTarget({ id: member.id, name: member.name ?? member.nickname })}
                  >
                    <StickyNote className="size-4" />
                  </Button>
                </TableCell>
                {isAdmin && (
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget({ id: member.id, name: member.name ?? member.nickname })}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <NotesSheet
        userId={notesTarget?.id ?? null}
        userName={notesTarget?.name ?? null}
        onClose={() => setNotesTarget(null)}
      />

      <TrainerClubsSheet
        trainerId={clubsTarget?.id ?? null}
        trainerName={clubsTarget?.name ?? null}
        onClose={() => setClubsTarget(null)}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Usuń konto</AlertDialogTitle>
            <AlertDialogDescription>
              Czy na pewno chcesz usunąć konto{" "}
              <span className="font-semibold">{deleteTarget?.name ?? "tego uczestnika"}</span>?
              Operacja jest nieodwracalna — wszystkie sesje treningowe zostaną usunięte.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget && deleteAccount.mutate({ memberId: deleteTarget.id })}
            >
              Usuń konto
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function NotesSheet({
  userId,
  userName,
  onClose,
}: {
  userId: string | null;
  userName: string | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");

  const { data: notes } = useQuery({
    ...trpc.admin.getNotesForUser.queryOptions({ userId: userId ?? "" }),
    enabled: !!userId,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: trpc.admin.getNotesForUser.queryKey({ userId: userId ?? "" }),
    });

  const addNote = useMutation(
    trpc.admin.addNote.mutationOptions({
      onSuccess: () => {
        setContent("");
        invalidate();
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  const deleteNote = useMutation(
    trpc.admin.deleteNote.mutationOptions({
      onSuccess: invalidate,
      onError: (err) => toast.error(err.message),
    }),
  );

  return (
    <Sheet open={!!userId} onOpenChange={(open) => { if (!open) { setContent(""); onClose(); } }}>
      <SheetContent className="flex flex-col gap-6 overflow-y-auto w-full sm:max-w-lg p-8">
        <SheetHeader>
          <SheetTitle className="text-xl">Notatki — {userName ?? "uczestnik"}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-3">
          <Textarea
            placeholder="Napisz notatkę..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <Button
            disabled={!content.trim() || addNote.isPending}
            onClick={() => userId && addNote.mutate({ userId, content: content.trim() })}
          >
            Dodaj notatkę
          </Button>
        </div>

        <div className="flex flex-col gap-4">
          {!notes || notes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Brak notatek.</p>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="rounded-lg border bg-card p-4 space-y-2">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{note.content}</p>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{note.authorNickname ?? "Trener"}</span>
                    <span>·</span>
                    <span>{format(parseISO(note.createdAt), "d MMM yyyy, HH:mm", { locale: pl })}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    disabled={deleteNote.isPending}
                    onClick={() => deleteNote.mutate({ noteId: note.id })}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function TrainerClubsSheet({
  trainerId,
  trainerName,
  onClose,
}: {
  trainerId: string | null;
  trainerName: string | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const { data: allClubs } = useQuery(trpc.admin.listClubPlaces.queryOptions());
  const { data: assignedClubs } = useQuery({
    ...trpc.admin.getClubsForTrainer.queryOptions({ trainerId: trainerId ?? "" }),
    enabled: !!trainerId,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: trpc.admin.getClubsForTrainer.queryKey({ trainerId: trainerId ?? "" }),
    });

  const assign = useMutation(
    trpc.admin.assignTrainerToClub.mutationOptions({
      onSuccess: invalidate,
      onError: (err) => toast.error(err.message),
    }),
  );

  const unassign = useMutation(
    trpc.admin.unassignTrainerFromClub.mutationOptions({
      onSuccess: invalidate,
      onError: (err) => toast.error(err.message),
    }),
  );

  const assignedIds = new Set((assignedClubs ?? []).map((c) => c.id));

  return (
    <Sheet open={!!trainerId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Kluby trenera{trainerName ? ` — ${trainerName}` : ""}</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-6 space-y-2">
          {(allClubs ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Brak klubów. Dodaj kluby w sekcji Miejsca.</p>
          ) : (
            (allClubs ?? []).map((club) => {
              const isAssigned = assignedIds.has(club.id);
              return (
                <div key={club.id} className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <p className="font-medium">{club.name}</p>
                    <p className="text-xs text-muted-foreground">{club.city}</p>
                  </div>
                  <Switch
                    checked={isAssigned}
                    disabled={!trainerId || assign.isPending || unassign.isPending}
                    onCheckedChange={(checked) => {
                      if (!trainerId) return;
                      if (checked) {
                        assign.mutate({ trainerId, clubPlaceId: club.id });
                      } else {
                        unassign.mutate({ trainerId, clubPlaceId: club.id });
                      }
                    }}
                  />
                </div>
              );
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

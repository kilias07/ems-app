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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Check, Trash2 } from "lucide-react";

export const Route = createFileRoute("/app/_authed/admin/members")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.prefetchQuery(
        context.trpc.admin.listMembers.queryOptions(),
      ),
      context.queryClient.prefetchQuery(
        context.trpc.admin.listTrainers.queryOptions(),
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
  const { data: trainers } = useQuery(trpc.admin.listTrainers.queryOptions());
  const { data: clubPlaces } = useQuery(trpc.admin.listClubPlaces.queryOptions());

  const isAdmin = myProfile?.role === "admin";

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string | null } | null>(null);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: trpc.admin.listMembers.queryKey() });

  const invalidateInbox = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: trpc.admin.getPendingSessions.queryKey() }),
      queryClient.invalidateQueries({ queryKey: trpc.admin.getPendingMembers.queryKey() }),
    ]);

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

  const assignTrainer = useMutation(
    trpc.admin.assignTrainer.mutationOptions({
      onSuccess: () => { invalidate(); invalidateInbox(); },
      onError: (err) => toast.error(err.message),
    }),
  );

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
              <TableHead>Trener</TableHead>
              <TableHead>Miejsce</TableHead>
              <TableHead className="text-right">Aktywny</TableHead>
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
                <TableCell>
                  <Select
                    value={member.trainerId ?? "__none__"}
                    onValueChange={(val) =>
                      assignTrainer.mutate({
                        userId: member.id,
                        trainerId: val === "__none__" ? null : val,
                      })
                    }
                  >
                    <SelectTrigger className="h-7 w-36 text-xs">
                      <SelectValue placeholder="Brak" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Brak</SelectItem>
                      {(trainers ?? []).map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.nickname ?? t.name ?? t.id.slice(0, 8)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
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

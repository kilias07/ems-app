import { createFileRoute } from "@tanstack/react-router";
import { trpc } from "@/router";
import { useMutation, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const Route = createFileRoute("/app/_authed/admin/members")({
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery(
      context.trpc.admin.listMembers.queryOptions(),
    );
  },
  component: MembersPage,
});

function MembersPage() {
  const queryClient = useQueryClient();
  const { data: members } = useSuspenseQuery(
    trpc.admin.listMembers.queryOptions(),
  );

  const [newNickname, setNewNickname] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const createMember = useMutation(
    trpc.admin.createMember.mutationOptions({
      onSuccess: () => {
        toast.success("Member created");
        setNewNickname("");
        setDialogOpen(false);
        queryClient.invalidateQueries({
          queryKey: trpc.admin.listMembers.queryKey(),
        });
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  const setActive = useMutation(
    trpc.admin.setMemberActive.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.admin.listMembers.queryKey(),
        });
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Members</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>+ Add Member</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Stub Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <Label>Nickname</Label>
                <Input
                  placeholder="e.g. IronMike"
                  value={newNickname}
                  onChange={(e) => setNewNickname(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (newNickname.length >= 2)
                        createMember.mutate({ nickname: newNickname });
                    }
                  }}
                />
              </div>
              <Button
                className="w-full"
                disabled={newNickname.length < 2 || createMember.isPending}
                onClick={() => createMember.mutate({ nickname: newNickname })}
              >
                {createMember.isPending ? "Creating…" : "Create Member"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nickname</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Active</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">
                  {member.nickname ?? (
                    <span className="text-muted-foreground italic">
                      (no nickname)
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={member.role === "admin" ? "default" : "secondary"}
                  >
                    {member.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={member.profileComplete ? "outline" : "destructive"}
                  >
                    {member.profileComplete ? "Complete" : "Incomplete"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {member.joinedAt.slice(0, 10)}
                </TableCell>
                <TableCell className="text-right">
                  <Switch
                    checked={member.isActive === 1}
                    onCheckedChange={(checked) =>
                      setActive.mutate({ memberId: member.id, active: checked })
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IconPlus,
  IconUsers,
  IconFileImport,
  IconInbox,
  IconMapPin,
} from "@tabler/icons-react";
import { trpc } from "@/router";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/app/_authed/admin/")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.prefetchQuery(
        context.trpc.admin.getPendingMembers.queryOptions(),
      ),
      context.queryClient.prefetchQuery(
        context.trpc.admin.getPendingSessions.queryOptions(),
      ),
    ]);
  },
  component: AdminOverview,
});

function AdminOverview() {
  const { data: profile } = useQuery(trpc.profile.getMyProfile.queryOptions());
  const { data: pendingMembers } = useQuery(trpc.admin.getPendingMembers.queryOptions());
  const { data: pendingSessions } = useQuery(trpc.admin.getPendingSessions.queryOptions());

  const inboxCount = (pendingMembers?.length ?? 0) + (pendingSessions?.length ?? 0);
  const isAdmin = profile?.role === "admin";

  const trainerCards = [
    {
      title: "Skrzynka odbiorcza",
      desc: "Przeglądaj i zatwierdzaj wnioski uczestników.",
      icon: <IconInbox className="size-8 text-primary" />,
      to: "/app/admin/inbox" as const,
      badge: inboxCount > 0 ? inboxCount : null,
    },
    {
      title: "Dodaj sesję",
      desc: "Zarejestruj nową sesję treningową EMS dla uczestnika.",
      icon: <IconPlus className="size-8 text-primary" />,
      to: "/app/admin/log-session" as const,
      badge: null,
    },
    {
      title: "Uczestnicy",
      desc: "Przeglądaj i zarządzaj profilami uczestników.",
      icon: <IconUsers className="size-8 text-primary" />,
      to: "/app/admin/members" as const,
      badge: null,
    },
    {
      title: "Miejsca treningowe",
      desc: "Zarządzaj lokalizacjami klubu EMS.",
      icon: <IconMapPin className="size-8 text-primary" />,
      to: "/app/admin/club-places" as const,
      badge: null,
    },
  ];

  const adminCards = [
    {
      title: "Import danych",
      desc: "Masowy import historycznych danych sesji (CSV/TSV).",
      icon: <IconFileImport className="size-8 text-primary" />,
      to: "/app/admin/import" as const,
      badge: null,
    },
  ];

  const allCards = isAdmin ? [...trainerCards, ...adminCards] : trainerCards;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">
        {isAdmin ? "Panel admina" : "Panel trenera"}
      </h1>
      <div className="grid md:grid-cols-3 gap-4">
        {allCards.map((c) => (
          <Link key={c.title} to={c.to}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardHeader className="relative">
                {c.icon}
                <CardTitle className="text-lg">{c.title}</CardTitle>
                {c.badge != null && (
                  <Badge
                    variant="destructive"
                    className="absolute top-3 right-3 size-6 justify-center p-0"
                  >
                    {c.badge}
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{c.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

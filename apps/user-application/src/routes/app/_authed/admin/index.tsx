import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconPlus, IconUsers, IconFileImport } from "@tabler/icons-react";
import { trpc } from "@/router";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/app/_authed/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const { data: profile } = useQuery(trpc.profile.getMyProfile.queryOptions());

  const trainerCards = [
    {
      title: "Log Session",
      desc: "Record a new EMS training session for a member.",
      icon: <IconPlus className="size-8 text-yellow-400" />,
      to: "/app/admin/log-session" as const,
    },
    {
      title: "Members",
      desc: "View and manage member profiles.",
      icon: <IconUsers className="size-8 text-blue-400" />,
      to: "/app/admin/members" as const,
    },
  ];

  const adminCards = [
    {
      title: "Import Data",
      desc: "Bulk import historical CSV/TSV session data.",
      icon: <IconFileImport className="size-8 text-green-400" />,
      to: "/app/admin/import" as const,
    },
  ];

  const isAdmin = profile?.role === "admin";

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">
        {isAdmin ? "Admin Panel" : "Trainer Panel"}
      </h1>
      <div className="grid md:grid-cols-3 gap-4">
        {trainerCards.map((c) => (
          <Link key={c.title} to={c.to}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardHeader>
                {c.icon}
                <CardTitle className="text-lg">{c.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{c.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
        {isAdmin &&
          adminCards.map((c) => (
            <Link key={c.title} to={c.to}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                <CardHeader>
                  {c.icon}
                  <CardTitle className="text-lg">{c.title}</CardTitle>
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

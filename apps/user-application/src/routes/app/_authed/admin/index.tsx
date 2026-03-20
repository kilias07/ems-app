import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconPlus, IconUsers, IconFileImport } from "@tabler/icons-react";

export const Route = createFileRoute("/app/_authed/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const cards = [
    {
      title: "Log Session",
      desc: "Record a new EMS training session for a member.",
      icon: <IconPlus className="size-8 text-yellow-400" />,
      href: "/app/admin/log-session",
    },
    {
      title: "Members",
      desc: "View and manage all member profiles.",
      icon: <IconUsers className="size-8 text-blue-400" />,
      href: "/app/admin/members",
    },
    {
      title: "Import Data",
      desc: "Bulk import historical CSV/TSV session data.",
      icon: <IconFileImport className="size-8 text-green-400" />,
      href: "/app/admin/import",
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
      <div className="grid md:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link key={c.title} to={c.href}>
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

import {
  IconDashboard,
  IconTrophy,
  IconHistory,
  IconUsers,
  IconFileImport,
  IconPlus,
  IconSettings,
  IconInbox,
  IconMapPin,
} from "@tabler/icons-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { trpc } from "@/router";
import { useQuery } from "@tanstack/react-query";

export function NavMain() {
  const nav = useNavigate();
  const { location } = useRouterState();

  const { data: profile } = useQuery(trpc.profile.getMyProfile.queryOptions());
  const { data: pendingMembers } = useQuery({
    ...trpc.admin.getPendingMembers.queryOptions(),
    enabled: profile?.role === "trainer" || profile?.role === "admin",
  });
  const { data: pendingSessions } = useQuery({
    ...trpc.admin.getPendingSessions.queryOptions(),
    enabled: profile?.role === "trainer" || profile?.role === "admin",
  });

  const inboxCount =
    (pendingMembers?.length ?? 0) + (pendingSessions?.length ?? 0);

  const isActive = (to: string) =>
    location.pathname === to || location.pathname === to + "/";

  const memberItems = [
    { title: "Panel główny", to: "/app/", icon: IconDashboard },
    { title: "Moje sesje", to: "/app/my-sessions", icon: IconHistory },
    { title: "Ranking", to: "/app/leaderboard", icon: IconTrophy },
    { title: "Ustawienia", to: "/app/settings", icon: IconSettings },
  ];

  const trainerItems = [
    { title: "Skrzynka", to: "/app/admin/inbox", icon: IconInbox, badge: inboxCount || null },
    { title: "Dodaj sesję", to: "/app/admin/log-session", icon: IconPlus, badge: null },
    { title: "Uczestnicy", to: "/app/admin/members", icon: IconUsers, badge: null },
    { title: "Miejsca treningowe", to: "/app/admin/club-places", icon: IconMapPin, badge: null },
  ];

  const adminItems = [
    { title: "Import danych", to: "/app/admin/import", icon: IconFileImport, badge: null },
  ];

  const isTrainerOrAdmin =
    profile?.role === "trainer" || profile?.role === "admin";
  const isAdmin = profile?.role === "admin";

  return (
    <>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {memberItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  onClick={() => nav({ to: item.to })}
                  tooltip={item.title}
                  isActive={isActive(item.to)}
                >
                  <item.icon />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {isTrainerOrAdmin && (
        <SidebarGroup>
          <SidebarGroupLabel>Trener</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {trainerItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => nav({ to: item.to })}
                    tooltip={item.title}
                    isActive={isActive(item.to)}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                  {item.badge != null && (
                    <SidebarMenuBadge className={item.badge === 0 ? "opacity-0" : ""}>
                      {item.badge}
                    </SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}

      {isAdmin && (
        <SidebarGroup>
          <SidebarGroupLabel>Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => nav({ to: item.to })}
                    tooltip={item.title}
                    isActive={isActive(item.to)}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}
    </>
  );
}

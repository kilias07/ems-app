import {
  IconDashboard,
  IconTrophy,
  IconHistory,
  IconUsers,
  IconFileImport,
  IconPlus,
} from "@tabler/icons-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
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

  const isActive = (to: string) =>
    location.pathname === to || location.pathname === to + "/";

  const memberItems = [
    { title: "Dashboard", to: "/app/", icon: IconDashboard },
    { title: "My Sessions", to: "/app/my-sessions", icon: IconHistory },
    { title: "Leaderboard", to: "/app/leaderboard", icon: IconTrophy },
  ];

  const trainerItems = [
    { title: "Log Session", to: "/app/admin/log-session", icon: IconPlus },
    { title: "Members", to: "/app/admin/members", icon: IconUsers },
  ];

  const adminItems = [
    { title: "Import Data", to: "/app/admin/import", icon: IconFileImport },
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
          <SidebarGroupLabel>Trainer</SidebarGroupLabel>
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

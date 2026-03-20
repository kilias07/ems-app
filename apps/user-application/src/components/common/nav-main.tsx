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

  const adminItems = [
    { title: "Log Session", to: "/app/admin/log-session", icon: IconPlus },
    { title: "Members", to: "/app/admin/members", icon: IconUsers },
    { title: "Import Data", to: "/app/admin/import", icon: IconFileImport },
  ];

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

      {profile?.role === "admin" && (
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

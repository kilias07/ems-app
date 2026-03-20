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
import { useSuspenseQuery } from "@tanstack/react-query";

function NavItems() {
  const nav = useNavigate();
  const { location } = useRouterState();

  const { data: profile } = useSuspenseQuery(
    trpc.profile.getMyProfile.queryOptions(),
  );

  const memberItems = [
    {
      title: "Dashboard",
      to: "/app/",
      icon: IconDashboard,
    },
    {
      title: "My Sessions",
      to: "/app/my-sessions",
      icon: IconHistory,
    },
    {
      title: "Leaderboard",
      to: "/app/leaderboard",
      icon: IconTrophy,
    },
  ];

  const adminItems = [
    {
      title: "Log Session",
      to: "/app/admin/log-session",
      icon: IconPlus,
    },
    {
      title: "Members",
      to: "/app/admin/members",
      icon: IconUsers,
    },
    {
      title: "Import Data",
      to: "/app/admin/import",
      icon: IconFileImport,
    },
  ];

  const isActive = (to: string) => location.pathname === to;

  return (
    <SidebarGroupContent className="flex flex-col gap-2">
      <SidebarMenu>
        {memberItems.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              onClick={() => nav({ to: item.to })}
              tooltip={item.title}
              isActive={isActive(item.to)}
            >
              {item.icon && <item.icon />}
              <span>{item.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>

      {profile.role === "admin" && (
        <>
          <SidebarGroupLabel>Admin</SidebarGroupLabel>
          <SidebarMenu>
            {adminItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  onClick={() => nav({ to: item.to })}
                  tooltip={item.title}
                  isActive={isActive(item.to)}
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </>
      )}
    </SidebarGroupContent>
  );
}

export function NavMain() {
  return (
    <SidebarGroup>
      <NavItems />
    </SidebarGroup>
  );
}

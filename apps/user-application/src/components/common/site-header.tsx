import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useRouterState } from "@tanstack/react-router";

export function SiteHeader() {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  const getPageTitle = (path: string) => {
    if (path === "/app" || path === "/app/") return "Panel główny";
    if (path === "/app/my-sessions") return "Moje sesje";
    if (path === "/app/leaderboard") return "Ranking";
    if (path === "/app/settings") return "Ustawienia";
    if (path === "/app/admin" || path === "/app/admin/") return "Admin";
    if (path === "/app/admin/log-session") return "Dodaj sesję";
    if (path === "/app/admin/members") return "Uczestnicy";
    if (path === "/app/admin/import") return "Import danych";
    if (path === "/app/admin/inbox") return "Skrzynka odbiorcza";
    if (path === "/app/admin/club-places") return "Miejsca treningowe";
    if (path === "/app/pending") return "Oczekiwanie na akceptację";
    return "EMS Studio";
  };

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{getPageTitle(pathname)}</h1>
      </div>
    </header>
  );
}

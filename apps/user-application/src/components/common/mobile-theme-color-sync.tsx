import { useEffect, useRef } from "react";
import { useSidebar } from "@/components/ui/sidebar";

export function MobileThemeColorSync() {
  const { isMobile, openMobile } = useSidebar();
  const originalRef = useRef<string | null>(null);

  useEffect(() => {
    const meta = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]',
    );
    if (!meta) return;

    if (originalRef.current === null) {
      originalRef.current = meta.getAttribute("content") ?? "";
    }

    if (isMobile && openMobile) {
      const sidebarColor = getComputedStyle(document.documentElement)
        .getPropertyValue("--sidebar")
        .trim();
      if (sidebarColor) meta.setAttribute("content", sidebarColor);
    } else {
      meta.setAttribute("content", originalRef.current);
    }

    return () => {
      if (originalRef.current !== null) {
        meta.setAttribute("content", originalRef.current);
      }
    };
  }, [isMobile, openMobile]);

  return null;
}

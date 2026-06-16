import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Sidebar, MobileSidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { useSidebar } from "./useSidebar";

// Routes that auto-collapse the sidebar for maximum content space
const IMMERSIVE_ROUTES = [/^\/documents\/\d+$/];

function isImmersive(pathname) {
  return IMMERSIVE_ROUTES.some((pattern) => pattern.test(pathname));
}

export function DashboardLayout({ children }) {
  const { collapsed, toggle, setCollapsed, mobileOpen, openMobile, closeMobile } = useSidebar();
  const location = useLocation();
  const autoCollapsed = useRef(false);

  useEffect(() => {
    // Close mobile drawer on route change
    closeMobile();

    if (isImmersive(location.pathname)) {
      if (!collapsed) {
        autoCollapsed.current = true;
        setCollapsed(true);
      }
    } else {
      if (autoCollapsed.current) {
        autoCollapsed.current = false;
        setCollapsed(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Desktop sidebar */}
      <Sidebar collapsed={collapsed} onToggle={toggle} />

      {/* Mobile drawer */}
      <MobileSidebar open={mobileOpen} onClose={closeMobile} />

      <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden">
        <Navbar onMenuClick={openMobile} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
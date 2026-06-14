import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { useSidebar } from "./useSidebar";

// Routes that should auto-collapse the sidebar for maximum content space
const IMMERSIVE_ROUTES = [/^\/documents\/\d+$/];

function isImmersive(pathname) {
  return IMMERSIVE_ROUTES.some((pattern) => pattern.test(pathname));
}

export function DashboardLayout({ children }) {
  const { collapsed, toggle, setCollapsed } = useSidebar();
  const location = useLocation();

  // Track whether we auto-collapsed so we can restore on exit
  const autoCollapsed = useRef(false);

  useEffect(() => {
    if (isImmersive(location.pathname)) {
      // Entering a document detail — collapse if currently expanded
      if (!collapsed) {
        autoCollapsed.current = true;
        setCollapsed(true);
      }
    } else {
      // Leaving an immersive route — restore if we were the ones who collapsed it
      if (autoCollapsed.current) {
        autoCollapsed.current = false;
        setCollapsed(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <Sidebar collapsed={collapsed} onToggle={toggle} />
      <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
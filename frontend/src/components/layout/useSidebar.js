import { useState, useEffect } from "react";

const STORAGE_KEY = "sidebarCollapsed";

export function useSidebar() {
  const [collapsed, setCollapsedState] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) === "true"; }
    catch { return false; }
  });

  // Mobile drawer open state (separate from desktop collapse)
  const [mobileOpen, setMobileOpen] = useState(false);

  const setCollapsed = (value) => {
    setCollapsedState(value);
    try { localStorage.setItem(STORAGE_KEY, String(value)); } catch {}
  };

  const toggle = () => setCollapsed(!collapsed);

  const openMobile = () => setMobileOpen(true);
  const closeMobile = () => setMobileOpen(false);

  return { collapsed, toggle, setCollapsed, mobileOpen, openMobile, closeMobile };
}

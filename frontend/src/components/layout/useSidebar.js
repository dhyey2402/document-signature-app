import { useState, useEffect } from "react";

const STORAGE_KEY = "sidebarCollapsed";

export function useSidebar() {
  const [collapsed, setCollapsedState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  const setCollapsed = (value) => {
    setCollapsedState(value);
    try {
      localStorage.setItem(STORAGE_KEY, String(value));
    } catch {
      // ignore storage errors
    }
  };

  const toggle = () => setCollapsed(!collapsed);

  return { collapsed, toggle, setCollapsed };
}

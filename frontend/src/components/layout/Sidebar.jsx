import { NavLink } from "react-router-dom";
import { useContext } from "react";
import {
  LayoutDashboard,
  FileText,
  Upload,
  Users,
  CheckSquare,
  Settings,
  Bell,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { AuthContext } from "../../context/AuthContext";

const navItems = [
  { name: "Dashboard",     href: "/dashboard",     icon: LayoutDashboard },
  { name: "Documents",     href: "/documents",     icon: FileText },
  { name: "Upload",        href: "/upload",        icon: Upload },
  { name: "Recipients",   href: "/recipients",    icon: Users },
  { name: "Workflows",     href: "/workflows",     icon: CheckSquare },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Settings",      href: "/settings",      icon: Settings },
];

export function Sidebar({ collapsed, onToggle }) {
  const { user } = useContext(AuthContext);

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <aside
      className={cn(
        // Base — always visible on md+, hidden on mobile (drawer handled separately)
        "hidden md:flex flex-col h-screen border-r border-border bg-background",
        "transition-[width] duration-300 ease-in-out overflow-hidden flex-shrink-0",
        collapsed ? "w-[68px]" : "w-64"
      )}
    >
      {/* ── Top: logo + toggle ── */}
      {collapsed ? (
        /* Collapsed header: icon + expand button stacked, centered */
        <div className="flex flex-col items-center gap-1 py-3 border-b border-border flex-shrink-0">
          <img
            src="/icon.png"
            alt="SignFlow icon"
            className="h-10 w-10 object-contain select-none"
            draggable={false}
          />
          <button
            onClick={onToggle}
            title="Expand sidebar"
            className="flex items-center justify-center rounded-lg w-8 h-8 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        </div>
      ) : (
        /* Expanded header: icon + wordmark left, collapse button right */
        <div className="flex items-center justify-between h-16 border-b border-border flex-shrink-0 px-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src="/icon.png"
              alt="SignFlow icon"
              className="h-10 w-10 object-contain flex-shrink-0 select-none"
              draggable={false}
            />
            <span className="whitespace-nowrap select-none leading-none">
              <span className="font-black text-[20px] text-slate-800 dark:text-slate-100 tracking-tight">Sign</span>
              <span className="font-light text-[20px] bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent tracking-tight">Flow</span>
            </span>
          </div>
          <button
            onClick={onToggle}
            title="Collapse sidebar"
            className="flex items-center justify-center rounded-lg w-8 h-8 flex-shrink-0 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── Nav items ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            title={collapsed ? item.name : undefined}
            className={({ isActive }) =>
              cn(
                "group relative flex items-center rounded-xl py-2 text-sm font-medium",
                "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50",
                "transition-colors duration-150",
                collapsed ? "justify-center px-2" : "px-3 gap-3",
                isActive
                  ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400"
                  : "text-slate-600 dark:text-slate-400"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={cn(
                    "flex-shrink-0 h-[18px] w-[18px]",
                    isActive
                      ? "text-primary-600 dark:text-primary-400"
                      : "text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200"
                  )}
                />

                {/* Label — hidden when collapsed */}
                {!collapsed && (
                  <span className="truncate">{item.name}</span>
                )}

                {/* Tooltip — only when collapsed */}
                {collapsed && (
                  <span
                    className={cn(
                      "pointer-events-none absolute left-full ml-2 z-50",
                      "rounded-md bg-slate-900 dark:bg-slate-100 px-2 py-1",
                      "text-xs font-medium text-white dark:text-slate-900 whitespace-nowrap",
                      "shadow-lg opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100",
                      "transition-all duration-150 origin-left"
                    )}
                  >
                    {item.name}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── User profile footer ── */}
      <div
        className={cn(
          "border-t border-border flex-shrink-0",
          collapsed ? "p-2" : "p-4"
        )}
      >
        <div
          className={cn(
            "flex items-center rounded-xl",
            collapsed ? "justify-center p-1.5" : "gap-3"
          )}
          title={collapsed ? (user?.name || "User") : undefined}
        >
          {/* Avatar circle */}
          <div
            className={cn(
              "flex-shrink-0 rounded-full bg-primary-100 dark:bg-primary-900/40",
              "flex items-center justify-center",
              "text-primary-600 dark:text-primary-400 font-bold select-none",
              collapsed ? "h-9 w-9 text-sm" : "h-9 w-9 text-sm"
            )}
          >
            {initials}
          </div>

          {/* Name + plan — hidden when collapsed */}
          {!collapsed && (
            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="text-sm font-semibold truncate text-slate-800 dark:text-slate-100">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-slate-500 truncate">{user?.email || ""}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

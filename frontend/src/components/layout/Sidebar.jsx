import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  Upload, 
  Users, 
  CheckSquare, 
  Settings 
} from "lucide-react";
import { cn } from "../../lib/utils";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Documents", href: "/documents", icon: FileText },
  { name: "Upload", href: "/upload", icon: Upload },
  { name: "Recipients", href: "/recipients", icon: Users },
  { name: "Workflows", href: "/workflows", icon: CheckSquare },
  { name: "Notifications", href: "/notifications", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar({ className }) {
  return (
    <div className={cn("pb-12 w-64 border-r border-border bg-background h-screen flex flex-col hidden md:flex", className)}>
      <div className="space-y-4 py-4 flex-1">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-xl font-bold tracking-tight text-primary-600">
            SignFlow
          </h2>
          <div className="space-y-1 mt-6">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center rounded-xl px-4 py-2 text-sm font-medium hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50 transition-colors",
                    isActive ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400" : "text-slate-600 dark:text-slate-400"
                  )
                }
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div>
            <p className="text-sm font-medium">User</p>
            <p className="text-xs text-slate-500">Free Plan</p>
          </div>
        </div>
      </div>
    </div>
  );
}

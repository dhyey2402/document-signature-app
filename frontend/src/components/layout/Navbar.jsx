import { Bell, Search, Sun, Moon } from "lucide-react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/Avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/DropdownMenu";
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { getNotifications } from "../../services/documentService";

export function Navbar({ className }) {
  const [isDark, setIsDark] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const navigate = useNavigate();
  const { logout, user } = useContext(AuthContext);
 
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark" || (!savedTheme && document.documentElement.classList.contains("dark"))) {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    } else {
      // Default to initial HTML class
      if (document.documentElement.classList.contains("dark")) {
        setIsDark(true);
      }
    }
  }, []);

  // Check for unread notifications
  useEffect(() => {
    if (!user) return;
    
    getNotifications().then((res) => {
      const events = res.data;
      if (!events || events.length === 0) return;
      
      let readIds = new Set();
      try { 
        readIds = new Set(JSON.parse(localStorage.getItem("notif_read") || "[]")); 
      } catch {}
      
      const unread = events.some((e) => !readIds.has(e.id));
      setHasUnread(unread);
    }).catch(() => {});
  }, [user]);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      navigate(`/documents?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery(""); // Clear after searching
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-6 gap-4">
        <div className="flex flex-1 items-center gap-4">
          <div className="w-full max-w-sm relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input 
              type="search" 
              placeholder="Search documents... (Press Enter)" 
              className="pl-9 bg-slate-100/50 dark:bg-slate-800/50 border-transparent focus-visible:border-ring focus-visible:ring-0" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
          
          <Button variant="ghost" size="icon" className="relative" onClick={() => navigate("/notifications")}>
            <Bell className="h-5 w-5" />
            {hasUnread && (
              <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-error" />
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10 border border-border">
                  <AvatarFallback className="bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 font-semibold">
                    {user?.name ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "?"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-2">
                <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
                <p className="text-xs leading-none text-slate-500">{user?.email || "user@example.com"}</p>
              </DropdownMenuItem>
              <div className="h-px bg-border my-1" />
              <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/settings")}>
                Profile Settings
              </DropdownMenuItem>
              <div className="h-px bg-border my-1" />
              <DropdownMenuItem className="text-error focus:text-error cursor-pointer" onClick={handleLogout}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

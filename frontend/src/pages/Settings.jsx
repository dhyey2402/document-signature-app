import { useState, useEffect, useContext } from "react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Avatar, AvatarFallback } from "../components/ui/Avatar";
import { User, Bell, Shield, Check, Info } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";

// Default notification preferences
const DEFAULT_NOTIF_PREFS = {
  documentSigned: true,
  documentViewed: false,
  documentRejected: true,
};

export default function Settings() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("profile");

  // Derive first/last name from the single `name` field
  const nameParts = (user?.name || "").trim().split(/\s+/);
  const [firstName, setFirstName] = useState(nameParts[0] || "");
  const [lastName, setLastName] = useState(nameParts.slice(1).join(" ") || "");

  useEffect(() => {
    if (user?.name) {
      const parts = user.name.trim().split(/\s+/);
      setFirstName(parts[0] || "");
      setLastName(parts.slice(1).join(" ") || "");
    }
  }, [user]);

  // Password fields
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  // Notification preferences with real local state
  const [notifPrefs, setNotifPrefs] = useState(() => {
    try {
      const saved = localStorage.getItem("notif_prefs");
      return saved ? { ...DEFAULT_NOTIF_PREFS, ...JSON.parse(saved) } : DEFAULT_NOTIF_PREFS;
    } catch {
      return DEFAULT_NOTIF_PREFS;
    }
  });

  const togglePref = (key) => {
    setNotifPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try { localStorage.setItem("notif_prefs", JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
  ];

  const handleSaveProfile = () => {
    // Name changes are display-only — no backend endpoint exists yet
    toast.success("Display name updated locally.");
  };

  const handleUpdatePassword = () => {
    if (!currentPw || !newPw || !confirmPw) {
      toast.error("Please fill in all password fields.");
      return;
    }
    if (newPw !== confirmPw) {
      toast.error("New passwords do not match.");
      return;
    }
    if (newPw.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    // Placeholder — no backend change-password endpoint yet
    toast("Password change requires re-authentication. Feature coming soon.", { icon: "🔒" });
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account settings and preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Tab nav */}
        <div className="w-full md:w-56 space-y-1 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 space-y-6">

          {/* ── Profile ── */}
          {activeTab === "profile" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {/* Avatar */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Picture</CardTitle>
                  <CardDescription>Your avatar is generated from your initials.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-6">
                  <Avatar className="h-20 w-20 border-4 border-slate-50 dark:border-slate-900 shadow-sm">
                    <AvatarFallback className="text-2xl bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{user?.name || "—"}</p>
                    <p className="text-sm text-slate-500">{user?.email || "—"}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Personal info */}
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Your account information from registration.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Info notice */}
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs">
                    <Info className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>Display name edits are local only. Email cannot be changed.</span>
                  </div>

                  {!user ? (
                    <p className="text-sm text-slate-500">Loading user data…</p>
                  ) : (
                    <>
                      <div className="grid md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">First Name</label>
                          <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Last Name</label>
                          <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                        <Input value={user?.email || ""} type="email" readOnly className="bg-slate-50 dark:bg-slate-800 cursor-not-allowed opacity-70" />
                        <p className="text-xs text-slate-400">Email cannot be changed.</p>
                      </div>
                    </>
                  )}
                </CardContent>
                <CardFooter className="border-t border-border bg-slate-50/50 dark:bg-slate-900/50 px-6 py-4">
                  <Button className="ml-auto" onClick={handleSaveProfile} disabled={!user}>
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {/* ── Notifications ── */}
          {activeTab === "notifications" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <Card>
                <CardHeader>
                  <CardTitle>Email Notification Preferences</CardTitle>
                  <CardDescription>Configure which events trigger email alerts. Preferences are saved locally.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { key: "documentSigned", label: "Document Signed", desc: "When a recipient signs a document." },
                    { key: "documentViewed", label: "Document Viewed", desc: "When a recipient opens a signing link." },
                    { key: "documentRejected", label: "Document Rejected", desc: "When a document is rejected." },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 rounded-xl border border-border">
                      <div>
                        <p className="font-medium text-sm">{item.label}</p>
                        <p className="text-sm text-slate-500">{item.desc}</p>
                      </div>
                      {/* Real interactive toggle */}
                      <button
                        onClick={() => togglePref(item.key)}
                        className={`relative h-6 w-11 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                          notifPrefs[item.key] ? "bg-primary-600" : "bg-slate-300 dark:bg-slate-600"
                        }`}
                        aria-checked={notifPrefs[item.key]}
                        role="switch"
                      >
                        <span
                          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${
                            notifPrefs[item.key] ? "left-6" : "left-1"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── Security ── */}
          {activeTab === "security" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your account password.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Current Password</label>
                    <Input type="password" placeholder="••••••••" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} />
                  </div>
                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">New Password</label>
                      <Input type="password" placeholder="••••••••" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Confirm New Password</label>
                      <Input type="password" placeholder="••••••••" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
                    </div>
                  </div>
                  {newPw && confirmPw && newPw !== confirmPw && (
                    <p className="text-xs text-red-500">Passwords do not match.</p>
                  )}
                </CardContent>
                <CardFooter className="border-t border-border bg-slate-50/50 dark:bg-slate-900/50 px-6 py-4">
                  <Button className="ml-auto" onClick={handleUpdatePassword}>Update Password</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                      <Check className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-base font-semibold">Account Active</h4>
                      <p className="text-sm text-slate-500 mt-1">
                        Logged in as <span className="font-medium text-slate-700 dark:text-slate-300">{user?.email}</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

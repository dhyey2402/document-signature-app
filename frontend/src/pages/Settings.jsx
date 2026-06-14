import { useState, useEffect, useContext } from "react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Avatar, AvatarFallback } from "../components/ui/Avatar";
import { User, Bell, Shield, Check } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Settings() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("profile");

  // Derive first/last name from the single `name` field
  const nameParts = (user?.name || "").trim().split(/\s+/);
  const derivedFirst = nameParts[0] || "";
  const derivedLast = nameParts.slice(1).join(" ") || "";

  const [firstName, setFirstName] = useState(derivedFirst);
  const [lastName, setLastName] = useState(derivedLast);

  // Sync if user loads after mount
  useEffect(() => {
    if (user?.name) {
      const parts = user.name.trim().split(/\s+/);
      setFirstName(parts[0] || "");
      setLastName(parts.slice(1).join(" ") || "");
    }
  }, [user]);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
  ];

  const handleSaveProfile = () => {
    toast.success("Profile display updated.");
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
    toast.success("Password updated. (UI only — backend endpoint not yet wired.)");
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
        {/* Sidebar nav */}
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
                  {!user ? (
                    <p className="text-sm text-slate-500">Loading user data...</p>
                  ) : (
                    <>
                      <div className="grid md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">First Name</label>
                          <Input
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="First name"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Last Name</label>
                          <Input
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Last name"
                          />
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

          {activeTab === "notifications" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <Card>
                <CardHeader>
                  <CardTitle>Email Notification Preferences</CardTitle>
                  <CardDescription>Configure which events trigger email alerts.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "Document Signed", desc: "When a recipient signs a document." },
                    { label: "Document Viewed", desc: "When a recipient opens a signing link." },
                    { label: "Document Rejected", desc: "When a document is rejected." },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-4 rounded-xl border border-border">
                      <div>
                        <p className="font-medium text-sm">{item.label}</p>
                        <p className="text-sm text-slate-500">{item.desc}</p>
                      </div>
                      <div className="h-6 w-11 rounded-full bg-primary-600 relative cursor-pointer flex-shrink-0">
                        <div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

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

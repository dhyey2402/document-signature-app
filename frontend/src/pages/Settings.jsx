import { useState } from "react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/Avatar";
import { User, Building2, Bell, Shield, UploadCloud, Check } from "lucide-react";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "company", label: "Company Details", icon: Building2 },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account settings and preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 space-y-1 shrink-0">
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
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Picture</CardTitle>
                  <CardDescription>Upload a professional photo for your signatures.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-6">
                  <Avatar className="h-24 w-24 border-4 border-slate-50 dark:border-slate-900 shadow-sm">
                    <AvatarImage src="/placeholder-avatar.jpg" alt="@user" />
                    <AvatarFallback className="text-2xl">RU</AvatarFallback>
                  </Avatar>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Button size="sm">
                        <UploadCloud className="mr-2 h-4 w-4" /> Upload new
                      </Button>
                      <Button variant="outline" size="sm" className="text-error border-error/20 hover:bg-error/10 hover:text-error">
                        Remove
                      </Button>
                    </div>
                    <p className="text-xs text-slate-500">Recommended size is 256x256px. Maximum file size is 2MB.</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal details and contact info.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">First Name</label>
                      <Input defaultValue="User" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Last Name</label>
                      <Input defaultValue="User" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                    <Input defaultValue="user@example.com" type="email" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Job Title</label>
                    <Input defaultValue="Administrator" />
                  </div>
                </CardContent>
                <CardFooter className="border-t border-border bg-slate-50/50 dark:bg-slate-900/50 px-6 py-4">
                  <Button className="ml-auto">Save Changes</Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {activeTab === "company" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card>
                <CardHeader>
                  <CardTitle>Company Details</CardTitle>
                  <CardDescription>Information about your organization.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Company Name</label>
                    <Input defaultValue="TechCorp Solutions Inc." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Website</label>
                    <Input defaultValue="https://techcorp.example.com" type="url" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Billing Email</label>
                    <Input defaultValue="billing@techcorp.example.com" type="email" />
                  </div>
                </CardContent>
                <CardFooter className="border-t border-border bg-slate-50/50 dark:bg-slate-900/50 px-6 py-4">
                  <Button className="ml-auto">Save Company Info</Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card>
                <CardHeader>
                  <CardTitle>Email Notifications</CardTitle>
                  <CardDescription>Choose what updates you want to receive via email.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                    <div>
                      <p className="font-medium text-sm">Document Signed</p>
                      <p className="text-sm text-slate-500">Receive an email when a recipient signs a document.</p>
                    </div>
                    <div className="h-6 w-11 rounded-full bg-primary-600 relative cursor-pointer">
                      <div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white transition-all shadow-sm" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                    <div>
                      <p className="font-medium text-sm">Document Viewed</p>
                      <p className="text-sm text-slate-500">Receive an email when a recipient opens your document.</p>
                    </div>
                    <div className="h-6 w-11 rounded-full bg-slate-200 dark:bg-slate-700 relative cursor-pointer transition-colors">
                      <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-all shadow-sm" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                    <div>
                      <p className="font-medium text-sm">Daily Digest</p>
                      <p className="text-sm text-slate-500">Receive a daily summary of all signature activity.</p>
                    </div>
                    <div className="h-6 w-11 rounded-full bg-slate-200 dark:bg-slate-700 relative cursor-pointer transition-colors">
                      <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-all shadow-sm" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card>
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>Manage your password and security settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Current Password</label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">New Password</label>
                      <Input type="password" placeholder="••••••••" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Confirm New Password</label>
                      <Input type="password" placeholder="••••••••" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t border-border bg-slate-50/50 dark:bg-slate-900/50 px-6 py-4">
                  <Button className="ml-auto">Update Password</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                      <Check className="h-6 w-6 text-success" />
                    </div>
                    <div>
                      <h4 className="text-base font-semibold">Two-Factor Authentication (2FA)</h4>
                      <p className="text-sm text-slate-500 mt-1">
                        Your account is currently protected with two-factor authentication via Authenticator App.
                      </p>
                    </div>
                    <Button variant="outline" className="ml-auto shrink-0">Manage 2FA</Button>
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

import { useState } from "react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Bell, CheckCircle } from "lucide-react";
import { cn } from "../lib/utils";

const initialNotifications = [
  {
    id: 1,
    title: "Document Signed",
    message: "John Doe has signed the Service Agreement.",
    date: "2 hours ago",
    read: false,
  },
  {
    id: 2,
    title: "Signature Request Viewed",
    message: "Jane Smith viewed the NDA.",
    date: "5 hours ago",
    read: true,
  },
  {
    id: 3,
    title: "Document Uploaded",
    message: "You successfully uploaded 'Q3 Contract'.",
    date: "1 day ago",
    read: true,
  },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState(initialNotifications);

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <DashboardLayout>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <span className="bg-primary-100 text-primary-700 text-sm font-medium px-2.5 py-0.5 rounded-full dark:bg-primary-900/30 dark:text-primary-400">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-slate-500 mt-1">Stay updated on your document workflows.</p>
        </div>
        {notifications.length > 0 && unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            Mark all as read
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <Bell className="h-6 w-6 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold">No notifications yet</h3>
              <p className="text-slate-500 text-sm mt-1">When there's activity on your documents, it will show up here.</p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={cn(
                "transition-colors",
                !notification.read ? "bg-primary-50/50 dark:bg-primary-900/10 border-primary-200 dark:border-primary-800" : ""
              )}
            >
              <CardContent className="p-4 flex items-start justify-between gap-4">
                <div className="flex gap-4">
                  <div className={cn(
                    "mt-1 h-2 w-2 rounded-full",
                    !notification.read ? "bg-primary-500" : "bg-transparent"
                  )} />
                  <div>
                    <h4 className={cn("font-medium", !notification.read ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300")}>
                      {notification.title}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{notification.message}</p>
                    <p className="text-xs text-slate-400 mt-2">{notification.date}</p>
                  </div>
                </div>
                {!notification.read && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    onClick={() => markAsRead(notification.id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark read
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}

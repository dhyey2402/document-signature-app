import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Bell, CheckCircle, FileText, Eye, Upload, XCircle, Link2 } from "lucide-react";
import { cn } from "../lib/utils";
import { getNotifications } from "../services/documentService";
import toast from "react-hot-toast";

const ACTION_META = {
  DOCUMENT_UPLOADED:          { label: "Document Uploaded",    icon: Upload,      color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20" },
  SIGNING_LINK_CREATED:       { label: "Signing Link Created", icon: Link2,       color: "text-sky-600 bg-sky-50 dark:bg-sky-900/20" },
  DOCUMENT_VIEWED:            { label: "Document Viewed",      icon: Eye,         color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20" },
  DOCUMENT_SIGNED:            { label: "Document Signed",      icon: CheckCircle, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" },
  DOCUMENT_REJECTED:          { label: "Document Rejected",    icon: XCircle,     color: "text-red-600 bg-red-50 dark:bg-red-900/20" },
  DOCUMENT_DOWNLOADED:        { label: "Downloaded",           icon: FileText,    color: "text-slate-600 bg-slate-100 dark:bg-slate-800" },
  SIGNATURE_PLACED:           { label: "Signature Placed",     icon: FileText,    color: "text-violet-600 bg-violet-50 dark:bg-violet-900/20" },
  SIGNED_DOCUMENT_DOWNLOADED: { label: "Signed PDF Downloaded",icon: FileText,    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" },
};

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function Notifications() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [readIds, setReadIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("notif_read") || "[]")); }
    catch { return new Set(); }
  });

  const persistRead = (ids) => {
    try { localStorage.setItem("notif_read", JSON.stringify([...ids])); } catch {}
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await getNotifications();
        setEvents(res.data);
      } catch {
        toast.error("Failed to load notifications.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const markRead = (id) => {
    const next = new Set(readIds).add(id);
    setReadIds(next);
    persistRead(next);
  };

  const markAllRead = () => {
    const next = new Set(events.map((e) => e.id));
    setReadIds(next);
    persistRead(next);
  };

  const unreadCount = events.filter((e) => !readIds.has(e.id)).length;

  return (
    <DashboardLayout>
      <div className="mb-8 flex justify-between items-end flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <span className="bg-primary-100 text-primary-700 text-sm font-medium px-2.5 py-0.5 rounded-full dark:bg-primary-900/30 dark:text-primary-400">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-slate-500 mt-1">Live document activity across your workspace.</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>Mark all as read</Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-14 w-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <Bell className="h-7 w-7 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold">No activity yet</h3>
            <p className="text-slate-500 text-sm mt-1">Upload a document to start seeing events here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const isRead = readIds.has(event.id);
            const meta = ACTION_META[event.action] || { label: event.action, icon: Bell, color: "text-slate-500 bg-slate-100" };
            const Icon = meta.icon;
            return (
              <Card
                key={event.id}
                className={cn(
                  "transition-colors cursor-default",
                  !isRead ? "border-primary-200 dark:border-primary-800 bg-primary-50/40 dark:bg-primary-900/10" : ""
                )}
              >
                <CardContent className="p-4 flex items-start gap-4">
                  {/* Unread dot */}
                  <div className={cn("mt-2 h-2 w-2 rounded-full shrink-0", !isRead ? "bg-primary-500" : "bg-transparent")} />

                  {/* Icon */}
                  <div className={cn("mt-0.5 h-9 w-9 rounded-lg flex items-center justify-center shrink-0", meta.color)}>
                    <Icon className="h-4 w-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <h4 className={cn("font-semibold text-sm", !isRead ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300")}>
                        {meta.label}
                        {event.document_title && (
                          <span className="font-normal text-slate-500 ml-1">— {event.document_title}</span>
                        )}
                      </h4>
                      <time className="text-xs text-slate-400 shrink-0">{timeAgo(event.created_at)}</time>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{event.description}</p>
                    {event.document_id && (
                      <Link
                        to={`/documents/${event.document_id}`}
                        className="text-xs text-primary-600 hover:underline mt-1 inline-block"
                      >
                        View document →
                      </Link>
                    )}
                  </div>

                  {/* Mark read */}
                  {!isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                      onClick={() => markRead(event.id)}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}

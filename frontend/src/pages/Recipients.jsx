import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { getSigningLinks } from "../services/documentService";
import { Users, Mail, Calendar, FileText, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "../lib/utils";

const statusVariant = (s) => {
  if (s === "signed") return "success";
  if (s === "expired") return "destructive";
  return "pending";
};

export default function Recipients() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    (async () => {
      try {
        const res = await getSigningLinks();
        setLinks(res.data);
      } catch {
        toast.error("Failed to load recipients.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filters = ["all", "pending", "signed", "expired"];

  const visible = filter === "all"
    ? links
    : links.filter((l) => l.status === filter);

  const counts = {
    all: links.length,
    pending: links.filter((l) => l.status === "pending").length,
    signed: links.filter((l) => l.status === "signed").length,
    expired: links.filter((l) => l.status === "expired").length,
  };

  const initials = (name) =>
    (name || "?").trim().split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Recipients</h1>
        <p className="text-slate-500 mt-1">Everyone who has been sent a signing request.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors",
              filter === f
                ? "bg-primary-600 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            )}
          >
            {f} {counts[f] > 0 && <span className="ml-1 opacity-70">({counts[f]})</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-52 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-14 w-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <Users className="h-7 w-7 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold">No recipients yet</h3>
            <p className="text-slate-500 text-sm mt-1">
              {filter === "all"
                ? "Send a signing request from a document to see recipients here."
                : `No ${filter} recipients found.`}
            </p>
            {filter === "all" && (
              <Button className="mt-4" asChild>
                <Link to="/documents">Go to Documents</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((link) => (
            <Card key={link.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-lg">
                    {initials(link.recipient_name)}
                  </div>
                  <Badge variant={statusVariant(link.status)} className="capitalize">
                    {link.status}
                  </Badge>
                </div>

                <h3 className="font-semibold text-base">{link.recipient_name}</h3>

                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{link.recipient_email}</span>
                  </div>
                  {link.document_title && (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <FileText className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{link.document_title}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    <span>Sent {new Date(link.created_at).toLocaleDateString()}</span>
                  </div>
                  {link.signed_at && (
                    <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      <span>Signed {new Date(link.signed_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link to={`/documents/${link.document_id}`}>
                      View Document <ArrowRight className="ml-2 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

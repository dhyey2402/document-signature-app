import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { getDocuments } from "../services/documentService";
import { CheckSquare, Clock, CheckCircle, XCircle, FileText, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "../lib/utils";

const statusMeta = {
  pending: { label: "Pending",  variant: "pending",     icon: Clock,        color: "text-amber-600" },
  signed:  { label: "Signed",   variant: "success",     icon: CheckCircle,  color: "text-emerald-600" },
  rejected:{ label: "Rejected", variant: "destructive", icon: XCircle,      color: "text-red-600" },
  draft:   { label: "Pending",  variant: "pending",     icon: Clock,        color: "text-amber-600" },
};

const normalize = (s) => {
  const v = String(s || "").toLowerCase();
  return v === "draft" ? "pending" : v;
};

export default function Workflows() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    (async () => {
      try {
        const res = await getDocuments();
        setDocuments(res.data);
      } catch {
        toast.error("Failed to load workflows.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filters = ["all", "pending", "signed", "rejected"];

  const visible = filter === "all"
    ? documents
    : documents.filter((d) => normalize(d.status) === filter);

  const counts = {
    all:      documents.length,
    pending:  documents.filter((d) => normalize(d.status) === "pending").length,
    signed:   documents.filter((d) => normalize(d.status) === "signed").length,
    rejected: documents.filter((d) => normalize(d.status) === "rejected").length,
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Document Workflows</h1>
        <p className="text-slate-500 mt-1">Track every document through its lifecycle.</p>
      </div>

      {/* Status summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { key: "all",      label: "Total",    icon: FileText,     bg: "bg-slate-100 dark:bg-slate-800",       fg: "text-slate-600 dark:text-slate-400" },
          { key: "pending",  label: "Pending",  icon: Clock,        bg: "bg-amber-50 dark:bg-amber-900/20",     fg: "text-amber-600" },
          { key: "signed",   label: "Signed",   icon: CheckCircle,  bg: "bg-emerald-50 dark:bg-emerald-900/20", fg: "text-emerald-600" },
          { key: "rejected", label: "Rejected", icon: XCircle,      bg: "bg-red-50 dark:bg-red-900/20",         fg: "text-red-600" },
        ].map(({ key, label, icon: Icon, bg, fg }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={cn(
              "text-left p-4 rounded-2xl border transition-all",
              filter === key
                ? "border-primary-400 ring-2 ring-primary-200 dark:ring-primary-800"
                : "border-border hover:border-slate-300 dark:hover:border-slate-600"
            )}
          >
            <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center mb-3", bg)}>
              <Icon className={cn("h-5 w-5", fg)} />
            </div>
            <div className="text-2xl font-bold">{loading ? "—" : counts[key]}</div>
            <div className="text-sm text-slate-500 mt-0.5">{label}</div>
          </button>
        ))}
      </div>

      {/* Document table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-14 w-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <CheckSquare className="h-7 w-7 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold">
              {filter === "all" ? "No documents yet" : `No ${filter} documents`}
            </h3>
            <p className="text-slate-500 text-sm mt-1">
              {filter === "all" ? "Upload a document to start a workflow." : "Try a different filter."}
            </p>
            {filter === "all" && (
              <Button className="mt-4" asChild>
                <Link to="/upload">Upload Document</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {filter === "all" ? "All Documents" : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Documents`}
            </CardTitle>
            <CardDescription>{visible.length} document{visible.length !== 1 && "s"}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {visible.map((doc) => {
                const status = normalize(doc.status);
                const meta = statusMeta[status] || statusMeta.pending;
                const Icon = meta.icon;
                return (
                  <div key={doc.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center shrink-0", {
                      "bg-amber-50 dark:bg-amber-900/20": status === "pending",
                      "bg-emerald-50 dark:bg-emerald-900/20": status === "signed",
                      "bg-red-50 dark:bg-red-900/20": status === "rejected",
                    })}>
                      <Icon className={cn("h-4 w-4", meta.color)} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{doc.title}</p>
                      <p className="text-xs text-slate-400 truncate">{doc.file_name}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <Badge variant={meta.variant} className="hidden sm:inline-flex capitalize">
                        {meta.label}
                      </Badge>
                      <span className="text-xs text-slate-400 hidden md:block">
                        {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : "—"}
                      </span>
                      <Button variant="ghost" size="sm" className="text-primary-600" asChild>
                        <Link to={`/documents/${doc.id}`}>
                          View <ArrowRight className="ml-1 h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}

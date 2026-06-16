import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  ArrowRight,
  Upload,
  CheckSquare,
  Users,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import toast from "react-hot-toast";
import { getDocuments, downloadDashboardReport } from "../services/documentService";
import { cn } from "../lib/utils";

// Map normalized status → badge variant
const statusVariant = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "signed") return "success";
  if (s === "rejected") return "destructive";
  return "pending";
};

// Map normalized status → display label
const statusLabel = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "signed") return "Signed";
  if (s === "rejected") return "Rejected";
  return "Pending";
};

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        <div className="h-4 w-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const { user } = useContext(AuthContext);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDownloadingReport, setIsDownloadingReport] = useState(false);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDocuments();
      setDocuments(res.data);
    } catch {
      setError("Failed to load dashboard data.");
      toast.error("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalDocuments = documents.length;
  const pendingDocuments = documents.filter((d) =>
    ["draft", "pending"].includes(String(d.status || "").toLowerCase())
  ).length;
  const completedDocuments = documents.filter(
    (d) => String(d.status || "").toLowerCase() === "signed"
  ).length;
  const rejectedDocuments = documents.filter(
    (d) => String(d.status || "").toLowerCase() === "rejected"
  ).length;

  const recentDocs = [...documents]
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    .slice(0, 5);

  const handleDownloadReport = async () => {
    setIsDownloadingReport(true);
    const toastId = toast.loading("Generating PDF report…");
    try {
      const res = await downloadDashboardReport();
      const blob = res.data;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const date = new Date().toISOString().split("T")[0];
      a.download = `Signly_Report_${date}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Report downloaded!", { id: toastId });
    } catch (err) {
      toast.error("Failed to generate report. Please try again.", { id: toastId });
    } finally {
      setIsDownloadingReport(false);
    }
  };

  const statCards = [
    {
      label: "Total Documents",
      value: totalDocuments,
      icon: FileText,
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Pending Signatures",
      value: pendingDocuments,
      icon: Clock,
      iconBg: "bg-amber-100 dark:bg-amber-900/30",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "Signed Documents",
      value: completedDocuments,
      icon: CheckCircle,
      iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Rejected Documents",
      value: rejectedDocuments,
      icon: XCircle,
      iconBg: "bg-red-100 dark:bg-red-900/30",
      iconColor: "text-red-600 dark:text-red-400",
    },
  ];

  return (
    <DashboardLayout>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Document Dashboard
          </h1>
          <p className="text-slate-500 mt-1">
            Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}. Here's your document pipeline.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="hidden sm:flex gap-2" onClick={handleDownloadReport} disabled={loading || isDownloadingReport}>
              {isDownloadingReport ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  Generating…
                </>
              ) : (
                "Download Report"
              )}
            </Button>
          <Button asChild>
            <Link to="/upload">
              <Plus className="mr-2 h-4 w-4" /> New Document
            </Link>
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-8">
        {loading
          ? [1, 2, 3, 4].map((i) => <StatCardSkeleton key={i} />)
          : statCards.map(({ label, value, icon: Icon, iconBg, iconColor }) => (
              <Card key={label} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">{label}</CardTitle>
                  <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", iconBg)}>
                    <Icon className={cn("h-4 w-4", iconColor)} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{value}</div>
                </CardContent>
              </Card>
            ))}
      </div>

      {error ? (
        <Card>
          <CardContent className="p-6 text-center text-error">
            {error}{" "}
            <button className="underline text-primary-600 ml-2" onClick={fetchDocuments}>
              Retry
            </button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Recent Documents */}
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Recent Documents</CardTitle>
                <CardDescription>Your latest uploaded documents</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-primary-600" asChild>
                <Link to="/documents">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-3/4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                        <div className="h-3 w-1/2 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentDocs.length === 0 ? (
                <div className="text-center py-10">
                  <div className="h-14 w-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
                    <FileText className="h-7 w-7 text-slate-400" />
                  </div>
                  <h3 className="font-semibold text-slate-700 dark:text-slate-300">No documents yet</h3>
                  <p className="text-sm text-slate-500 mt-1">Upload your first document to get started.</p>
                  <Button className="mt-4" size="sm" asChild>
                    <Link to="/upload">
                      <Upload className="mr-2 h-4 w-4" /> Upload Now
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-5">
                  {recentDocs.map((doc) => (
                    <Link
                      key={doc.id}
                      to={`/documents/${doc.id}`}
                      className="flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl -mx-2 px-2 py-1.5 transition-colors"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center shrink-0">
                          <FileText className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{doc.title}</p>
                          <p className="text-xs text-slate-500 truncate">
                            {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : "—"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-4">
                        <Badge variant={statusVariant(doc.status)} className="hidden sm:inline-flex">
                          {statusLabel(doc.status)}
                        </Badge>
                        <ArrowRight className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>Common tasks you perform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start h-12" asChild>
                <Link to="/upload">
                  <Upload className="mr-3 h-4 w-4 text-primary-600" />
                  Upload New Document
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start h-12" asChild>
                <Link to="/recipients">
                  <Users className="mr-3 h-4 w-4 text-accent-600" />
                  View Recipients
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start h-12" asChild>
                <Link to="/workflows">
                  <CheckSquare className="mr-3 h-4 w-4 text-warning" />
                  View Workflows
                </Link>
              </Button>

              <div className="mt-8 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
                <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-2">Need help?</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                  Check out our guide on creating binding digital signatures.
                </p>
                <Button variant="link" className="p-0 h-auto text-xs text-primary-600 dark:text-primary-400 font-semibold" asChild>
                  <Link to="/guide">
                    Read the guide <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}

export default Dashboard;
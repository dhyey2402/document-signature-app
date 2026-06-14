import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  Users, 
  Plus,
  ArrowRight,
  MoreVertical,
  Upload,
  CheckSquare
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { DashboardLayout } from "../components/layout/DashboardLayout";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getDocuments } from "../services/documentService";

function Dashboard() {
  const { user } = useContext(AuthContext);


  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDocuments();
      setDocuments(res.data);
    } catch (e) {
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

  const recentUploads = [...documents]
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    .slice(0, 5);

  const recentActivity = recentUploads.map((doc) => ({
    id: doc.id,
    user: "User",
    action: "uploaded",
    document: doc.title,
    time: doc.created_at ? new Date(doc.created_at).toLocaleString() : "—",
    status: String(doc.status || "draft").toLowerCase() === "signed" ? "completed" : "pending",
  }));


  const handleDownloadReport = () => {
    if (documents.length === 0) {
      toast.error("No documents to report.");
      return;
    }
    
    // Create CSV content
    const headers = ["ID", "Title", "File Name", "Status", "Uploaded At"];
    const rows = documents.map(doc => [
      doc.id,
      `"${doc.title || ''}"`,
      `"${doc.file_name || ''}"`,
      doc.status || "draft",
      new Date(doc.created_at).toISOString()
    ]);
    
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    
    // Trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `document_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Report downloaded");
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Document Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back. Here's your document pipeline today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="hidden sm:flex" onClick={handleDownloadReport}>
            Download Report
          </Button>
          <Button asChild>
            <Link to="/upload">
              <Plus className="mr-2 h-4 w-4" /> New Document
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "—" : totalDocuments}</div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Pending Signatures</CardTitle>
            <Clock className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "—" : pendingDocuments}</div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Signed Documents</CardTitle>
            <CheckCircle className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "—" : completedDocuments}</div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Rejected Documents</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "—" : rejectedDocuments}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <CardDescription>Latest actions on your documents</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-primary-600">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      <span className="font-semibold text-sm text-slate-600 dark:text-slate-300">
                        {activity.user.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none mb-1 text-slate-900 dark:text-white">
                        {activity.user} <span className="font-normal text-slate-500">{activity.action}</span> {activity.document}
                      </p>
                      <p className="text-xs text-slate-500">{activity.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={activity.status === 'completed' ? 'success' : 'pending'} className="hidden sm:inline-flex">
                      {activity.status === 'completed' ? 'Completed' : 'Pending'}
                    </Badge>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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
                Add Recipient
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start h-12" asChild>
              <Link to="/workflows">
                <CheckSquare className="mr-3 h-4 w-4 text-warning" />
                Create Workflow
              </Link>
            </Button>
            
            <div className="mt-8 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
              <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-2">Need help?</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">Check out our guide on creating binding digital signatures.</p>
              <Button variant="link" className="p-0 h-auto text-xs text-primary-600 dark:text-primary-400 font-semibold hover:text-primary-700 dark:hover:text-primary-300" asChild>
                <Link to="/guide">
                  Read the guide <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;
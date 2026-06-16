import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link, useSearchParams } from "react-router-dom";

import {
  deleteDocument,
  downloadDocument,
  getDocuments,
} from "../services/documentService";

import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/Dialog";
import { DashboardLayout } from "../components/layout/DashboardLayout";

const statusToBadgeVariant = (status) => {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "signed") return "success";
  if (normalized === "rejected") return "destructive";
  if (normalized === "viewed") return "warning";

  return "pending";
};

const statusToFilterLabel = (status) => {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "signed") return "Signed";
  if (normalized === "rejected") return "Rejected";

  // 'pending' and legacy 'draft' both map to Pending
  return "Pending";
};

function Documents() {
  const [searchParams] = useSearchParams();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null) setQuery(q);
  }, [searchParams]);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getDocuments();
      setDocuments(response.data);
    } catch (e) {
      setError("Failed to load documents.");
      toast.error("Failed to load documents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const filteredDocuments = useMemo(() => {
    const q = query.trim().toLowerCase();

    return documents.filter((doc) => {
      const titleMatch = !q || String(doc.title || "").toLowerCase().includes(q);

      const badgeStatus = statusToFilterLabel(doc.status);
      const statusMatch =
        statusFilter === "All" || badgeStatus.toLowerCase() === statusFilter.toLowerCase();

      return titleMatch && statusMatch;
    });
  }, [documents, query, statusFilter]);

  const handleDownload = async (id) => {
    try {
      const res = await downloadDocument(id);
      const blob = res.data;
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "document.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
      toast.success("Download started.");
    } catch (e) {
      toast.error("Failed to download document.");
    }
  };

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const openDelete = (doc) => {
    setDeleteTarget(doc);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await deleteDocument(deleteTarget.id);
      toast.success("Document deleted.");
      setDeleteOpen(false);
      setDeleteTarget(null);
      fetchDocuments();
    } catch (e) {
      toast.error("Failed to delete document.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
            <p className="text-slate-500 mt-1">
              Upload, track, and manage signature-ready documents.
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild>
              <Link to="/upload">Upload Document</Link>
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="md:col-span-1">
            <label className="text-sm font-medium">Search</label>
            <input
              type="search"
              className="mt-1 flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:placeholder:text-slate-400"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium">Status</label>
            <div className="mt-1 flex flex-wrap gap-2">
              {[
                "All",
                "Pending",
                "Signed",
                "Rejected",
              ].map((label) => (
                <Button
                  key={label}
                  variant={statusFilter === label ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(label)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-slate-50/50 dark:bg-slate-800/30">
                  <th className="text-left text-sm font-medium p-4">Title</th>
                  <th className="text-left text-sm font-medium p-4 hidden md:table-cell">File Name</th>
                  <th className="text-left text-sm font-medium p-4">Status</th>
                  <th className="text-left text-sm font-medium p-4 hidden sm:table-cell">Created</th>
                  <th className="text-right text-sm font-medium p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-slate-500">
                      Loading documents...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-error">
                      {error}
                    </td>
                  </tr>
                ) : filteredDocuments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-500">
                        <svg className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        <p className="text-sm font-medium">
                          {query || statusFilter !== "All" ? "No documents match your filters." : "No documents yet."}
                        </p>
                        {!query && statusFilter === "All" && (
                          <a href="/upload" className="text-xs text-primary-600 hover:underline">Upload your first document →</a>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredDocuments.map((doc) => (
                    <tr key={doc.id} className="border-b last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-slate-900 dark:text-white">{doc.title}</div>
                        {/* Show file name inline on mobile */}
                        <div className="text-xs text-slate-400 md:hidden mt-0.5 truncate max-w-[160px]">{doc.file_name}</div>
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-300 hidden md:table-cell">
                        <span className="truncate block max-w-[180px]" title={doc.file_name}>{doc.file_name}</span>
                      </td>
                      <td className="p-4">
                        <Badge variant={statusToBadgeVariant(doc.status)}>
                          {statusToFilterLabel(doc.status)}
                        </Badge>
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-300 hidden sm:table-cell">
                        {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/documents/${doc.id}`}>View</Link>
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDownload(doc.id)} className="hidden sm:inline-flex">
                            Download
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => openDelete(doc)}>
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete document?</DialogTitle>
            <DialogDescription>
              This will remove the document file and record from your workspace.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={deleting}
              onClick={() => setDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" disabled={deleting} onClick={confirmDelete}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

export default Documents;


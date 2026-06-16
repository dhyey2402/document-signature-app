import { useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { UploadCloud, X, Info } from "lucide-react";

import { uploadDocument } from "../services/documentService";

function UploadDocument() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [documentTitle, setDocumentTitle] = useState("");
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [touched, setTouched] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const validation = useMemo(() => {
    const errors = {};
    if (!documentTitle.trim()) errors.title = "Document title is required.";
    if (!file) errors.file = "PDF file is required.";
    else if (file.type !== "application/pdf" && !String(file.name || "").toLowerCase().endsWith(".pdf")) {
      errors.file = "Only PDF documents are supported.";
    }
    return errors;
  }, [documentTitle, file]);

  const hasErrors = Object.keys(validation).length > 0;

  const setSelectedFile = (nextFile) => {
    if (!nextFile) return;
    const isPdf = nextFile.type === "application/pdf" || String(nextFile.name || "").toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setFile(null);
      toast.error("Only PDF documents are supported.");
      return;
    }
    setFile(nextFile);
  };

  const handleBrowse = () => fileInputRef.current?.click();
  const onFileChange = (e) => setSelectedFile(e.target.files?.[0]);

  const onDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    setSelectedFile(e.dataTransfer.files?.[0]);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);

    if (hasErrors) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    const formData = new FormData();
    formData.append("title", documentTitle.trim());
    formData.append("file", file);

    setUploading(true);
    setProgress(0);
    try {
      const res = await uploadDocument(formData, (evt) => {
        if (!evt.total) return;
        setProgress(Math.round((evt.loaded / evt.total) * 100));
      });
      toast.success("Document uploaded! Now place a signature and send for signing.");
      // Navigate to the new document's detail page if we get the ID back
      const docId = res?.data?.id;
      navigate(docId ? `/documents/${docId}` : "/documents");
    } catch (err) {
      const detail = err?.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Upload Document</h1>
          <p className="text-slate-500 mt-1">Upload a PDF to prepare it for signature.</p>
        </div>

        <form onSubmit={onSubmit}>
          {/* Drop zone */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div
                className={
                  "border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer group " +
                  (dragActive
                    ? "bg-primary-50 dark:bg-primary-900/10 border-primary-300"
                    : "border-border hover:bg-slate-50 dark:hover:bg-slate-900")
                }
                onClick={handleBrowse}
                onDragEnter={() => setDragActive(true)}
                onDragLeave={() => setDragActive(false)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && handleBrowse()}
              >
                <div className="h-14 w-14 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <UploadCloud className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Click to upload or drag and drop</h3>
                <p className="text-sm text-slate-500 mb-4">PDF files only</p>

                {file ? (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 text-sm font-medium">
                    {file.name}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); clearFile(); }}
                      className="ml-1 rounded hover:bg-primary-200 dark:hover:bg-primary-800 p-0.5"
                      disabled={uploading}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <Button type="button" variant="secondary" onClick={(e) => { e.stopPropagation(); handleBrowse(); }} disabled={uploading}>
                    Select PDF
                  </Button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={onFileChange}
                  disabled={uploading}
                />

                {touched && validation.file && (
                  <p className="mt-3 text-sm text-error">{validation.file}</p>
                )}

                {uploading && (
                  <div className="mt-5">
                    <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 mb-1">
                      <span>Uploading…</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-primary-600 transition-all duration-150"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Document details */}
          <Card>
            <CardHeader>
              <CardTitle>Document Details</CardTitle>
              <CardDescription>Give your document a descriptive title.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Document Title</label>
                <Input
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  placeholder="e.g. Non-Disclosure Agreement"
                  disabled={uploading}
                />
                {touched && validation.title && (
                  <p className="text-sm text-error">{validation.title}</p>
                )}
              </div>

              {/* Info callout — recipients are added from Document Detail */}
              <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs">
                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  After uploading, you can place a signature field and send the document to a recipient from the Document Detail page.
                </span>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="outline" disabled={uploading} onClick={() => navigate("/documents")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading}>
                  {uploading ? "Uploading…" : "Upload Document"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default UploadDocument;

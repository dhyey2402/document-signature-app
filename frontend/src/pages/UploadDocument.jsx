import { useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import {
  UploadCloud,
  X,
} from "lucide-react";

import { uploadDocument } from "../services/documentService";

const isValidEmail = (value) => {
  const trimmed = String(value || "").trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
};

function UploadDocument() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [documentTitle, setDocumentTitle] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [file, setFile] = useState(null);

  const [dragActive, setDragActive] = useState(false);

  const [touched, setTouched] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const validation = useMemo(() => {
    const errors = {};

    if (!documentTitle.trim()) errors.title = "Document title is required.";
    if (!candidateName.trim()) errors.candidateName = "Recipient name is required.";
    if (!candidateEmail.trim()) errors.candidateEmail = "Recipient email is required.";
    else if (!isValidEmail(candidateEmail)) errors.candidateEmail = "Enter a valid email address.";

    if (!file) errors.file = "PDF file is required.";
    else if (file.type !== "application/pdf" && !String(file.name || "").toLowerCase().endsWith(".pdf")) {
      errors.file = "Only PDF documents are supported.";
    }

    return errors;
  }, [documentTitle, candidateName, candidateEmail, file]);

  const hasErrors = Object.keys(validation).length > 0;

  const setSelectedFile = (nextFile) => {
    if (!nextFile) return;

    const looksLikePdf =
      nextFile.type === "application/pdf" || String(nextFile.name || "").toLowerCase().endsWith(".pdf");

    if (!looksLikePdf) {
      setFile(null);
      toast.error("Only PDF documents are supported.");
      return;
    }

    setFile(nextFile);
  };

  const handleBrowse = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = (e) => {
    const next = e.target.files?.[0];
    setSelectedFile(next);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragActive(false);

    const next = e.dataTransfer.files?.[0];
    setSelectedFile(next);
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);

    if (!file) {
      toast.error("PDF file is required.");
      return;
    }

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
      await uploadDocument(formData, (evt) => {
        if (!evt.total) return;
        const pct = Math.round((evt.loaded / evt.total) * 100);
        setProgress(pct);
      });

      toast.success("Document uploaded successfully");
      navigate("/documents");
    } catch (err) {
      toast.error("Upload failed. Please try again.");
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
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Upload Document</h1>
          <p className="text-slate-500 mt-1">Upload a PDF to prepare it for signature.</p>
        </div>

        <form onSubmit={onSubmit}>
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div
                className={
                  "border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer group " +
                  (dragActive ? "bg-primary-50 dark:bg-primary-900/10 border-primary-300" : "border-border hover:bg-slate-50 dark:hover:bg-slate-900")
                }
                onClick={handleBrowse}
                onDragEnter={() => setDragActive(true)}
                onDragLeave={() => setDragActive(false)}
                onDragOver={onDragOver}
                onDrop={onDrop}
                role="button"
                tabIndex={0}
              >
                <div className="h-14 w-14 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <UploadCloud className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Click to upload or drag and drop</h3>
                <p className="text-sm text-slate-500 mb-4">PDF only</p>

                <div className="flex items-center justify-center gap-3">
                  <Button type="button" variant="secondary" onClick={(e) => { e.stopPropagation(); handleBrowse(); }} disabled={uploading}>
                    Select PDF
                  </Button>
                  {file ? (
                    <Button type="button" variant="outline" size="icon" onClick={(e) => { e.stopPropagation(); clearFile(); }} disabled={uploading}>
                      <X className="h-4 w-4" />
                    </Button>
                  ) : null}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={onFileChange}
                  disabled={uploading}
                />

                {touched && validation.file ? (
                  <p className="mt-3 text-sm text-error">{validation.file}</p>
                ) : null}

                {uploading ? (
                  <div className="mt-5">
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <span>Upload progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-primary-600"
                        style={{ width: `${progress}%`, transition: "width 150ms ease" }}
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Document Details</CardTitle>
              <CardDescription>Enter recipient information for this signature request.</CardDescription>
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
                {touched && validation.title ? (
                  <p className="text-sm text-error">{validation.title}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Recipient Name</label>
                <Input
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="e.g. John Doe"
                  disabled={uploading}
                />
                {touched && validation.candidateName ? (
                  <p className="text-sm text-error">{validation.candidateName}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Recipient Email</label>
                <Input
                  value={candidateEmail}
                  onChange={(e) => setCandidateEmail(e.target.value)}
                  type="email"
                  placeholder="e.g. john.doe@email.com"
                  disabled={uploading}
                />
                {touched && validation.candidateEmail ? (
                  <p className="text-sm text-error">{validation.candidateEmail}</p>
                ) : null}
              </div>

              <div className="pt-6 flex justify-end gap-3">
                <Button type="button" variant="outline" disabled={uploading} onClick={() => navigate("/documents")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading}>
                  {uploading ? "Uploading..." : "Upload Document"}
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


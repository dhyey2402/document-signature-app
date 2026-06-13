import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams, Link } from "react-router-dom";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import { getDocumentDetail, downloadDocument, getSignatures, saveSignature } from "../services/documentService";
import { uploadSignatureAsset, signDocument, downloadSignedDocument, generateSigningLink } from "../services/signatureService";

import SignatureUploadOrDraw from "../components/signature/SignatureUploadOrDraw";


import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";

// Set up the react-pdf worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const statusToBadgeVariant = (status) => {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "signed") return "success";
  if (normalized === "rejected") return "destructive";
  if (normalized === "viewed") return "warning";
  return "pending";
};

function DocumentDetail() {
  const { id } = useParams();

  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);

  // PDF state
  const [numPages, setNumPages] = useState(null);

  // Signature states
  const [savedSignatures, setSavedSignatures] = useState([]);
  const [pendingSignature, setPendingSignature] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [signatureAssetId, setSignatureAssetId] = useState(null);
  const [isSigning, setIsSigning] = useState(false);

  // Day 7 states
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");

  
  // Drag states
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const docRes = await getDocumentDetail(id);
      setDocument(docRes.data);
      
      const sigRes = await getSignatures(id);
      setSavedSignatures(sigRes.data);

      const blobRes = await downloadDocument(id);
      const url = window.URL.createObjectURL(blobRes.data);
      setPdfPreviewUrl(url);

    } catch (e) {
      console.error(e);
      setError("Document not found.");
      toast.error("Failed to load document data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
    
    return () => {
      if (pdfPreviewUrl) {
        window.URL.revokeObjectURL(pdfPreviewUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDownload = async () => {
    if (!document) return;
    try {
      const res = await downloadDocument(document.id);
      const blob = res.data;
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = document.file_name || "document.pdf";
      window.document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Download started.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to download document.");
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handleResetSignature = () => {
    setPendingSignature(null);
  };

  const handleSaveSignature = async () => {
    if (!pendingSignature || !document) return;

    setIsSaving(true);
    try {
      const payload = {
        document_id: document.id,
        page_number: pendingSignature.page_number, // Dynamic page number!
        x_coordinate: pendingSignature.x,
        y_coordinate: pendingSignature.y,
        width: pendingSignature.width,
        height: pendingSignature.height
      };
      const res = await saveSignature(payload);
      setSavedSignatures([...savedSignatures, res.data]);
      setPendingSignature(null);
      toast.success("Signature position saved successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to save signature.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- HTML5 Drag & Drop Logic ---

  const handleDragStart = (e) => {
    e.dataTransfer.setData("signature", "true");
  };

  const handleDrop = (e, pageNumber) => {
    e.preventDefault();
    const isSignature = e.dataTransfer.getData("signature");
    if (!isSignature) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const widthRel = 0.25;
    const heightRel = 0.05; // 5% of page height is reasonable

    let x = (e.clientX - rect.left) / rect.width;
    let y = (e.clientY - rect.top) / rect.height;

    // Constrain to boundaries
    x = Math.max(0, Math.min(x, 1 - widthRel));
    y = Math.max(0, Math.min(y, 1 - heightRel));

    setPendingSignature({
      page_number: pageNumber,
      x,
      y,
      width: widthRel,
      height: heightRel
    });
  };

  // --- Internal Page Drag Logic (Fine-tuning) ---

  const handleMouseDown = (e) => {
    if (!pendingSignature) return;
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handlePageMouseMove = (e, pageNumber) => {
    if (!isDragging || !pendingSignature || pendingSignature.page_number !== pageNumber) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    
    let newPixelX = e.clientX - rect.left - dragOffset.x;
    let newPixelY = e.clientY - rect.top - dragOffset.y;
    
    const maxPixelX = rect.width - (pendingSignature.width * rect.width);
    const maxPixelY = rect.height - (pendingSignature.height * rect.height);
    
    newPixelX = Math.max(0, Math.min(newPixelX, maxPixelX));
    newPixelY = Math.max(0, Math.min(newPixelY, maxPixelY));
    
    setPendingSignature({
       ...pendingSignature,
       x: newPixelX / rect.width,
       y: newPixelY / rect.height
    });
  };

  const handleGenerateSigningLink = async () => {
    if (!document) return;
    setIsGeneratingLink(true);
    setGeneratedLink("");
    try {
      const res = await generateSigningLink({
        document_id: document.id,
        recipient_name: recipientName,
        recipient_email: recipientEmail
      });
      setGeneratedLink(res.data.public_url);
      if (res.data.email_sent) {
        toast.success("Signing link generated! Notification email sent.");
      } else {
        toast.success("Signing link generated! (Email failed to send)");
      }
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Failed to generate signing link.");
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const handleCopyLink = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    toast.success("Link copied to clipboard!");
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-start justify-between gap-4 flex-col sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Document Details</h1>
          <p className="text-slate-500 mt-1">Review the document, download, or drag signatures onto pages.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/documents">Back to Documents</Link>
          </Button>
          <Button onClick={handleDownload} disabled={loading || !document}>
            Download
          </Button>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6 text-slate-500">Loading document...</CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="p-6 text-error">{error}</CardContent>
        </Card>
      ) : !document ? (
        <Card>
          <CardContent className="p-6 text-slate-500">Document unavailable.</CardContent>
        </Card>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Document Preview</CardTitle>
                <CardDescription>Drag and drop the signature placeholder onto a specific document page.</CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  className="relative border border-slate-200 dark:border-slate-800 rounded bg-slate-100 dark:bg-slate-900 overflow-auto p-4" 
                  style={{ height: '70vh', minHeight: '500px', width: '100%' }}
                >
                  {pdfPreviewUrl && (
                    <Document 
                      file={pdfPreviewUrl} 
                      onLoadSuccess={onDocumentLoadSuccess}
                      loading={<div className="text-center text-slate-500 mt-10">Parsing PDF...</div>}
                    >
                      {Array.from(new Array(numPages || 0), (el, index) => {
                        const pageNumber = index + 1;
                        return (
                          <div 
                            key={`page_${pageNumber}`}
                            className="relative shadow-md mx-auto mb-8 bg-white"
                            style={{ width: 'fit-content' }}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => handleDrop(e, pageNumber)}
                            onMouseMove={(e) => handlePageMouseMove(e, pageNumber)}
                          >
                            <Page 
                              pageNumber={pageNumber} 
                              renderTextLayer={false}
                              renderAnnotationLayer={false}
                              width={700} // Default reasonable width
                            />
                            
                            {/* Render saved signatures for THIS page */}
                            {savedSignatures.filter(sig => sig.page_number === pageNumber).map(sig => (
                              <div 
                                key={sig.id}
                                className="absolute border-2 border-primary-500 bg-primary-100/60 dark:bg-primary-900/60 flex flex-col items-center justify-center text-primary-700 dark:text-primary-300 font-semibold"
                                style={{
                                  left: `${sig.x_coordinate * 100}%`,
                                  top: `${sig.y_coordinate * 100}%`,
                                  width: `${sig.width * 100}%`,
                                  height: `${sig.height * 100}%`
                                }}
                              >
                                <span className="text-xs uppercase tracking-wider opacity-70 mb-1">Signed</span>
                                <span>Signature</span>
                              </div>
                            ))}

                            {/* Render pending signature if it's on THIS page */}
                            {pendingSignature && pendingSignature.page_number === pageNumber && (
                              <div
                                onMouseDown={handleMouseDown}
                                className="absolute border-2 border-dashed border-accent-500 bg-accent-100/70 dark:bg-accent-900/70 flex items-center justify-center text-accent-700 dark:text-accent-300 font-bold cursor-move select-none shadow-lg z-10 transition-transform"
                                style={{
                                  left: `${pendingSignature.x * 100}%`,
                                  top: `${pendingSignature.y * 100}%`,
                                  width: `${pendingSignature.width * 100}%`,
                                  height: `${pendingSignature.height * 100}%`,
                                  transform: isDragging ? 'scale(1.02)' : 'scale(1)'
                                }}
                              >
                                Signature
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </Document>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="w-full lg:w-80 space-y-6 lg:sticky lg:top-6 lg:self-start lg:max-h-[calc(100vh-48px)] lg:overflow-y-auto pr-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">File Name</div>
                  <div className="font-medium text-sm break-all">{document.file_name}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Status</div>
                  <div>
                    <Badge variant={statusToBadgeVariant(document.status)}>
                      {String(document.status || "pending").charAt(0).toUpperCase() + String(document.status || "pending").slice(1)}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Created Date</div>
                  <div className="font-medium text-sm">
                    {document.created_at ? new Date(document.created_at).toLocaleString() : "—"}
                  </div>
                </div>

                {document.signed_at && (
                  <div className="space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Signed Date</div>
                    <div className="font-semibold text-sm text-emerald-600 dark:text-emerald-400">
                      {new Date(document.signed_at).toLocaleString()}
                    </div>
                  </div>
                )}
                
                <div className="space-y-1">
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pages</div>
                  <div className="font-medium text-sm">
                    {numPages || "..."}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Send for Signature</CardTitle>
                <CardDescription>Email a public signing link to a recipient.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recipient Name</label>
                  <Input 
                    type="text" 
                    placeholder="John Doe" 
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    disabled={isGeneratingLink}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recipient Email</label>
                  <Input 
                    type="email" 
                    placeholder="john@example.com" 
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    disabled={isGeneratingLink}
                  />
                </div>
                <Button 
                  onClick={handleGenerateSigningLink} 
                  className="w-full"
                  disabled={isGeneratingLink || !recipientName || !recipientEmail}
                >
                  {isGeneratingLink ? "Generating..." : "Send Signature Link"}
                </Button>

                {generatedLink && (
                  <div className="pt-4 space-y-2 border-t border-slate-200 dark:border-slate-800 animate-in fade-in duration-200">
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Public Link</div>
                    <div className="flex gap-2">
                      <Input 
                        type="text" 
                        readOnly 
                        value={generatedLink}
                        className="text-xs flex-1"
                      />
                      <Button variant="outline" size="sm" onClick={handleCopyLink}>
                        Copy
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Signature Actions</CardTitle>
                <CardDescription>Drag the box below onto the PDF to place a signature.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Draggable Source */}
                {!pendingSignature && (
                  <div 
                    draggable
                    onDragStart={handleDragStart}
                    className="w-full p-4 border-2 border-dashed border-accent-400 bg-accent-50 dark:bg-accent-950/20 text-accent-700 dark:text-accent-400 font-semibold text-center rounded cursor-grab active:cursor-grabbing hover:bg-accent-100 transition-colors"
                  >
                    Drag Me to Document
                  </div>
                )}

                {pendingSignature && (
                  <div className="pt-2 flex flex-col gap-3">
                    <div className="text-sm font-medium text-center text-slate-700 dark:text-slate-300">
                      Signature pending on Page {pendingSignature.page_number}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="secondary" 
                        onClick={handleResetSignature} 
                        className="flex-1"
                        disabled={isSaving}
                      >
                        Reset
                      </Button>
                      <Button 
                        onClick={handleSaveSignature} 
                        className="flex-1"
                        disabled={isSaving}
                      >
                        {isSaving ? "Saving..." : "Save Position"}
                      </Button>
                    </div>
                  </div>
                )}

                {savedSignatures.length > 0 && !pendingSignature && (
                  <div className="pt-2 text-sm text-center text-slate-500">
                    {savedSignatures.length} signature{savedSignatures.length !== 1 && 's'} saved.
                  </div>
                )}

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800" />

                <div className="space-y-3">
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-200">Signature image</div>
                  <SignatureUploadOrDraw
                    disabled={isSigning}
                    onAssetUploaded={async (formData) => {
                      const res = await uploadSignatureAsset(formData);
                      setSignatureAssetId(res.data.id);
                      toast.success("Signature image uploaded.");
                    }}
                  />

                  {signatureAssetId && (
                    <div className="text-xs text-slate-500">Asset ID: {signatureAssetId}</div>
                  )}

                  <div className="pt-2 flex gap-2">
                    <Button
                      onClick={async () => {
                        if (!document) return;
                        setIsSigning(true);
                        try {
                          if (!signatureAssetId) {
                            toast.error("Upload a signature image first.");
                            return;
                          }
                          await signDocument(document.id, { signature_asset_id: signatureAssetId });
                          toast.success("Document signed successfully.");
                          setDocument({ ...document, status: "signed", signed_at: new Date().toISOString() });
                        } catch (e) {
                          toast.error(e?.response?.data?.detail || "Failed to sign document.");
                        } finally {
                          setIsSigning(false);
                        }
                      }}
                      className="flex-1"
                      disabled={isSigning || savedSignatures.length === 0}
                    >
                      {isSigning ? "Signing..." : "Sign Document"}
                    </Button>
                  </div>

                  {document?.status === "signed" && (
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        className="w-full"
                        disabled={!document}
                        onClick={async () => {
                          try {
                            const res = await downloadSignedDocument(document.id);
                            const blob = res.data;
                            const url = window.URL.createObjectURL(blob);
                            const a = window.document.createElement("a");
                            a.href = url;
                            a.download = `signed_${document.file_name || "document.pdf"}`;
                            window.document.body.appendChild(a);
                            a.click();
                            a.remove();
                            window.URL.revokeObjectURL(url);
                            toast.success("Signed PDF download started.");
                          } catch (e) {
                            toast.error(e?.response?.data?.detail || "Failed to download signed PDF.");
                          }
                        }}
                      >
                        Download Signed PDF
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default DocumentDetail;

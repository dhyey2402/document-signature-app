import { useEffect, useState, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { 
  PenTool, 
  CheckCircle, 
  Download, 
  FileText, 
  Calendar, 
  User, 
  Clock 
} from "lucide-react";

import api from "../services/api";
import SignatureUploadOrDraw from "../components/signature/SignatureUploadOrDraw";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";

// register pdf.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;


function PublicSign() {
  const { token } = useParams();

  const [linkDetail, setLinkDetail] = useState(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [numPages, setNumPages] = useState(null);
  const [signatureFormData, setSignatureFormData] = useState(null);
  const [isSigning, setIsSigning] = useState(false);
  const [signedInfo, setSignedInfo] = useState(null);

  // Responsive PDF width
  const pdfContainerRef = useRef(null);
  const [pdfWidth, setPdfWidth] = useState(700);

  const updatePdfWidth = useCallback(() => {
    if (pdfContainerRef.current) {
      const w = pdfContainerRef.current.clientWidth;
      setPdfWidth(Math.min(Math.max(w - 32, 280), 900));
    }
  }, []);

  useEffect(() => {
    updatePdfWidth();
    const obs = new ResizeObserver(updatePdfWidth);
    if (pdfContainerRef.current) obs.observe(pdfContainerRef.current);
    return () => obs.disconnect();
  }, [updatePdfWidth]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // fetch details and pdf binary
      const detailRes = await api.get(`/signing-links/${token}`);
      setLinkDetail(detailRes.data);

      if (detailRes.data.status === "signed") {
        setSignedInfo({
          signed_at: detailRes.data.signed_at,
          recipient_name: detailRes.data.recipient_name
        });
      }

      if (detailRes.data.status !== "signed") {
        const blobRes = await api.get(`/signing-links/${token}/download`, {
          params: { preview: true },
          responseType: "blob",
        });
        const url = window.URL.createObjectURL(blobRes.data);
        setPdfPreviewUrl(url);
      }
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.detail || "Invalid or expired signing link.");
      toast.error("Failed to load document details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();

    // clean up object URL on unmount
    return () => {
      if (pdfPreviewUrl) {
        window.URL.revokeObjectURL(pdfPreviewUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handleSignaturePrepared = (formData) => {
    setSignatureFormData(formData);
    toast.success("Signature prepared. Click 'Sign Document' below to submit.");
  };

  const handleSign = async () => {
    if (!signatureFormData) {
      toast.error("Please draw or upload your signature first, and click 'Upload Signature'.");
      return;
    }
    setIsSigning(true);
    try {
      const res = await api.post(`/signing-links/${token}/sign`, signatureFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Document signed successfully!");
      setSignedInfo(res.data);
      // update link state after sign
      setLinkDetail({
        ...linkDetail,
        status: "signed"
      });
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Failed to sign document.");
    } finally {
      setIsSigning(false);
    }
  };

  const handleDownloadSigned = async () => {
    try {
      const res = await api.get(`/signing-links/${token}/download-signed`, {
        responseType: "blob",
      });
      const blob = res.data;
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = `signed_${linkDetail?.document_title || "document"}.pdf`;
      window.document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Signed PDF download started.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to download signed PDF.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Public Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PenTool className="h-6 w-6 text-primary-600" />
          <span className="font-bold text-xl text-slate-900 dark:text-white">SignFlow</span>
          <Badge variant="outline" className="ml-2">Public Portal</Badge>
        </div>
      </header>

      {/* Main Area */}
      <main className="flex-1 overflow-y-auto p-6 flex justify-center">
        <div className="w-full max-w-6xl">
          {loading ? (
            <Card className="text-center py-20">
              <CardContent className="flex flex-col items-center gap-4 text-slate-500">
                <div className="h-10 w-10 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin" />
                <p className="text-sm">Loading secure signing details…</p>
              </CardContent>
            </Card>
          ) : error ? (
            <div className="mx-auto max-w-md mt-12">
              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle className="text-destructive">Link Inactive</CardTitle>
                  <CardDescription>This signing invitation is no longer active.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Reason: {error}
                  </p>
                  <p className="text-xs text-slate-500">
                    Please contact the document owner to request a new signing link.
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : linkDetail.status === "signed" && signedInfo ? (
            /* Success Screen */
            <div className="mx-auto max-w-lg mt-12">
              <Card className="border-emerald-200 dark:border-emerald-950 bg-white dark:bg-slate-950 shadow-xl rounded-2xl overflow-hidden">
                <div className="bg-emerald-600 py-8 text-center text-white flex flex-col items-center justify-center">
                  <CheckCircle className="h-16 w-16 mb-2 text-white animate-bounce" />
                  <h2 className="text-2xl font-bold">Signing Complete!</h2>
                  <p className="text-emerald-100 text-sm mt-1">Thank you for using SignFlow</p>
                </div>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-900">
                      <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" /> Document Title
                      </span>
                      <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                        {linkDetail.document_title}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-900">
                      <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                        <User className="h-3.5 w-3.5" /> Signer
                      </span>
                      <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                        {signedInfo.recipient_name}
                      </span>
                    </div>

                    {signedInfo.signed_at && (
                      <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-900">
                        <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" /> Signed Date
                        </span>
                        <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                          {new Date(signedInfo.signed_at).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2">
                    <Button onClick={handleDownloadSigned} className="w-full h-11 flex items-center justify-center gap-2">
                      <Download className="h-4 w-4" /> Download Signed PDF
                    </Button>
                  </div>

                  <p className="text-xs text-center text-slate-400 dark:text-slate-600">
                    A copy of this signed PDF has been stored securely on the platform for the document owner.
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Main Signing Interface */
            <div className="flex flex-col lg:flex-row gap-6">
              {/* PDF Preview */}
              <div className="flex-1 min-w-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Review and Place Signature</CardTitle>
                    <CardDescription>Scroll down to preview the document content and placed coordinates.</CardDescription>
                  </CardHeader>
                  <CardContent ref={pdfContainerRef}>
                    <div 
                      className="relative border border-slate-200 dark:border-slate-800 rounded bg-slate-100 dark:bg-slate-900 overflow-auto p-4" 
                      style={{ height: '70vh', minHeight: '400px', width: '100%' }}
                    >
                      {pdfPreviewUrl && (
                        <Document 
                          file={pdfPreviewUrl} 
                          onLoadSuccess={onDocumentLoadSuccess}
                          loading={<div className="text-center text-slate-500 mt-10">Loading PDF document...</div>}
                        >
                          {Array.from(new Array(numPages || 0), (el, index) => {
                            const pageNumber = index + 1;
                            return (
                              <div 
                                key={`page_${pageNumber}`}
                                className="relative shadow-md mx-auto mb-8 bg-white"
                                style={{ width: 'fit-content' }}
                              >
                                <Page 
                                  pageNumber={pageNumber} 
                                  renderTextLayer={false}
                                  renderAnnotationLayer={false}
                                  width={pdfWidth}
                                />
                                
                                {/* position overlays using relative coordinate metrics */}
                                {linkDetail.signatures.filter(sig => sig.page_number === pageNumber).map(sig => (
                                  <div 
                                    key={sig.id}
                                    className="absolute border-2 border-dashed border-primary-500 bg-primary-50/50 flex flex-col items-center justify-center text-primary-700 font-semibold"
                                    style={{
                                      left: `${sig.x_coordinate * 100}%`,
                                      top: `${sig.y_coordinate * 100}%`,
                                      width: `${sig.width * 100}%`,
                                      height: `${sig.height * 100}%`
                                    }}
                                  >
                                    <span className="text-xs uppercase tracking-wider opacity-70">Signature Area</span>
                                  </div>
                                ))}
                              </div>
                            );
                          })}
                        </Document>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar controls */}
              <div className="w-full lg:w-80 space-y-6 lg:sticky lg:top-6 lg:self-start lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto pr-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Document Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" /> Title
                      </div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{linkDetail.document_title}</div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <User className="h-3.5 w-3.5" /> Recipient
                      </div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{linkDetail.recipient_name}</div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> Link Expiration
                      </div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {new Date(linkDetail.expires_at).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Signature Capture</CardTitle>
                    <CardDescription>Draw or upload your signature, then click Upload Signature to prepare it.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <SignatureUploadOrDraw 
                      disabled={isSigning}
                      onAssetUploaded={handleSignaturePrepared}
                    />

                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                      <Button 
                        onClick={handleSign}
                        className="w-full h-11"
                        disabled={isSigning || !signatureFormData}
                      >
                        {isSigning ? "Signing..." : "Sign Document"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default PublicSign;

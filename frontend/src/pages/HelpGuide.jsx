import { useState } from "react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { UploadCloud, PenTool, Link2, CheckCircle, ArrowRight, FileText, Send, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { cn } from "../lib/utils";

export default function HelpGuide() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: "upload",
      icon: UploadCloud,
      title: "1. Upload a Document",
      shortDesc: "Upload your PDF document to the platform.",
      detailDesc: "Begin the signing process by securely uploading your PDF document to the SignFlow platform. Your files are encrypted and stored safely.",
      color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30",
      activeBorder: "border-indigo-500 ring-indigo-500",
      bullets: [
        "Navigate to the Upload section",
        "Drag & drop your PDF or select from your computer",
        "Give your document a clear, recognizable title"
      ],
      mockup: (
        <div className="w-full h-64 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center p-6 text-center">
          <div className="h-16 w-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-4">
            <UploadCloud className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Drag & drop your PDF here</div>
          <div className="text-xs text-slate-400 mt-1">Maximum file size 10MB</div>
          <Button variant="outline" size="sm" className="mt-4 pointer-events-none">Browse Files</Button>
        </div>
      )
    },
    {
      id: "place",
      icon: PenTool,
      title: "2. Place Signature Fields",
      shortDesc: "Add interactive signature blocks to your PDF.",
      detailDesc: "Use our drag-and-drop editor to place signature fields exactly where your recipients need to sign. You can position them anywhere on the document.",
      color: "text-amber-600 bg-amber-50 dark:bg-amber-900/30",
      activeBorder: "border-amber-500 ring-amber-500",
      bullets: [
        "Open the uploaded document in the viewer",
        "Click or drag a 'Signature Field' onto the page",
        "Resize and position the field over the signing line"
      ],
      mockup: (
        <div className="w-full h-64 bg-slate-200 dark:bg-slate-800 rounded-xl p-4 flex items-center justify-center relative overflow-hidden">
          <div className="w-48 h-56 bg-white dark:bg-slate-950 rounded shadow-md p-4 flex flex-col justify-end">
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded mb-2"></div>
            <div className="w-3/4 h-2 bg-slate-100 dark:bg-slate-800 rounded mb-8"></div>
            
            <div className="border-2 border-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded p-2 border-dashed flex items-center justify-center">
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Signature Field</span>
            </div>
            <div className="w-full h-px bg-slate-300 dark:bg-slate-700 mt-1"></div>
          </div>
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <div className="h-8 w-8 bg-white dark:bg-slate-900 rounded shadow flex items-center justify-center"><PenTool className="h-4 w-4 text-amber-600" /></div>
            <div className="h-8 w-8 bg-white dark:bg-slate-900 rounded shadow flex items-center justify-center"><FileText className="h-4 w-4 text-slate-400" /></div>
          </div>
        </div>
      )
    },
    {
      id: "send",
      icon: Link2,
      title: "3. Generate a Signing Link",
      shortDesc: "Create a unique URL for your recipient to sign.",
      detailDesc: "Generate a secure, single-use public signing link for your recipient. You can email this link directly to them so they can review and sign the document without creating an account.",
      color: "text-sky-600 bg-sky-50 dark:bg-sky-900/30",
      activeBorder: "border-sky-500 ring-sky-500",
      bullets: [
        "Go to the 'Recipients' tab in the document sidebar",
        "Enter the recipient's name and email address",
        "Click 'Generate Link' and copy the unique URL"
      ],
      mockup: (
        <div className="w-full h-64 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center p-6">
          <div className="bg-white dark:bg-slate-950 rounded-xl shadow-lg w-full max-w-sm p-5 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="h-5 w-5 text-sky-500" />
              <div className="text-sm font-semibold">Send Request</div>
            </div>
            <div className="space-y-3">
              <div className="h-8 bg-slate-100 dark:bg-slate-900 rounded w-full border border-slate-200 dark:border-slate-800 flex items-center px-2">
                <span className="text-xs text-slate-400">john.doe@example.com</span>
              </div>
              <div className="h-8 bg-sky-50 dark:bg-sky-900/20 rounded w-full border border-sky-200 dark:border-sky-800/50 flex items-center justify-between px-2">
                <span className="text-xs text-sky-600 truncate">https://signflow.app/sign/1a2b3c...</span>
                <Link2 className="h-3 w-3 text-sky-600" />
              </div>
              <Button size="sm" className="w-full bg-sky-600 hover:bg-sky-700 text-white pointer-events-none">Send Email</Button>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "track",
      icon: CheckCircle,
      title: "4. Track and Finalize",
      shortDesc: "Monitor progress and download the signed PDF.",
      detailDesc: "Watch your document's status update in real-time on your dashboard. Once all parties have signed, you can download the finalized, legally-binding PDF complete with the audit trail.",
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30",
      activeBorder: "border-emerald-500 ring-emerald-500",
      bullets: [
        "Check real-time status in the Workflows tab",
        "Receive a notification when the document is signed",
        "Download the final PDF and Audit Log certificate"
      ],
      mockup: (
        <div className="w-full h-64 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col p-4 relative overflow-hidden">
          <div className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">Recent Workflows</div>
          <div className="space-y-2">
            <div className="bg-white dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center"><CheckCircle className="h-4 w-4 text-emerald-600" /></div>
                <div>
                  <div className="text-sm font-medium">NDA_Agreement.pdf</div>
                  <div className="text-xs text-slate-500">Signed today</div>
                </div>
              </div>
              <div className="text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">Completed</div>
            </div>
            <div className="bg-white dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center justify-between shadow-sm opacity-50">
               <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center"><Send className="h-4 w-4 text-amber-600" /></div>
                <div>
                  <div className="text-sm font-medium">Offer_Letter.pdf</div>
                  <div className="text-xs text-slate-500">Sent yesterday</div>
                </div>
              </div>
              <div className="text-xs font-medium text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full">Pending</div>
            </div>
          </div>
        </div>
      )
    },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Interactive Guide</h1>
        <p className="text-slate-500 mt-1">Explore the end-to-end workflow of securely signing and sending documents.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 max-w-6xl">
        
        {/* Left Side: Clickable Steps */}
        <div className="lg:col-span-5 space-y-3">
          {steps.map((step, idx) => {
            const isActive = activeStep === idx;
            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(idx)}
                className={cn(
                  "w-full text-left p-4 rounded-xl border-2 transition-all duration-200",
                  "hover:shadow-md",
                  isActive 
                    ? `bg-white dark:bg-slate-900 shadow-sm ${step.activeBorder}` 
                    : "bg-slate-50 dark:bg-slate-900/50 border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn("mt-0.5 h-10 w-10 shrink-0 rounded-lg flex items-center justify-center transition-colors", step.color)}>
                    <step.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className={cn("text-base font-bold transition-colors", isActive ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300")}>
                      {step.title}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1 leading-snug">
                      {step.shortDesc}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Side: Detailed Workflow View */}
        <div className="lg:col-span-7">
          <Card className="h-full border-2 border-slate-200 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-950 overflow-hidden flex flex-col">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800/50 pb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className={cn("h-8 w-8 rounded flex items-center justify-center", steps[activeStep].color)}>
                  {(() => {
                    const Icon = steps[activeStep].icon;
                    return <Icon className="h-4 w-4" />;
                  })()}
                </div>
                <CardTitle className="text-2xl">{steps[activeStep].title}</CardTitle>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-base">
                {steps[activeStep].detailDesc}
              </p>
            </CardHeader>
            <CardContent className="p-6 flex-1 flex flex-col">
              <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-3 uppercase tracking-wider">How to do it</h4>
              <ul className="space-y-2 mb-8">
                {steps[activeStep].bullets.map((bullet, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-auto">
                {steps[activeStep].mockup}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-12 max-w-6xl">
        <Card className="bg-primary-50 dark:bg-primary-900/10 border-primary-100 dark:border-primary-900/30">
          <CardContent className="p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-primary-900 dark:text-primary-100 mb-1">Ready to try it out?</h3>
              <p className="text-primary-700 dark:text-primary-300 text-sm">
                Your first digital signature is just a few clicks away. Follow these steps on a real document.
              </p>
            </div>
            <Button size="lg" className="shrink-0" asChild>
              <Link to="/upload">Upload your first document</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

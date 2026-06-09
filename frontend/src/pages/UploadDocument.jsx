import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { UploadCloud, File, X } from "lucide-react";

export default function UploadDocument() {
  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Upload Document</h1>
          <p className="text-slate-500 mt-1">Upload a PDF to prepare it for signing.</p>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer group">
              <div className="h-14 w-14 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <UploadCloud className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Click to upload or drag and drop</h3>
              <p className="text-sm text-slate-500 mb-4">PDF, DOCX, or PNG (max. 20MB)</p>
              <Button variant="secondary">Select Files</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Document Details</CardTitle>
            <CardDescription>Configure who needs to sign this document.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Document Title</label>
              <Input placeholder="e.g. Non-Disclosure Agreement" />
            </div>
            
            <div className="space-y-2 pt-4">
              <label className="text-sm font-medium">Recipients</label>
              <div className="flex gap-2">
                <Input placeholder="Signer Name" className="flex-1" />
                <Input placeholder="Email Address" type="email" className="flex-1" />
                <Button variant="outline" size="icon"><X className="h-4 w-4" /></Button>
              </div>
              <Button variant="ghost" className="mt-2 text-primary-600"><Plus className="mr-2 h-4 w-4" /> Add Signer</Button>
            </div>

            <div className="pt-6 flex justify-end gap-3">
              <Button variant="outline">Cancel</Button>
              <Button>Continue to Prepare</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

import { Plus } from "lucide-react";

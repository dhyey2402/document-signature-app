import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Card, CardContent } from "../components/ui/Card";

export default function Workflows() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Signature Workflows</h1>
        <p className="text-slate-500 mt-1">Design and automate your document signing sequences.</p>
      </div>

      <Card>
        <CardContent className="p-12 text-center">
          <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
          <p className="text-slate-500 max-w-md mx-auto">
            The visual workflow builder is currently under development. Soon you'll be able to create complex, multi-step signing automations.
          </p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

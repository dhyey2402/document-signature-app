import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

export default function Candidates() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Candidates</h1>
        <p className="text-slate-500 mt-1">Manage candidate profiles and their document progress.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="h-12 w-12 rounded-full bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center text-accent-700 font-bold text-lg">
                  JD
                </div>
                <Badge variant="pending">In Progress</Badge>
              </div>
              <h3 className="font-semibold text-lg">John Doe {i}</h3>
              <p className="text-sm text-slate-500 mb-4">Software Engineer Candidate</p>
              
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Offer Letter</span>
                  <span className="text-success font-medium">Signed</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">NDA</span>
                  <span className="text-warning font-medium">Pending</span>
                </div>
              </div>
              
              <Button variant="outline" className="w-full">View Profile</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}

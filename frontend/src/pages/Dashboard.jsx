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

const stats = [
  { title: "Candidate Documents", value: "142", icon: FileText, change: "+12%" },
  { title: "Pending Signatures", value: "28", icon: Clock, change: "-4%" },
  { title: "Completed", value: "114", icon: CheckCircle, change: "+18%" },
  { title: "Active Candidates", value: "45", icon: Users, change: "+7%" },
];

const recentActivity = [
  { id: 1, user: "Sarah Jenkins", action: "signed", document: "Offer Letter - Q3", time: "2 hours ago", status: "completed" },
  { id: 2, user: "Michael Chen", action: "viewed", document: "NDA Agreement", time: "4 hours ago", status: "pending" },
  { id: 3, user: "Emily Davis", action: "signed", document: "Employee Handbook", time: "Yesterday", status: "completed" },
  { id: 4, user: "James Wilson", action: "received", document: "Contract Renewal", time: "Yesterday", status: "pending" },
];

function Dashboard() {
  const { user } = useContext(AuthContext);

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Recruitment Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back. Here's your hiring pipeline today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="hidden sm:flex">
            Download Report
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New Document
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`text-xs mt-1 ${stat.change.startsWith('+') ? 'text-success' : 'text-error'}`}>
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
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
              <Link to="/candidates">
                <Users className="mr-3 h-4 w-4 text-accent-600" />
                Add Candidate
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start h-12" asChild>
              <Link to="/workflows">
                <CheckSquare className="mr-3 h-4 w-4 text-warning" />
                Create Workflow
              </Link>
            </Button>
            
            <div className="mt-8 p-4 rounded-xl bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-900/20">
              <h4 className="font-semibold text-sm text-primary-900 dark:text-primary-100 mb-2">Need help?</h4>
              <p className="text-xs text-primary-700 dark:text-primary-300 mb-3">Check out our guide on creating binding digital signatures.</p>
              <Button variant="link" className="p-0 h-auto text-xs text-primary-600 font-semibold">
                Read the guide <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;
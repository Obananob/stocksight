import { Card } from "@/components/ui/card";
import { Package, TrendingUp, AlertTriangle, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const stats = [
    {
      title: "Today's Sales",
      value: "₦45,300",
      change: "+12.5%",
      icon: TrendingUp,
      trend: "up",
    },
    {
      title: "Current Stock Value",
      value: "₦2.3M",
      change: "-2.1%",
      icon: Package,
      trend: "down",
    },
    {
      title: "Low Stock Items",
      value: "7",
      change: "3 critical",
      icon: AlertTriangle,
      trend: "warning",
    },
    {
      title: "Products Sold Today",
      value: "42",
      change: "+8 from yesterday",
      icon: Activity,
      trend: "up",
    },
  ];

  const recentActivity = [
    { action: "Stock added", item: "Coca-Cola 50cl", user: "John Doe", time: "5 mins ago" },
    { action: "Sale recorded", item: "Indomie Chicken", user: "Sarah Mike", time: "12 mins ago" },
    { action: "Low stock alert", item: "Peak Milk", user: "System", time: "1 hour ago" },
    { action: "Sale recorded", item: "Milo 400g", user: "Sarah Mike", time: "2 hours ago" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome back! Here's your business overview</p>
            </div>
            <Button className="bg-primary hover:bg-primary-hover">
              Quick Actions
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="p-6 transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <h3 className="mt-2 text-3xl font-bold text-foreground">{stat.value}</h3>
                  <p
                    className={`mt-2 text-sm font-medium ${
                      stat.trend === "up"
                        ? "text-success"
                        : stat.trend === "warning"
                        ? "text-warning"
                        : "text-muted-foreground"
                    }`}
                  >
                    {stat.change}
                  </p>
                </div>
                <div
                  className={`rounded-lg p-3 ${
                    stat.trend === "up"
                      ? "bg-accent text-accent-foreground"
                      : stat.trend === "warning"
                      ? "bg-warning/10 text-warning"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Activity */}
          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold text-foreground">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-4 border-b pb-4 last:border-0 last:pb-0">
                  <div className="rounded-full bg-accent p-2">
                    <Activity className="h-4 w-4 text-accent-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.item} • {activity.user}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold text-foreground">Quick Actions</h2>
            <div className="grid gap-3">
              <Button className="w-full justify-start bg-primary hover:bg-primary-hover" size="lg">
                <Package className="mr-2 h-5 w-5" />
                Add Stock
              </Button>
              <Button className="w-full justify-start" variant="outline" size="lg">
                <TrendingUp className="mr-2 h-5 w-5" />
                Record Sale
              </Button>
              <Button className="w-full justify-start" variant="outline" size="lg">
                <Activity className="mr-2 h-5 w-5" />
                View Reports
              </Button>
              <Button className="w-full justify-start" variant="outline" size="lg">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Reconciliation
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Package, TrendingUp, AlertTriangle, Activity, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/contexts/SettingsContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface DashboardStats {
  todaySales: number;
  stockValue: number;
  lowStockCount: number;
  productsSoldToday: number;
}

interface ActivityItem {
  id: string;
  action: string;
  item: string;
  user: string;
  time: string;
}

const Dashboard = () => {
  const { signOut, user } = useAuth();
  const { formatCurrency, t } = useSettings();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    todaySales: 0,
    stockValue: 0,
    lowStockCount: 0,
    productsSoldToday: 0,
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
      setupRealtimeSubscriptions();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Get today's sales
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('total_price, quantity')
        .gte('created_at', today);

      if (salesError) throw salesError;

      const todaySales = salesData?.reduce((sum, sale) => sum + Number(sale.total_price), 0) || 0;
      const productsSoldToday = salesData?.reduce((sum, sale) => sum + sale.quantity, 0) || 0;

      // Get stock value and low stock count
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('current_stock, cost_price, low_stock_threshold');

      if (productsError) throw productsError;

      const stockValue = productsData?.reduce(
        (sum, product) => sum + (product.current_stock * Number(product.cost_price)),
        0
      ) || 0;

      const lowStockCount = productsData?.filter(
        product => product.current_stock <= product.low_stock_threshold
      ).length || 0;

      // Get recent activity
      const { data: logsData, error: logsError } = await supabase
        .from('inventory_logs')
        .select(`
          id,
          action_type,
          change_quantity,
          created_at,
          user_id,
          products:product_id(name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (logsError) throw logsError;

      // Fetch user profiles separately for the activity logs
      const userIds = [...new Set(logsData?.map(log => log.user_id).filter(Boolean))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', userIds);

      const profilesMap = new Map(profilesData?.map(p => [p.id, p.name]) || []);

      const activity = logsData?.map(log => {
        const productName = (log.products as any)?.name || t("common.unknownProduct");
        const userName = profilesMap.get(log.user_id) || t("common.system");
        const timeAgo = getTimeAgo(new Date(log.created_at));

        let action = t("dashboard.stockAdjusted");
        if (log.action_type === 'add') action = t("dashboard.stockAdded");
        if (log.action_type === 'sale') action = t("dashboard.saleRecorded");

        return {
          id: log.id,
          action,
          item: productName,
          user: userName,
          time: timeAgo,
        };
      }) || [];

      setStats({
        todaySales,
        stockValue,
        lowStockCount,
        productsSoldToday,
      });
      setRecentActivity(activity);
      setLoading(false);
    } catch (error: any) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    const salesChannel = supabase
      .channel('sales-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sales'
        },
        () => {
          loadDashboardData();
        }
      )
      .subscribe();

    const productsChannel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        () => {
          loadDashboardData();
        }
      )
      .subscribe();

    const logsChannel = supabase
      .channel('logs-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'inventory_logs'
        },
        () => {
          loadDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(salesChannel);
      supabase.removeChannel(productsChannel);
      supabase.removeChannel(logsChannel);
    };
  };

  const getTimeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds} ${t("common.secondsAgo")}`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} ${minutes === 1 ? t("common.minuteAgo") : t("common.minutesAgo")}`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ${hours === 1 ? t("common.hourAgo") : t("common.hoursAgo")}`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} ${days === 1 ? t("common.dayAgo") : t("common.daysAgo")}`;
    return date.toLocaleDateString();
  };

  const statsConfig = [
    {
      title: t("dashboard.todaySales"),
      value: formatCurrency(stats.todaySales),
      change: loading ? "..." : `${stats.productsSoldToday} ${t("dashboard.productsSold")}`,
      icon: TrendingUp,
      trend: "up",
    },
    {
      title: t("dashboard.totalStock"),
      value: formatCurrency(stats.stockValue),
      change: loading ? "..." : t("dashboard.totalInventory"),
      icon: Package,
      trend: "neutral",
    },
    {
      title: t("dashboard.lowStock"),
      value: stats.lowStockCount.toString(),
      change: stats.lowStockCount > 0 ? `${stats.lowStockCount} ${t("dashboard.needAttention")}` : t("dashboard.allGood"),
      icon: AlertTriangle,
      trend: stats.lowStockCount > 0 ? "warning" : "neutral",
    },
    {
      title: t("dashboard.productsSold"),
      value: stats.productsSoldToday.toString(),
      change: loading ? "..." : t("dashboard.units"),
      icon: Activity,
      trend: "up",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{t("dashboard.title")}</h1>
              <p className="text-sm text-muted-foreground">{t("dashboard.subtitle")}</p>
            </div>
            <Button
              onClick={signOut}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              {t("nav.signout")}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statsConfig.map((stat) => (
            <Card key={stat.title} className="p-6 transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <h3 className="mt-2 text-3xl font-bold text-foreground">{stat.value}</h3>
                  <p
                    className={`mt-2 text-sm font-medium ${stat.trend === "up"
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
                  className={`rounded-lg p-3 ${stat.trend === "up"
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
            <h2 className="text-xl font-semibold">{t("dashboard.recentActivity")}</h2>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("dashboard.noActivity")}</p>
              ) : (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 border-b pb-4 last:border-0 last:pb-0">
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
                ))
              )}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold">{t("dashboard.quickActions")}</h2>
            <div className="grid gap-3">
              <Button
                className="w-full justify-start bg-primary hover:bg-primary-hover"
                size="lg"
                onClick={() => navigate('/inventory')}
              >
                <Package className="mr-2 h-5 w-5" />
                {t("inventory.manageInventory")}
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                size="lg"
                onClick={() => navigate('/sales')}
              >
                <TrendingUp className="mr-2 h-5 w-5" />
                {t("sales.title")}
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                size="lg"
                onClick={() => navigate('/reports')}
              >
                <Activity className="mr-2 h-5 w-5" />
                {t("reports.title")}
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                size="lg"
                onClick={() => navigate('/reconciliation')}
              >
                <AlertTriangle className="mr-2 h-5 w-5" />
                {t("reconciliation.title")}
              </Button>
            </div>
          </Card>
        </div>
      </main >
    </div >
  );
};

export default Dashboard;

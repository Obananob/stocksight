import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FileText, TrendingUp, DollarSign, Package } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface SalesData {
  date: string;
  total: number;
  count: number;
}

interface TopProduct {
  name: string;
  total_sales: number;
  quantity_sold: number;
}

const Reports = () => {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalSales, setTotalSales] = useState(0);

  useEffect(() => {
    fetchReports();
  }, [period]);

  const fetchReports = async () => {
    try {
      const daysBack = period === "daily" ? 7 : period === "weekly" ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      // Fetch sales data
      const { data: sales, error: salesError } = await supabase
        .from("sales")
        .select("created_at, total_price, quantity")
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true });

      if (salesError) throw salesError;

      // Group sales by period
      const grouped = sales?.reduce((acc: any, sale) => {
        const date = new Date(sale.created_at).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = { date, total: 0, count: 0 };
        }
        acc[date].total += sale.total_price;
        acc[date].count += sale.quantity;
        return acc;
      }, {});

      setSalesData(Object.values(grouped || {}));

      // Calculate totals
      const revenue = sales?.reduce((sum, sale) => sum + sale.total_price, 0) || 0;
      const count = sales?.reduce((sum, sale) => sum + sale.quantity, 0) || 0;
      setTotalRevenue(revenue);
      setTotalSales(count);

      // Fetch top products
      const { data: topProds, error: topError } = await supabase
        .from("sales")
        .select("product_id, total_price, quantity, products(name)")
        .gte("created_at", startDate.toISOString());

      if (topError) throw topError;

      const productSales = topProds?.reduce((acc: any, sale: any) => {
        const name = sale.products?.name || "Unknown";
        if (!acc[name]) {
          acc[name] = { name, total_sales: 0, quantity_sold: 0 };
        }
        acc[name].total_sales += sale.total_price;
        acc[name].quantity_sold += sale.quantity;
        return acc;
      }, {});

      const sorted = Object.values(productSales || {})
        .sort((a: any, b: any) => b.total_sales - a.total_sales)
        .slice(0, 5);

      setTopProducts(sorted as TopProduct[]);
    } catch (error: any) {
      toast.error("Failed to load reports");
      console.error(error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-primary/10">
          <FileText className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground">Track your sales performance</p>
        </div>
      </div>

      <Tabs value={period} onValueChange={(v) => setPeriod(v as any)}>
        <TabsList>
          <TabsTrigger value="daily">Last 7 Days</TabsTrigger>
          <TabsTrigger value="weekly">Last 30 Days</TabsTrigger>
          <TabsTrigger value="monthly">Last 90 Days</TabsTrigger>
        </TabsList>

        <TabsContent value={period} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Sales</p>
                  <p className="text-2xl font-bold">{totalSales}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Sale Value</p>
                  <p className="text-2xl font-bold">
                    {totalSales > 0 ? formatCurrency(totalRevenue / totalSales) : formatCurrency(0)}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Sales Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" name="Revenue (₦)" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Top Selling Products</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="total_sales" fill="hsl(var(--primary))" name="Revenue (₦)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;

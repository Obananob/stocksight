import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/contexts/SettingsContext";
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
  profit: number;
  count: number;
}

interface TopProduct {
  name: string;
  total_sales: number;
  quantity_sold: number;
  profit: number;
}

const Reports = () => {
  const { formatCurrency, getCurrencyInfo, t } = useSettings();
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);

  useEffect(() => {
    fetchReports();
  }, [period]);

  const fetchReports = async () => {
    try {
      const daysBack = period === "daily" ? 7 : period === "weekly" ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      // Fetch sales data with product info for profit calculation
      const { data: sales, error: salesError } = await supabase
        .from("sales")
        .select("created_at, total_price, quantity, unit_price, product_id, products(cost_price)")
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true });

      if (salesError) throw salesError;

      // Group sales by period
      const grouped = sales?.reduce((acc: any, sale: any) => {
        const date = new Date(sale.created_at).toLocaleDateString();
        const profit = (sale.unit_price - (sale.products?.cost_price || 0)) * sale.quantity;
        if (!acc[date]) {
          acc[date] = { date, total: 0, profit: 0, count: 0 };
        }
        acc[date].total += sale.total_price;
        acc[date].profit += profit;
        acc[date].count += sale.quantity;
        return acc;
      }, {});

      setSalesData(Object.values(grouped || {}));

      // Calculate totals
      const revenue = sales?.reduce((sum, sale) => sum + sale.total_price, 0) || 0;
      const count = sales?.reduce((sum, sale) => sum + sale.quantity, 0) || 0;
      const profit = sales?.reduce((sum, sale: any) => {
        const saleProfit = (sale.unit_price - (sale.products?.cost_price || 0)) * sale.quantity;
        return sum + saleProfit;
      }, 0) || 0;

      setTotalRevenue(revenue);
      setTotalSales(count);
      setTotalProfit(profit);

      // Fetch top products
      const { data: topProds, error: topError } = await supabase
        .from("sales")
        .select("product_id, total_price, quantity, unit_price, products(name, cost_price)")
        .gte("created_at", startDate.toISOString());

      if (topError) throw topError;

      const productSales = topProds?.reduce((acc: any, sale: any) => {
        const name = sale.products?.name || "Unknown";
        const profit = (sale.unit_price - (sale.products?.cost_price || 0)) * sale.quantity;
        if (!acc[name]) {
          acc[name] = { name, total_sales: 0, quantity_sold: 0, profit: 0 };
        }
        acc[name].total_sales += sale.total_price;
        acc[name].quantity_sold += sale.quantity;
        acc[name].profit += profit;
        return acc;
      }, {});

      const sorted = Object.values(productSales || {})
        .sort((a: any, b: any) => b.total_sales - a.total_sales)
        .slice(0, 5);

      setTopProducts(sorted as TopProduct[]);
    } catch (error: any) {
      toast.error(t("reports.failed"));
      console.error(error);
    }
  };

  const currencySymbol = getCurrencyInfo().symbol;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-primary/10">
          <FileText className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("reports.title")}</h1>
          <p className="text-muted-foreground">{t("reports.subtitle")}</p>
        </div>
      </div>

      <Tabs value={period} onValueChange={(v) => setPeriod(v as any)}>
        <TabsList>
          <TabsTrigger value="daily">{t("reports.daily")}</TabsTrigger>
          <TabsTrigger value="weekly">{t("reports.weekly")}</TabsTrigger>
          <TabsTrigger value="monthly">{t("reports.monthly")}</TabsTrigger>
        </TabsList>

        <TabsContent value={period} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("reports.revenue")}</p>
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
                  <p className="text-sm text-muted-foreground">{t("dashboard.todaySales")}</p>
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
                  <p className="text-sm text-muted-foreground">{t("reports.avgSaleValue")}</p>
                  <p className="text-2xl font-bold">
                    {totalSales > 0 ? formatCurrency(totalRevenue / totalSales) : formatCurrency(0)}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("reports.profit")}</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(totalProfit)}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">{t("reports.salesTrend")}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" name={`${t("reports.revenue")} (${currencySymbol})`} />
                <Line type="monotone" dataKey="profit" stroke="#F39C12" name={`${t("reports.profit")} (${currencySymbol})`} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">{t("reports.topProducts")}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="total_sales" fill="hsl(var(--primary))" name={`${t("reports.revenue")} (${currencySymbol})`} />
                <Bar dataKey="profit" fill="#F39C12" name={`${t("reports.profit")} (${currencySymbol})`} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;

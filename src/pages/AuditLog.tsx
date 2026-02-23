import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield, TrendingUp, TrendingDown, Package, ShoppingCart } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AuditLog {
  id: string;
  action_type: string;
  change_quantity: number;
  previous_stock: number;
  new_stock: number;
  created_at: string;
  product_id: string;
  products?: { name: string };
}

const AuditLog = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useSettings();

  useEffect(() => {
    fetchLogs();

    // Set up real-time subscription
    const channel = supabase
      .channel("audit-logs")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "inventory_logs",
        },
        () => {
          fetchLogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("inventory_logs")
        .select("*, products(name)")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      setLogs(data || []);
    } catch (error: any) {
      toast.error(t("audit.loadFailed"));
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case "sale":
        return <ShoppingCart className="h-4 w-4 text-primary" />;
      case "restock":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "adjustment":
        return <Package className="h-4 w-4 text-orange-500" />;
      default:
        return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case "sale":
        return "text-primary";
      case "restock":
        return "text-green-500";
      case "adjustment":
        return "text-orange-500";
      default:
        return "text-red-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-primary/10">
          <Shield className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("audit.title")}</h1>
          <p className="text-muted-foreground">
            {t("audit.subtitle")}
          </p>
        </div>
      </div>

      <Card className="p-6">
        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">{t("common.loading")}</p>
        ) : logs.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">{t("audit.noLogs")}</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("audit.date")}</TableHead>
                  <TableHead>{t("audit.product")}</TableHead>
                  <TableHead>{t("audit.action")}</TableHead>
                  <TableHead className="text-right">{t("audit.quantity")}</TableHead>
                  <TableHead className="text-right">{t("audit.previousStock")}</TableHead>
                  <TableHead className="text-right">{t("audit.newStock")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium">
                      {log.products?.name || t("common.unknown")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action_type)}
                        <span className={`capitalize ${getActionColor(log.action_type)}`}>
                          {log.action_type === "sale" ? t("audit.actionSale") :
                            log.action_type === "restock" ? t("audit.actionRestock") :
                              log.action_type === "adjustment" ? t("audit.actionAdjustment") : log.action_type}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell
                      className={`text-right font-semibold ${log.change_quantity > 0 ? "text-green-500" : "text-red-500"
                        }`}
                    >
                      {log.change_quantity > 0 ? "+" : ""}
                      {log.change_quantity}
                    </TableCell>
                    <TableCell className="text-right">{log.previous_stock}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {log.new_stock}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AuditLog;

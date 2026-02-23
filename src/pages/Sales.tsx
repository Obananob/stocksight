import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/contexts/SettingsContext";
import { toast } from "sonner";
import { ShoppingCart, Package, Download } from "lucide-react";
import { offlineStorage } from "@/utils/offlineStorage";
import { generateReceipt } from "@/utils/receiptGenerator";
import { useAuth } from "@/hooks/useAuth";

interface Product {
  id: string;
  name: string;
  unit_price: number;
  cost_price: number;
  current_stock: number;
}

const Sales = () => {
  const { formatCurrency, getCurrencyInfo, t } = useSettings();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("1");
  const [isLoading, setIsLoading] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, unit_price, cost_price, current_stock")
      .gt("current_stock", 0)
      .order("name");

    if (error) {
      toast.error(t("sales.loadFailed"));
      return;
    }

    setProducts(data || []);
  };

  const handleRecordSale = async () => {
    if (!selectedProduct || !quantity || parseInt(quantity) <= 0) {
      toast.error(t("sales.enterValidQuantity"));
      return;
    }

    const product = products.find((p) => p.id === selectedProduct);
    if (!product) return;

    if (parseInt(quantity) > product.current_stock) {
      toast.error(t("sales.insufficientStock"));
      return;
    }

    setIsLoading(true);

    try {
      if (!user) throw new Error("Not authenticated");

      const quantityNum = parseInt(quantity);
      const totalPrice = product.unit_price * quantityNum;
      const createdAt = new Date().toISOString();

      // Offline-first logic: Save locally first
      await offlineStorage.saveSale({
        product_id: selectedProduct,
        product_name: product.name,
        user_id: user.id,
        quantity: quantityNum,
        unit_price: product.unit_price,
        total_price: totalPrice,
        created_at: createdAt
      });

      // Attempt to sync immediately with Supabase
      try {
        // Record the sale
        const { error: saleError } = await supabase
          .from("sales")
          .insert({
            product_id: selectedProduct,
            user_id: user.id,
            quantity: quantityNum,
            unit_price: product.unit_price,
            total_price: totalPrice,
            created_at: createdAt
          });

        if (saleError) throw saleError;

        // Update product stock
        const newStock = product.current_stock - quantityNum;
        const { error: stockError } = await supabase
          .from("products")
          .update({ current_stock: newStock })
          .eq("id", selectedProduct);

        if (stockError) throw stockError;

        // Log inventory change
        await supabase.from("inventory_logs").insert({
          product_id: selectedProduct,
          user_id: user.id,
          action_type: "sale",
          change_quantity: -quantityNum,
          previous_stock: product.current_stock,
          new_stock: newStock,
          created_at: createdAt
        });

        toast.success(t("sales.recordedAndSynced"));
      } catch (syncError) {
        console.warn("Failed to sync automatically, saved offline:", syncError);
        toast.info(t("sales.savedOffline"));
      }

      setLastSale({
        businessName: "StockSight", // This should ideally come from profile
        items: [{
          name: product.name,
          quantity: quantityNum,
          price: product.unit_price,
          total: totalPrice
        }],
        totalAmount: totalPrice,
        userName: user.user_metadata?.name || user.email || t("common.staff")
      });

      setSelectedProduct("");
      setQuantity("1");
      fetchProducts();
    } catch (error: any) {
      toast.error(error.message || t("sales.failed"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReceipt = () => {
    if (!lastSale) return;

    const doc = generateReceipt({
      ...lastSale,
      receiptNumber: `REC-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleDateString(),
      currencySymbol: getCurrencyInfo().symbol
    });

    doc.save(`receipt-${Date.now()}.pdf`);
    toast.success(t("sales.receiptDownloaded"));
  };

  const selectedProductData = products.find((p) => p.id === selectedProduct);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-primary/10">
          <ShoppingCart className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("sales.title")}</h1>
          <p className="text-muted-foreground">{t("sales.subtitle")}</p>
        </div>
      </div>

      <Card className="p-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="product" className="text-lg">{t("sales.selectProduct")}</Label>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger id="product" className="h-12 text-lg">
                <SelectValue placeholder={t("sales.selectProductPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id} className="text-lg py-3">
                    <div className="flex items-center justify-between w-full">
                      <span>{product.name}</span>
                      <span className="text-muted-foreground ml-4">
                        {t("inventory.stockLabel")}: {product.current_stock}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedProductData && (
            <div className="p-4 rounded-lg bg-accent space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t("sales.unitPrice")}</span>
                <span className="text-2xl font-bold text-foreground">
                  {formatCurrency(selectedProductData.unit_price)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t("sales.profitPerUnit")}</span>
                <span className="font-semibold text-primary">
                  {formatCurrency(selectedProductData.unit_price - selectedProductData.cost_price)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-muted-foreground">{t("sales.availableStock")}</span>
                <span className="font-semibold">{selectedProductData.current_stock} {t("dashboard.units")}</span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-lg">{t("sales.quantity")}</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="h-12 text-lg"
              placeholder={t("sales.quantityPlaceholder")}
            />
          </div>

          {selectedProductData && quantity && parseInt(quantity) > 0 && (
            <div className="p-4 rounded-lg bg-primary/10 border-2 border-primary space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">{t("sales.totalAmount")}</span>
                <span className="text-3xl font-bold text-primary">
                  {formatCurrency(selectedProductData.unit_price * parseInt(quantity))}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm pt-2 border-t border-primary/20">
                <span className="text-foreground">{t("sales.totalProfitLabel")}</span>
                <span className="font-bold text-foreground">
                  {formatCurrency((selectedProductData.unit_price - selectedProductData.cost_price) * parseInt(quantity))}
                </span>
              </div>
            </div>
          )}

          <Button
            size="lg"
            className="w-full h-14 text-lg"
            onClick={handleRecordSale}
            disabled={isLoading || !selectedProduct || !quantity}
          >
            {isLoading ? t("sales.recording") : t("sales.recordSale")}
          </Button>

          {lastSale && (
            <Button
              variant="outline"
              size="lg"
              className="w-full h-14 text-lg flex items-center gap-2 border-primary text-primary hover:bg-primary/5"
              onClick={handleDownloadReceipt}
            >
              <Download className="h-5 w-5" />
              {t("sales.downloadReceipt")}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Sales;

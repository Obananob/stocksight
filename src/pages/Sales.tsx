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
import { toast } from "sonner";
import { ShoppingCart, Package } from "lucide-react";

interface Product {
  id: string;
  name: string;
  unit_price: number;
  cost_price: number;
  current_stock: number;
}

const Sales = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("1");
  const [isLoading, setIsLoading] = useState(false);

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
      toast.error("Failed to load products");
      return;
    }

    setProducts(data || []);
  };

  const handleRecordSale = async () => {
    if (!selectedProduct || !quantity || parseInt(quantity) <= 0) {
      toast.error("Please select a product and enter a valid quantity");
      return;
    }

    const product = products.find((p) => p.id === selectedProduct);
    if (!product) return;

    if (parseInt(quantity) > product.current_stock) {
      toast.error("Insufficient stock available");
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const quantityNum = parseInt(quantity);
      const totalPrice = product.unit_price * quantityNum;

      // Record the sale
      const { error: saleError } = await supabase
        .from("sales")
        .insert({
          product_id: selectedProduct,
          user_id: user.id,
          quantity: quantityNum,
          unit_price: product.unit_price,
          total_price: totalPrice,
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
      });

      toast.success(`Sale recorded! Total: ${formatCurrency(totalPrice)}`);
      setSelectedProduct("");
      setQuantity("1");
      fetchProducts();
    } catch (error: any) {
      toast.error(error.message || "Failed to record sale");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  const selectedProductData = products.find((p) => p.id === selectedProduct);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-primary/10">
          <ShoppingCart className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Record Sale</h1>
          <p className="text-muted-foreground">Quick and easy sales recording</p>
        </div>
      </div>

      <Card className="p-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="product" className="text-lg">Select Product</Label>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger id="product" className="h-12 text-lg">
                <SelectValue placeholder="Choose a product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id} className="text-lg py-3">
                    <div className="flex items-center justify-between w-full">
                      <span>{product.name}</span>
                      <span className="text-muted-foreground ml-4">
                        Stock: {product.current_stock}
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
                <span className="text-muted-foreground">Unit Price</span>
                <span className="text-2xl font-bold text-foreground">
                  {formatCurrency(selectedProductData.unit_price)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Profit per Unit</span>
                <span className="font-semibold text-primary">
                  {formatCurrency(selectedProductData.unit_price - selectedProductData.cost_price)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-muted-foreground">Available Stock</span>
                <span className="font-semibold">{selectedProductData.current_stock} units</span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-lg">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="h-12 text-lg"
              placeholder="Enter quantity"
            />
          </div>

          {selectedProductData && quantity && parseInt(quantity) > 0 && (
            <div className="p-4 rounded-lg bg-primary/10 border-2 border-primary space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total Amount</span>
                <span className="text-3xl font-bold text-primary">
                  {formatCurrency(selectedProductData.unit_price * parseInt(quantity))}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm pt-2 border-t border-primary/20">
                <span className="text-foreground">Total Profit</span>
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
            {isLoading ? "Recording..." : "Record Sale"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Sales;

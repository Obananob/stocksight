import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Package, Search, Plus, AlertTriangle } from "lucide-react";

const Inventory = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const products = [
    { id: 1, name: "Coca-Cola 50cl", stock: 45, lowStockThreshold: 20, costPrice: 150, unitPrice: 200 },
    { id: 2, name: "Indomie Chicken", stock: 120, lowStockThreshold: 50, costPrice: 80, unitPrice: 100 },
    { id: 3, name: "Peak Milk", stock: 8, lowStockThreshold: 15, costPrice: 350, unitPrice: 450 },
    { id: 4, name: "Milo 400g", stock: 25, lowStockThreshold: 20, costPrice: 800, unitPrice: 1000 },
    { id: 5, name: "Golden Penny Bread", stock: 15, lowStockThreshold: 10, costPrice: 500, unitPrice: 650 },
    { id: 6, name: "Dangote Sugar 1kg", stock: 5, lowStockThreshold: 12, costPrice: 600, unitPrice: 750 },
  ];

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockCount = products.filter((p) => p.stock <= p.lowStockThreshold).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
              <p className="text-sm text-muted-foreground">Manage your products and stock levels</p>
            </div>
            <Button className="bg-primary hover:bg-primary-hover">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Alert Banner */}
        {lowStockCount > 0 && (
          <Card className="mb-6 border-warning bg-warning/10 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <div>
                <h3 className="font-semibold text-warning">Low Stock Alert</h3>
                <p className="text-sm text-foreground">
                  {lowStockCount} product{lowStockCount > 1 ? "s" : ""} running low on stock. Consider restocking soon.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Search Bar */}
        <div className="mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button className="bg-primary hover:bg-primary-hover">
            <Plus className="mr-2 h-4 w-4" />
            Add Stock
          </Button>
        </div>

        {/* Products Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => {
            const isLowStock = product.stock <= product.lowStockThreshold;
            const stockPercentage = (product.stock / product.lowStockThreshold) * 100;

            return (
              <Card key={product.id} className="p-6 transition-shadow hover:shadow-md">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-accent p-3">
                      <Package className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">ID: {product.id}</p>
                    </div>
                  </div>
                  {isLowStock && (
                    <Badge variant="destructive" className="bg-warning text-warning-foreground">
                      Low Stock
                    </Badge>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Stock Level</span>
                      <span className={`font-semibold ${isLowStock ? "text-warning" : "text-success"}`}>
                        {product.stock} units
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full transition-all ${
                          isLowStock ? "bg-warning" : "bg-success"
                        }`}
                        style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Cost Price</p>
                      <p className="font-semibold text-foreground">₦{product.costPrice}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Unit Price</p>
                      <p className="font-semibold text-foreground">₦{product.unitPrice}</p>
                    </div>
                  </div>
                </div>

                <Button variant="outline" className="mt-4 w-full">
                  Manage Stock
                </Button>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Inventory;

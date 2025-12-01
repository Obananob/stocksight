import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Package, Plus, AlertTriangle, LogOut, Trash2, Edit, Search, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/contexts/SettingsContext";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  cost_price: number;
  unit_price: number;
  current_stock: number;
  low_stock_threshold: number;
  category: string | null;
}

const Inventory = () => {
  const { signOut, user } = useAuth();
  const { formatCurrency, getCurrencyInfo } = useSettings();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [editProductOpen, setEditProductOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Add Product Form State
  const [productName, setProductName] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [initialStock, setInitialStock] = useState("");
  const [lowStockThreshold, setLowStockThreshold] = useState("10");
  const [category, setCategory] = useState("");

  // Add Stock Form State
  const [stockQuantity, setStockQuantity] = useState("");

  useEffect(() => {
    if (user) {
      loadProducts();
      setupRealtimeSubscription();
    }
  }, [user]);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) throw error;

      setProducts(data || []);
      setLoading(false);
    } catch (error: any) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('products-inventory')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        () => {
          loadProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          name: productName,
          cost_price: parseFloat(costPrice),
          unit_price: parseFloat(unitPrice),
          current_stock: parseInt(initialStock),
          low_stock_threshold: parseInt(lowStockThreshold),
          category: category || null,
          owner_id: user?.id,
        })
        .select()
        .single();

      if (productError) throw productError;

      // Create initial inventory log
      const { error: logError } = await supabase
        .from('inventory_logs')
        .insert({
          product_id: product.id,
          user_id: user?.id,
          change_quantity: parseInt(initialStock),
          previous_stock: 0,
          new_stock: parseInt(initialStock),
          action_type: 'add',
        });

      if (logError) throw logError;

      toast.success('Product added successfully!');
      setAddProductOpen(false);
      resetProductForm();
      loadProducts();
    } catch (error: any) {
      console.error('Error adding product:', error);
      toast.error(error.message || 'Failed to add product');
    }
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct) return;

    try {
      const quantity = parseInt(stockQuantity);
      const newStock = selectedProduct.current_stock + quantity;

      const { error: updateError } = await supabase
        .from('products')
        .update({ current_stock: newStock })
        .eq('id', selectedProduct.id);

      if (updateError) throw updateError;

      const { error: logError } = await supabase
        .from('inventory_logs')
        .insert({
          product_id: selectedProduct.id,
          user_id: user?.id,
          change_quantity: quantity,
          previous_stock: selectedProduct.current_stock,
          new_stock: newStock,
          action_type: 'add',
        });

      if (logError) throw logError;

      toast.success('Stock added successfully!');
      setStockQuantity("");
      setSelectedProduct(null);
      loadProducts();
      
      // Close the dialog
      const closeButton = document.querySelector('[data-state="open"] button[type="button"]') as HTMLButtonElement;
      closeButton?.click();
    } catch (error: any) {
      console.error('Error adding stock:', error);
      toast.error(error.message || 'Failed to add stock');
    }
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      toast.success(`${productName} deleted successfully!`);
      loadProducts();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.error(error.message || 'Failed to delete product');
    }
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct) return;

    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: productName,
          cost_price: parseFloat(costPrice),
          unit_price: parseFloat(unitPrice),
          low_stock_threshold: parseInt(lowStockThreshold),
          category: category || null,
        })
        .eq('id', selectedProduct.id);

      if (error) throw error;

      toast.success('Product updated successfully!');
      setEditProductOpen(false);
      resetProductForm();
      setSelectedProduct(null);
      loadProducts();
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast.error(error.message || 'Failed to update product');
    }
  };

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setProductName(product.name);
    setCostPrice(product.cost_price.toString());
    setUnitPrice(product.unit_price.toString());
    setLowStockThreshold(product.low_stock_threshold.toString());
    setCategory(product.category || "");
    setEditProductOpen(true);
  };

  const resetProductForm = () => {
    setProductName("");
    setCostPrice("");
    setUnitPrice("");
    setInitialStock("");
    setLowStockThreshold("10");
    setCategory("");
  };

  const currencySymbol = getCurrencyInfo().symbol;

  // Get unique categories for filter
  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean))) as string[];

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading inventory...</p>
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
              <h1 className="text-2xl font-bold text-foreground">Inventory Management</h1>
              <p className="text-sm text-muted-foreground">Manage your products and stock levels</p>
            </div>
            <div className="flex gap-2">
              <Dialog open={addProductOpen} onOpenChange={setAddProductOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary-hover">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddProduct} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="productName">Product Name</Label>
                      <Input
                        id="productName"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        placeholder="e.g., Coca-Cola 50cl"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="costPrice">Cost Price ({currencySymbol})</Label>
                        <Input
                          id="costPrice"
                          type="number"
                          step="0.01"
                          value={costPrice}
                          onChange={(e) => setCostPrice(e.target.value)}
                          placeholder="0.00"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="unitPrice">Selling Price ({currencySymbol})</Label>
                        <Input
                          id="unitPrice"
                          type="number"
                          step="0.01"
                          value={unitPrice}
                          onChange={(e) => setUnitPrice(e.target.value)}
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="initialStock">Initial Stock</Label>
                        <Input
                          id="initialStock"
                          type="number"
                          value={initialStock}
                          onChange={(e) => setInitialStock(e.target.value)}
                          placeholder="0"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lowStockThreshold">Low Stock Alert</Label>
                        <Input
                          id="lowStockThreshold"
                          type="number"
                          value={lowStockThreshold}
                          onChange={(e) => setLowStockThreshold(e.target.value)}
                          placeholder="10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category (Optional)</Label>
                      <Input
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="e.g., Beverages, Snacks"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-primary hover:bg-primary-hover">
                      Add Product
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
              
              <Dialog open={editProductOpen} onOpenChange={setEditProductOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Product</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleEditProduct} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="editProductName">Product Name</Label>
                      <Input
                        id="editProductName"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        placeholder="e.g., Coca-Cola 50cl"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="editCostPrice">Cost Price ({currencySymbol})</Label>
                        <Input
                          id="editCostPrice"
                          type="number"
                          step="0.01"
                          value={costPrice}
                          onChange={(e) => setCostPrice(e.target.value)}
                          placeholder="0.00"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="editUnitPrice">Selling Price ({currencySymbol})</Label>
                        <Input
                          id="editUnitPrice"
                          type="number"
                          step="0.01"
                          value={unitPrice}
                          onChange={(e) => setUnitPrice(e.target.value)}
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editLowStockThreshold">Low Stock Alert</Label>
                      <Input
                        id="editLowStockThreshold"
                        type="number"
                        value={lowStockThreshold}
                        onChange={(e) => setLowStockThreshold(e.target.value)}
                        placeholder="10"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editCategory">Category (Optional)</Label>
                      <Input
                        id="editCategory"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="e.g., Beverages, Snacks"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-primary hover:bg-primary-hover">
                      Update Product
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
              <Button onClick={signOut} variant="outline">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Search and Filter */}
        {products.length > 0 && (
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        {products.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products yet</h3>
            <p className="text-muted-foreground mb-4">
              Get started by adding your first product to the inventory
            </p>
            <Button onClick={() => setAddProductOpen(true)} className="bg-primary hover:bg-primary-hover">
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Product
            </Button>
          </Card>
        ) : filteredProducts.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => {
              const isLowStock = product.current_stock <= product.low_stock_threshold;
              
              return (
                <Card key={product.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg text-foreground">{product.name}</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => openEditDialog(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                      {product.category && (
                        <span className="text-xs text-muted-foreground bg-accent px-2 py-1 rounded-full mt-1 inline-block">
                          {product.category}
                        </span>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-2xl font-bold ${isLowStock ? 'text-warning' : 'text-foreground'}`}>
                          {product.current_stock}
                        </span>
                        <span className="text-sm text-muted-foreground">in stock</span>
                      </div>
                    </div>
                    {isLowStock && (
                      <AlertTriangle className="h-5 w-5 text-warning" />
                    )}
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Cost Price:</span>
                      <span className="font-medium">{formatCurrency(product.cost_price)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Selling Price:</span>
                      <span className="font-medium">{formatCurrency(product.unit_price)}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t pt-2">
                      <span className="text-muted-foreground font-semibold">Profit/Unit:</span>
                      <span className="font-bold text-primary">
                        {formatCurrency(product.unit_price - product.cost_price)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Low Stock Alert:</span>
                      <span className="font-medium">{product.low_stock_threshold} units</span>
                    </div>
                  </div>

                  {isLowStock && (
                    <div className="mb-4 rounded-lg bg-warning/10 p-3">
                      <p className="text-sm text-warning font-medium">
                        ⚠️ Low stock alert! Only {product.current_stock} units remaining.
                      </p>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          className="flex-1 bg-primary hover:bg-primary-hover"
                          onClick={() => {
                            setSelectedProduct(product);
                            setStockQuantity("");
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Stock
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Stock - {product.name}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddStock} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="stockQuantity">Quantity to Add</Label>
                            <Input
                              id="stockQuantity"
                              type="number"
                              value={stockQuantity}
                              onChange={(e) => setStockQuantity(e.target.value)}
                              placeholder="Enter quantity"
                              min="1"
                              required
                            />
                            <p className="text-sm text-muted-foreground">
                              Current stock: {product.current_stock} units
                            </p>
                          </div>
                          <Button type="submit" className="w-full bg-primary hover:bg-primary-hover">
                            Add Stock
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Product?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{product.name}"? This action cannot be undone and will remove all associated inventory logs.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteProduct(product.id, product.name)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Inventory;

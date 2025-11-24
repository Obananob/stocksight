import { Button } from "@/components/ui/button";
import { Package, TrendingUp, Shield, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: TrendingUp,
      title: "Real-time Sales Tracking",
      description: "Monitor your sales as they happen with live updates and instant notifications",
    },
    {
      icon: Package,
      title: "Smart Inventory Management",
      description: "Keep track of stock levels with automatic low-stock alerts",
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Your data is protected with enterprise-grade security and daily backups",
    },
    {
      icon: Zap,
      title: "Works Offline",
      description: "Record sales even without internet. Syncs automatically when back online",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-background to-accent px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center text-center">
            {/* Logo */}
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary shadow-lg">
              <Package className="h-10 w-10 text-primary-foreground" />
            </div>

            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Welcome to <span className="text-primary">StockSight</span>
            </h1>
            <p className="mb-8 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              The complete inventory and sales tracking solution designed specifically for small shop owners.
              Simple, powerful, and works offline.
            </p>

            <div className="flex justify-center">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary-hover text-lg px-12"
                onClick={() => navigate("/auth")}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">
              Everything you need to manage your shop
            </h2>
            <p className="text-lg text-muted-foreground">
              Built for simplicity, designed for growth
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border bg-card p-6 transition-all hover:shadow-lg"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent transition-colors group-hover:bg-primary">
                  <feature.icon className="h-6 w-6 text-accent-foreground transition-colors group-hover:text-primary-foreground" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-accent px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground">
            Ready to transform your business?
          </h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Join hundreds of shop owners who trust StockSight to manage their inventory and sales
          </p>
          <Button
            size="lg"
            className="bg-primary hover:bg-primary-hover text-lg"
            onClick={() => navigate("/auth")}
          >
            Start Your Free Trial
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;

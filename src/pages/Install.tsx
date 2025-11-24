import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smartphone, Download, Check } from "lucide-react";

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-primary/10">
          <Smartphone className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Install StockSight</h1>
          <p className="text-muted-foreground">Get the mobile app experience</p>
        </div>
      </div>

      {isInstalled ? (
        <Card className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Check className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">App Installed!</h2>
          <p className="text-muted-foreground">
            StockSight is now installed on your device. You can access it from your home screen.
          </p>
        </Card>
      ) : (
        <Card className="p-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Why Install StockSight?</h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary mt-0.5" />
                  <span>Works offline - Record sales even without internet</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary mt-0.5" />
                  <span>Quick access from home screen</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary mt-0.5" />
                  <span>Fast loading and smooth performance</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary mt-0.5" />
                  <span>Full-screen app experience</span>
                </li>
              </ul>
            </div>

            {deferredPrompt ? (
              <Button
                size="lg"
                className="w-full h-14 text-lg"
                onClick={handleInstall}
              >
                <Download className="mr-2 h-5 w-5" />
                Install App
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-accent">
                  <p className="text-sm text-muted-foreground">
                    To install StockSight on your device:
                  </p>
                  <ul className="mt-2 space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="font-semibold">iPhone/iPad:</span>
                      <span>Tap the Share button, then "Add to Home Screen"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold">Android:</span>
                      <span>Tap the menu (⋮), then "Add to Home Screen" or "Install App"</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h3 className="font-semibold mb-3">Features Available Offline:</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Record sales transactions</li>
          <li>• View product inventory</li>
          <li>• Check low stock alerts</li>
          <li>• Access recent activity</li>
        </ul>
        <p className="text-sm text-muted-foreground mt-4">
          All offline actions will automatically sync when you're back online.
        </p>
      </Card>
    </div>
  );
};

export default Install;

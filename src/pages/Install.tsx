import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smartphone, Download, Check } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const { t } = useSettings();

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
          <h1 className="text-3xl font-bold text-foreground">{t("install.title")}</h1>
          <p className="text-muted-foreground">{t("install.subtitle")}</p>
        </div>
      </div>

      {isInstalled ? (
        <Card className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Check className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{t("install.installedTitle")}</h2>
          <p className="text-muted-foreground">
            {t("install.installedDesc")}
          </p>
        </Card>
      ) : (
        <Card className="p-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">{t("install.whyTitle")}</h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary mt-0.5" />
                  <span>{t("install.feature1")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary mt-0.5" />
                  <span>{t("install.feature2")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary mt-0.5" />
                  <span>{t("install.feature3")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary mt-0.5" />
                  <span>{t("install.feature4")}</span>
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
                {t("install.button")}
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-accent">
                  <p className="text-sm text-muted-foreground">
                    {t("install.howTitle")}
                  </p>
                  <ul className="mt-2 space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="font-semibold">iPhone/iPad:</span>
                      <span>{t("install.howIos")}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold">Android:</span>
                      <span>{t("install.howAndroid")}</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h3 className="font-semibold mb-3">{t("install.offlineTitle")}</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• {t("install.offline1")}</li>
          <li>• {t("install.offline2")}</li>
          <li>• {t("install.offline3")}</li>
          <li>• {t("install.offline4")}</li>
        </ul>
        <p className="text-sm text-muted-foreground mt-4">
          {t("install.syncNote")}
        </p>
      </Card>
    </div>
  );
};

export default Install;

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { t } = useSettings();
  
  const handleFeedback = () => {
    // Opens feedback form - can be customized with your feedback URL
    window.open("https://forms.gle/your-feedback-form", "_blank");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center justify-between border-b bg-card px-4 sticky top-0 z-10">
            <SidebarTrigger />
            <Button
              variant="outline"
              size="sm"
              onClick={handleFeedback}
              className="flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">{t("feedback.button")}</span>
            </Button>
          </header>
          <main className="flex-1 p-6 overflow-auto bg-background">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

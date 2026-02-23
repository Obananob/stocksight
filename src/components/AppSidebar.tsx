import { LayoutDashboard, Package, ShoppingCart, FileText, ClipboardList, Shield, LogOut, User, Smartphone, Users } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/contexts/SettingsContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { offlineStorage } from "@/utils/offlineStorage";
import { Cloud, CloudOff, RefreshCw } from "lucide-react";

const ownerItems = [
  { title: "nav.dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "nav.inventory", url: "/inventory", icon: Package },
  { title: "nav.sales", url: "/sales", icon: ShoppingCart },
  { title: "nav.team", url: "/team", icon: Users },
  { title: "nav.reports", url: "/reports", icon: FileText },
  { title: "nav.reconciliation", url: "/reconciliation", icon: ClipboardList },
  { title: "nav.audit", url: "/audit", icon: Shield },
  { title: "nav.profile", url: "/profile", icon: User },
  { title: "nav.install", url: "/install", icon: Smartphone },
];

const salesRepItems = [
  { title: "nav.sales", url: "/sales", icon: ShoppingCart },
  { title: "nav.inventory", url: "/inventory", icon: Package },
  { title: "nav.profile", url: "/profile", icon: User },
  { title: "nav.install", url: "/install", icon: Smartphone },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { user, signOut, userRole } = useAuth();
  const { t } = useSettings();
  const currentPath = location.pathname;

  // Use the actual user role to determine navigation items
  const items = userRole === "sales_rep" ? salesRepItems : ownerItems;

  const isCollapsed = state === "collapsed";

  return (
    <Sidebar
      className={isCollapsed ? "w-14" : "w-60"}
      collapsible="icon"
    >
      <div className="flex items-center justify-between p-4 border-b bg-card">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg text-foreground">ShopCount</span>
          </div>
        )}
        {isCollapsed && (
          <Package className="h-6 w-6 text-primary mx-auto" />
        )}
      </div>

      <SidebarContent className="bg-card">
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground font-medium">
            {t("nav.navigation")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                      activeClassName="bg-primary text-primary-foreground font-medium hover:bg-primary hover:text-primary-foreground"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!isCollapsed && <span>{t(item.title)}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t bg-card">
        <SyncStatus isCollapsed={isCollapsed} />
        {!isCollapsed && user && (
          <div className="mb-2 text-sm text-muted-foreground truncate">
            {user.email}
          </div>
        )}
        <Button
          variant="ghost"
          size={isCollapsed ? "icon" : "default"}
          onClick={signOut}
          className="w-full justify-start text-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span className="ml-2">{t("nav.signout")}</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

function SyncStatus({ isCollapsed }: { isCollapsed: boolean }) {
  const [pendingCount, setPendingCount] = useState(0);
  const { t } = useSettings();

  useEffect(() => {
    const checkSync = async () => {
      const unsynced = await offlineStorage.getUnsyncedSales();
      setPendingCount(unsynced.length);
    };

    checkSync();
    const interval = setInterval(checkSync, 5000); // Check every 5s
    return () => clearInterval(interval);
  }, []);

  if (pendingCount === 0) {
    return !isCollapsed ? (
      <div className="flex items-center gap-2 px-1 mb-4 text-xs text-green-500">
        <Cloud className="h-4 w-4" />
        <span>{t("sales.allSynced")}</span>
      </div>
    ) : (
      <Cloud className="h-4 w-4 text-green-500 mx-auto mb-4" />
    );
  }

  return !isCollapsed ? (
    <div className="flex items-center gap-3 px-1 mb-4 text-xs text-amber-500 font-medium">
      <RefreshCw className="h-4 w-4 animate-spin" />
      <span>{t("sales.pendingSyncs").replace("{count}", pendingCount.toString())}</span>
    </div>
  ) : (
    <div className="relative mx-auto mb-4">
      <CloudOff className="h-4 w-4 text-amber-500" />
      <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[8px] rounded-full w-3 h-3 flex items-center justify-center">
        {pendingCount}
      </span>
    </div>
  );
}

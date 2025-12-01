import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type Currency = "NGN" | "USD" | "EUR" | "INR" | "GHS";
export type Language = "en" | "ha" | "ig" | "yo";

interface CurrencyInfo {
  code: Currency;
  symbol: string;
  name: string;
}

interface LanguageInfo {
  code: Language;
  name: string;
  nativeName: string;
}

export const currencies: CurrencyInfo[] = [
  { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "GHS", symbol: "GH₵", name: "Ghanaian Cedi" },
];

export const languages: LanguageInfo[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "ha", name: "Hausa", nativeName: "Hausa" },
  { code: "ig", name: "Igbo", nativeName: "Igbo" },
  { code: "yo", name: "Yoruba", nativeName: "Yorùbá" },
];

interface SettingsContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  language: Language;
  setLanguage: (language: Language) => void;
  formatCurrency: (amount: number) => string;
  t: (key: string) => string;
  getCurrencyInfo: () => CurrencyInfo;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Translation keys
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.inventory": "Inventory",
    "nav.sales": "Record Sale",
    "nav.reports": "Reports",
    "nav.reconciliation": "Reconciliation",
    "nav.audit": "Audit Log",
    "nav.profile": "Profile",
    "nav.install": "Install App",
    "nav.signout": "Sign Out",
    "nav.navigation": "Navigation",
    // Common
    "common.save": "Save Changes",
    "common.saving": "Saving...",
    "common.loading": "Loading...",
    "common.search": "Search",
    "common.filter": "Filter",
    "common.add": "Add",
    "common.edit": "Edit",
    "common.delete": "Delete",
    "common.cancel": "Cancel",
    "common.confirm": "Confirm",
    "common.actions": "Actions",
    // Profile
    "profile.title": "Profile Settings",
    "profile.subtitle": "Manage your account information",
    "profile.personal": "Personal Information",
    "profile.name": "Full Name",
    "profile.email": "Email",
    "profile.phone": "Phone Number",
    "profile.password": "Change Password",
    "profile.newPassword": "New Password",
    "profile.confirmPassword": "Confirm New Password",
    "profile.updatePassword": "Update Password",
    "profile.preferences": "Preferences",
    "profile.currency": "Currency",
    "profile.language": "Language",
    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.todaySales": "Today's Sales",
    "dashboard.totalStock": "Total Stock",
    "dashboard.lowStock": "Low Stock Items",
    "dashboard.totalProfit": "Total Profit",
    // Inventory
    "inventory.title": "Inventory",
    "inventory.addProduct": "Add Product",
    "inventory.editProduct": "Edit Product",
    "inventory.productName": "Product Name",
    "inventory.category": "Category",
    "inventory.costPrice": "Cost Price",
    "inventory.sellingPrice": "Selling Price",
    "inventory.stock": "Current Stock",
    "inventory.threshold": "Low Stock Threshold",
    // Sales
    "sales.title": "Record Sale",
    "sales.selectProduct": "Select Product",
    "sales.quantity": "Quantity",
    "sales.unitPrice": "Unit Price",
    "sales.total": "Total",
    "sales.profit": "Profit",
    "sales.record": "Record Sale",
    // Feedback
    "feedback.button": "Feedback",
  },
  ha: {
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.inventory": "Kayan Ajiya",
    "nav.sales": "Rubuta Sayarwa",
    "nav.reports": "Rahotanni",
    "nav.reconciliation": "Sulhu",
    "nav.audit": "Tarihin Aiki",
    "nav.profile": "Bayanai",
    "nav.install": "Shigar da App",
    "nav.signout": "Fita",
    "nav.navigation": "Kewayawa",
    // Common
    "common.save": "Ajiye Canje-canje",
    "common.saving": "Ana Ajiyewa...",
    "common.loading": "Ana lodi...",
    "common.search": "Nema",
    "common.filter": "Tace",
    "common.add": "Ƙara",
    "common.edit": "Gyara",
    "common.delete": "Share",
    "common.cancel": "Soke",
    "common.confirm": "Tabbatar",
    "common.actions": "Ayyuka",
    // Profile
    "profile.title": "Saitunan Bayanai",
    "profile.subtitle": "Sarrafa bayanan asusunka",
    "profile.personal": "Bayanan Kai",
    "profile.name": "Cikakken Suna",
    "profile.email": "Imel",
    "profile.phone": "Lambar Waya",
    "profile.password": "Canza Kalmar Sirri",
    "profile.newPassword": "Sabuwar Kalmar Sirri",
    "profile.confirmPassword": "Tabbatar da Sabuwar Kalmar Sirri",
    "profile.updatePassword": "Sabunta Kalmar Sirri",
    "profile.preferences": "Zaɓuɓɓuka",
    "profile.currency": "Kuɗi",
    "profile.language": "Harshe",
    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.todaySales": "Sayarwar Yau",
    "dashboard.totalStock": "Jimlar Kaya",
    "dashboard.lowStock": "Kayan da suka ragu",
    "dashboard.totalProfit": "Jimlar Riba",
    // Inventory
    "inventory.title": "Kayan Ajiya",
    "inventory.addProduct": "Ƙara Kaya",
    "inventory.editProduct": "Gyara Kaya",
    "inventory.productName": "Sunan Kaya",
    "inventory.category": "Nau'i",
    "inventory.costPrice": "Farashin Siye",
    "inventory.sellingPrice": "Farashin Sayarwa",
    "inventory.stock": "Adadin Yanzu",
    "inventory.threshold": "Iyakar Ƙarancin Kaya",
    // Sales
    "sales.title": "Rubuta Sayarwa",
    "sales.selectProduct": "Zaɓi Kaya",
    "sales.quantity": "Adadi",
    "sales.unitPrice": "Farashi",
    "sales.total": "Jimla",
    "sales.profit": "Riba",
    "sales.record": "Rubuta Sayarwa",
    // Feedback
    "feedback.button": "Ra'ayi",
  },
  ig: {
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.inventory": "Ngwa Ahịa",
    "nav.sales": "Dee Ahịa",
    "nav.reports": "Akụkọ",
    "nav.reconciliation": "Nhazi",
    "nav.audit": "Akwụkwọ Ọrụ",
    "nav.profile": "Profaịlụ",
    "nav.install": "Wụnye App",
    "nav.signout": "Pụọ",
    "nav.navigation": "Ịgagharị",
    // Common
    "common.save": "Chekwaa Mgbanwe",
    "common.saving": "Na-echekwa...",
    "common.loading": "Na-ebugo...",
    "common.search": "Chọọ",
    "common.filter": "Họrọ",
    "common.add": "Tinye",
    "common.edit": "Dezie",
    "common.delete": "Hichapụ",
    "common.cancel": "Kagbuo",
    "common.confirm": "Kwado",
    "common.actions": "Ọrụ",
    // Profile
    "profile.title": "Ntọala Profaịlụ",
    "profile.subtitle": "Jikwaa ozi akaụntụ gị",
    "profile.personal": "Ozi Onwe",
    "profile.name": "Aha Zuru Oke",
    "profile.email": "Email",
    "profile.phone": "Nọmba Ekwentị",
    "profile.password": "Gbanwee Okwuntughe",
    "profile.newPassword": "Okwuntughe Ọhụrụ",
    "profile.confirmPassword": "Kwado Okwuntughe Ọhụrụ",
    "profile.updatePassword": "Melite Okwuntughe",
    "profile.preferences": "Nhọrọ",
    "profile.currency": "Ego",
    "profile.language": "Asụsụ",
    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.todaySales": "Ahịa Taa",
    "dashboard.totalStock": "Ngwa Niile",
    "dashboard.lowStock": "Ngwa na-efu efu",
    "dashboard.totalProfit": "Uru Niile",
    // Inventory
    "inventory.title": "Ngwa Ahịa",
    "inventory.addProduct": "Tinye Ngwa",
    "inventory.editProduct": "Dezie Ngwa",
    "inventory.productName": "Aha Ngwa",
    "inventory.category": "Udi",
    "inventory.costPrice": "Ọnụ Ego Zụrụ",
    "inventory.sellingPrice": "Ọnụ Ahịa",
    "inventory.stock": "Ngwa Dị",
    "inventory.threshold": "Oke Ngwa Dị Ala",
    // Sales
    "sales.title": "Dee Ahịa",
    "sales.selectProduct": "Họrọ Ngwa",
    "sales.quantity": "Ọnụ Ọgụgụ",
    "sales.unitPrice": "Ọnụ Ahịa",
    "sales.total": "Nchịkọta",
    "sales.profit": "Uru",
    "sales.record": "Dee Ahịa",
    // Feedback
    "feedback.button": "Nzaghachi",
  },
  yo: {
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.inventory": "Àkópọ̀ Ọjà",
    "nav.sales": "Kọ Títà",
    "nav.reports": "Ìròyìn",
    "nav.reconciliation": "Ìṣàtúnṣe",
    "nav.audit": "Àkọsílẹ̀ Iṣẹ́",
    "nav.profile": "Profaili",
    "nav.install": "Fi App sí",
    "nav.signout": "Jáde",
    "nav.navigation": "Ìrìnàjò",
    // Common
    "common.save": "Fipamọ́ Àyípadà",
    "common.saving": "Ń fipamọ́...",
    "common.loading": "Ń gbé...",
    "common.search": "Wá",
    "common.filter": "Yàn",
    "common.add": "Fi kún",
    "common.edit": "Ṣàtúnṣe",
    "common.delete": "Pa rẹ́",
    "common.cancel": "Fagilee",
    "common.confirm": "Jẹ́rìí",
    "common.actions": "Ìṣe",
    // Profile
    "profile.title": "Ètò Profaili",
    "profile.subtitle": "Ṣàkóso àlàyé àkọọ́lẹ̀ rẹ",
    "profile.personal": "Àlàyé Ti ara ẹni",
    "profile.name": "Orúkọ Kíkún",
    "profile.email": "Ímeèlì",
    "profile.phone": "Nọ́mbà Fóònù",
    "profile.password": "Yí Ọ̀rọ̀ Aṣínà Padà",
    "profile.newPassword": "Ọ̀rọ̀ Aṣínà Tuntun",
    "profile.confirmPassword": "Jẹ́rìí Ọ̀rọ̀ Aṣínà Tuntun",
    "profile.updatePassword": "Ṣe àtúnṣe Ọ̀rọ̀ Aṣínà",
    "profile.preferences": "Àṣàyàn",
    "profile.currency": "Owó",
    "profile.language": "Èdè",
    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.todaySales": "Títà Òní",
    "dashboard.totalStock": "Àpapọ̀ Ọjà",
    "dashboard.lowStock": "Ọjà tí ó kéré",
    "dashboard.totalProfit": "Àpapọ̀ Èrè",
    // Inventory
    "inventory.title": "Àkópọ̀ Ọjà",
    "inventory.addProduct": "Fi Ọjà Kún",
    "inventory.editProduct": "Ṣàtúnṣe Ọjà",
    "inventory.productName": "Orúkọ Ọjà",
    "inventory.category": "Irú",
    "inventory.costPrice": "Iye Owó Rírà",
    "inventory.sellingPrice": "Iye Owó Títà",
    "inventory.stock": "Ọjà Tó Wà",
    "inventory.threshold": "Ìwọ̀n Ọjà Kékeré",
    // Sales
    "sales.title": "Kọ Títà",
    "sales.selectProduct": "Yan Ọjà",
    "sales.quantity": "Iye",
    "sales.unitPrice": "Owó",
    "sales.total": "Àpapọ̀",
    "sales.profit": "Èrè",
    "sales.record": "Kọ Títà",
    // Feedback
    "feedback.button": "Èsì",
  },
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currency, setCurrencyState] = useState<Currency>("NGN");
  const [language, setLanguageState] = useState<Language>("en");

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedCurrency = localStorage.getItem("stocksight_currency") as Currency;
    const savedLanguage = localStorage.getItem("stocksight_language") as Language;
    
    if (savedCurrency && currencies.some(c => c.code === savedCurrency)) {
      setCurrencyState(savedCurrency);
    }
    if (savedLanguage && languages.some(l => l.code === savedLanguage)) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem("stocksight_currency", newCurrency);
  };

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem("stocksight_language", newLanguage);
  };

  const getCurrencyInfo = (): CurrencyInfo => {
    return currencies.find(c => c.code === currency) || currencies[0];
  };

  const formatCurrency = (amount: number): string => {
    const info = getCurrencyInfo();
    return `${info.symbol}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return (
    <SettingsContext.Provider
      value={{
        currency,
        setCurrency,
        language,
        setLanguage,
        formatCurrency,
        t,
        getCurrencyInfo,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}

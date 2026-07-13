import { createContext } from "react";

const DEFAULT_NOTIF_PREFS = {
  email: "",
  low_stock_email: true,
  daily_summary_email: true,
  weekly_report_email: false,
  callbacks_inapp: true,
  stock_alerts_inapp: true,
};

export const SettingsContext = createContext({
  storeName: "",
  storePhone: "",
  storeAddress: "",
  currencySymbol: "KSh",
  lowStockThreshold: 6,
  defaultPayment: "Cash",
  receiptFooter: "",
  theme: "light",
  websiteUrl: "",
  whatsapp: "",
  businessHours: null,
  businessCategory: "general",
  subscriptionExpiresAt: null,
  scheduledDeletionAt: null,
  notificationPreferences: DEFAULT_NOTIF_PREFS,
  loading: true,
  refreshSettings: async () => {},
});

export { DEFAULT_NOTIF_PREFS };

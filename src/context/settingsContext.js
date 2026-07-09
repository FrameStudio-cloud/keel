import { createContext } from "react";

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
  loading: true,
});

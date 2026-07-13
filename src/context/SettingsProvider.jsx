import { useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { getShopId } from "../lib/shop";
import { setCurrency } from "../lib/format";
import { setPaymentConfig } from "../lib/paymentConfig";
import { SettingsContext, DEFAULT_NOTIF_PREFS } from "./settingsContext";
import { AuthContext } from "./AuthContext";

export default function SettingsProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [settings, setSettings] = useState({
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
    email: "",
    description: "",
    instagram: "",
    facebook: "",
    tiktok: "",
    logoUrl: null,
    businessHours: null,
    businessCategory: "general",
    categoryChangedAt: null,
    subscriptionExpiresAt: null,
    scheduledDeletionAt: null,
    notificationPreferences: DEFAULT_NOTIF_PREFS,
    loading: true,
  });

  const fetchSettings = async () => {
    try {
      const shopId = await getShopId();
      if (!shopId) {
        setSettings((prev) => ({ ...prev, loading: false }));
        return;
      }

      const { data: shop } = await supabase
        .from("shops")
        .select("business_category, subscription_expires_at, scheduled_deletion_at, category_changed_at")
        .eq("id", shopId)
        .maybeSingle();

      const { data: store } = await supabase
        .from("store_settings")
        .select("*")
        .eq("shop_id", shopId)
        .maybeSingle();

      if (store) {
        setCurrency(store.currency_symbol || "KSh");
        const paymentMethods = store.payment_methods || ["Cash", "M-Pesa", "Bank"];
        setPaymentConfig(paymentMethods, store.default_payment);

        const theme = store.theme || "light";
        document.documentElement.classList.toggle("dark", theme === "dark");

        setSettings({
          storeName: store.store_name || "",
          storePhone: store.store_phone || "",
          storeAddress: store.store_address || "",
          currencySymbol: store.currency_symbol || "KSh",
          lowStockThreshold: store.low_stock_threshold ?? 6,
          defaultPayment: store.default_payment || "Cash",
          receiptFooter: store.receipt_footer || "",
          theme,
          websiteUrl: store.website_url || "",
          whatsapp: store.whatsapp || "",
          email: store.email || "",
          description: store.description || "",
          instagram: store.instagram || "",
          facebook: store.facebook || "",
          tiktok: store.tiktok || "",
          logoUrl: store.logo_url || null,
          businessHours: store.business_hours || null,
          notificationPreferences: { ...DEFAULT_NOTIF_PREFS, ...(store.notification_preferences || {}) },
          businessCategory: shop?.business_category || "general",
          categoryChangedAt: shop?.category_changed_at || null,
          subscriptionExpiresAt: shop?.subscription_expires_at || null,
          scheduledDeletionAt: shop?.scheduled_deletion_at || null,
          loading: false,
        });
      } else {
        setSettings((prev) => ({
          ...prev,
          businessCategory: shop?.business_category || "general",
          categoryChangedAt: shop?.category_changed_at || null,
          subscriptionExpiresAt: shop?.subscription_expires_at || null,
          scheduledDeletionAt: shop?.scheduled_deletion_at || null,
          loading: false,
        }));
      }
    } catch (err) {
      console.error("SettingsProvider error:", err);
      setSettings((prev) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [user]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", settings.theme === "dark");
  }, [settings.theme]);

  const refreshSettings = async () => {
    setSettings((prev) => ({ ...prev, loading: true }));
    await fetchSettings();
  };

  return (
    <SettingsContext.Provider value={{ ...settings, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { getShopId } from "../lib/shop";
import { setCurrency } from "../lib/format";
import { setPaymentConfig } from "../lib/paymentConfig";
import { SettingsContext } from "./settingsContext";

export default function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    storeName: "",
    storePhone: "",
    storeAddress: "",
    currencySymbol: "KSh",
    lowStockThreshold: 6,
    defaultPayment: "Cash",
    receiptFooter: "",
    theme: "dark",
    websiteUrl: "",
    whatsapp: "",
    businessHours: null,
    businessCategory: "general",
    loading: true,
  });

  useEffect(() => {
    console.log("[TRACE] SettingsProvider effect running");
    (async () => {
      try {
        console.log("[TRACE] SettingsProvider getting shopId");
        const shopId = await getShopId();
        console.log("[TRACE] SettingsProvider got shopId:", shopId);
        if (!shopId) {
          setSettings((prev) => ({ ...prev, loading: false }));
          return;
        }

        const { data: shop } = await supabase
          .from("shops")
          .select("business_category")
          .eq("id", shopId)
          .maybeSingle();

        const { data: store } = await supabase
          .from("store_settings")
          .select("*")
          .eq("shop_id", shopId)
          .maybeSingle();

        if (store) {
          setCurrency(store.currency_symbol || "KSh");
          setPaymentConfig(
            store.default_payment ? ["Cash", "M-Pesa", "Bank"] : null,
            store.default_payment
          );

          const theme = store.theme || "dark";
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
            businessHours: store.business_hours || null,
            businessCategory: shop?.business_category || "general",
            loading: false,
          });
        } else {
          setSettings((prev) => ({
            ...prev,
            businessCategory: shop?.business_category || "general",
            loading: false,
          }));
        }
      } catch (err) {
        console.error("SettingsProvider error:", err);
        setSettings((prev) => ({ ...prev, loading: false }));
      }
    })();
  }, []);

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}

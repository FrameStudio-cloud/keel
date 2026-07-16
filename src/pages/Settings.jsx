import { useState, useEffect, useContext, useMemo, useRef } from "react";
import { Helmet } from "react-helmet-async";
import PageLayout from "../components/layout/PageLayout";
import Skeleton from "../components/Skeleton";
import { supabase, getPersistedSession } from "../lib/supabase";
import { getShopId } from "../lib/shop";
import { setCurrency } from "../lib/format";
import { setPaymentConfig } from "../lib/paymentConfig";
import { useSettings } from "../hooks/useSettings";
import { AuthContext } from "../context/AuthContext";
import {
  FiShoppingBag, FiSettings, FiBell, FiCreditCard,
  FiLock, FiDownload, FiAlertTriangle
} from "react-icons/fi";
import TabButton from "../components/settings/TabButton";
import SettingsSaveBar from "../components/settings/SettingsSaveBar";
import DeleteShopModal from "../components/settings/DeleteShopModal";
import DeleteDataModal from "../components/settings/DeleteDataModal";
import StoreTab from "../components/settings/StoreTab";
import PreferencesTab from "../components/settings/PreferencesTab";
import NotificationsTab from "../components/settings/NotificationsTab";
import BillingTab from "../components/settings/BillingTab";
import SecurityTab from "../components/settings/SecurityTab";
import DataTab from "../components/settings/DataTab";
import DangerZoneTab from "../components/settings/DangerZoneTab";

const TABS = [
  { id: "store", label: "Store", subtitle: "Business details, category & hours", icon: FiShoppingBag },
  { id: "preferences", label: "Preferences", subtitle: "Theme, currency & defaults", icon: FiSettings },
  { id: "notifications", label: "Notifications", subtitle: "Alerts & reminders", icon: FiBell },
  { id: "billing", label: "Billing", subtitle: "Subscription & plan", icon: FiCreditCard },
  { id: "security", label: "Security", subtitle: "Password & account", icon: FiLock },
  { id: "data", label: "Data", subtitle: "Export & backups", icon: FiDownload },
  { id: "danger", label: "Danger Zone", subtitle: "Irreversible actions", icon: FiAlertTriangle },
];

const DAYS = [
  { key: "mon", label: "Mon" }, { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" }, { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" }, { key: "sat", label: "Sat" }, { key: "sun", label: "Sun" },
];

function validateForm(form) {
  const errors = {};
  if (!form.store_name?.trim()) errors.store_name = "Store name is required";
  if (form.website_url && !/^https?:\/\/.+/.test(form.website_url)) errors.website_url = "Enter a valid URL starting with http:// or https://";
  if (form.store_phone && !/^[\d\s+\-()]{7,20}$/.test(form.store_phone)) errors.store_phone = "Enter a valid phone number";
  return errors;
}

const defaultHours = () =>
  DAYS.map((d) => ({ key: d.key, label: d.label, active: true, open: "08:00", close: "17:00" }));

function hoursFromSettings(businessHours) {
  if (!businessHours) return defaultHours();
  return DAYS.map((d) => {
    const h = businessHours[d.key];
    return { key: d.key, label: d.label, active: h?.active !== false, open: h?.open || "08:00", close: h?.close || "17:00" };
  });
}

export default function Settings() {
  const settings = useSettings();
  const { logout, user } = useContext(AuthContext);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState("store");
  const [validationErrors, setValidationErrors] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteDataModal, setShowDeleteDataModal] = useState(false);
  const [pristineSnapshot, setPristineSnapshot] = useState(null);

  const [form, setForm] = useState({
    store_name: settings.storeName, store_phone: settings.storePhone,
    store_address: settings.storeAddress, currency_symbol: settings.currencySymbol,
    low_stock_threshold: settings.lowStockThreshold, default_payment: settings.defaultPayment,
    receipt_footer: settings.receiptFooter, theme: settings.theme || "light",
    website_url: settings.websiteUrl, whatsapp: settings.whatsapp,
    business_category: settings.businessCategory,
    notification_preferences: settings.notificationPreferences,
    primary_color: settings.primaryColor || "#000000",
    secondary_color: settings.secondaryColor || "#4f46e5",
    accent_color: settings.accentColor || "#f59e0b",
    name_accent: settings.nameAccent || "",
    instagram: settings.instagram || "",
    facebook: settings.facebook || "",
    tiktok: settings.tiktok || "",
  });
  const [hours, setHours] = useState(() => hoursFromSettings(settings.businessHours));
  const saveHandlerRef = useRef(null);

  const sessionEmail = useMemo(() => {
    const s = getPersistedSession();
    return s?.user?.email || s?.email || "";
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (settings.loading) return;
    const safe = (v) => v ?? "";
    const newForm = {
      store_name: safe(settings.storeName), store_phone: safe(settings.storePhone),
      store_address: safe(settings.storeAddress), currency_symbol: safe(settings.currencySymbol),
      low_stock_threshold: settings.lowStockThreshold ?? 6,
      default_payment: safe(settings.defaultPayment), receipt_footer: safe(settings.receiptFooter),
      theme: settings.theme || "light", website_url: safe(settings.websiteUrl),
      whatsapp: safe(settings.whatsapp), business_category: settings.businessCategory || "general",
      notification_preferences: settings.notificationPreferences,
      primary_color: settings.primaryColor || "#000000",
      secondary_color: settings.secondaryColor || "#4f46e5",
      accent_color: settings.accentColor || "#f59e0b",
      name_accent: settings.nameAccent || "",
      instagram: settings.instagram || "",
      facebook: settings.facebook || "",
      tiktok: settings.tiktok || "",
    };
    const newHours = hoursFromSettings(settings.businessHours);
    setForm(newForm);
    setHours(newHours);
    const bh = {};
    newHours.forEach((h) => { bh[h.key] = { open: h.open, close: h.close, active: h.active }; });
    setPristineSnapshot(JSON.stringify({ ...newForm, business_hours: bh }));
    setValidationErrors({});
  }, [settings]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const currentSnapshot = useMemo(() => {
    const bh = {};
    hours.forEach((h) => { bh[h.key] = { open: h.open, close: h.close, active: h.active }; });
    return JSON.stringify({ ...form, business_hours: bh });
  }, [form, hours]);

  const isDirty = pristineSnapshot !== null && currentSnapshot !== pristineSnapshot;

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function handleThemeChange(theme) {
    setForm((prev) => ({ ...prev, theme }));
    document.documentElement.classList.toggle("dark", theme === "dark");
  }

  function updateHour(key, field, value) {
    setHours((prev) => prev.map((h) => (h.key === key ? { ...h, [field]: value } : h)));
  }

  function handleDiscard() {
    const safe = (v) => v ?? "";
    setForm({
      store_name: safe(settings.storeName), store_phone: safe(settings.storePhone),
      store_address: safe(settings.storeAddress), currency_symbol: safe(settings.currencySymbol),
      low_stock_threshold: settings.lowStockThreshold ?? 6,
      default_payment: safe(settings.defaultPayment), receipt_footer: safe(settings.receiptFooter),
      theme: settings.theme || "light", website_url: safe(settings.websiteUrl),
      whatsapp: safe(settings.whatsapp), business_category: settings.businessCategory || "general",
      notification_preferences: settings.notificationPreferences,
      primary_color: settings.primaryColor || "#000000",
      secondary_color: settings.secondaryColor || "#4f46e5",
      accent_color: settings.accentColor || "#f59e0b",
      name_accent: settings.nameAccent || "",
      instagram: settings.instagram || "",
      facebook: settings.facebook || "",
      tiktok: settings.tiktok || "",
    });
    setHours(hoursFromSettings(settings.businessHours));
    setValidationErrors({});
    document.documentElement.classList.toggle("dark", settings.theme === "dark");
  }

  async function handleSave() {
    setSaving(true);
    setValidationErrors({});

    const errors = validateForm(form);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      if (errors.store_name || errors.website_url || errors.store_phone) setActiveTab("store");
      setSaving(false);
      return;
    }

    const shopId = await getShopId();
    if (!shopId) {
      setSaving(false);
      showToast("Shop not found. Try signing out and back in.", "error");
      return;
    }

    const businessHours = {};
    hours.forEach((h) => { businessHours[h.key] = { open: h.open, close: h.close, active: h.active }; });

    const payload = {
      store_name: form.store_name, store_phone: form.store_phone, store_address: form.store_address,
      currency_symbol: form.currency_symbol, low_stock_threshold: form.low_stock_threshold,
      default_payment: form.default_payment, receipt_footer: form.receipt_footer, theme: form.theme,
      website_url: form.website_url, whatsapp: form.whatsapp, business_hours: businessHours, shop_id: shopId,
      notification_preferences: form.notification_preferences,
      primary_color: form.primary_color,
      secondary_color: form.secondary_color,
      accent_color: form.accent_color,
      name_accent: form.name_accent,
      instagram: form.instagram,
      facebook: form.facebook,
      tiktok: form.tiktok,
    };

    const categoryChanged = form.business_category !== settings.businessCategory;
    const shopUpdate = categoryChanged
      ? { business_category: form.business_category, category_changed_at: new Date().toISOString() }
      : { business_category: form.business_category };

    const [storeResult, shopResult] = await Promise.all([
      supabase.from("store_settings").upsert(payload, { onConflict: "shop_id" }).select().single(),
      supabase.from("shops").update(shopUpdate).eq("id", shopId),
    ]);

    setSaving(false);

    if (storeResult.error) {
      console.error("Settings save error:", storeResult.error);
      showToast(storeResult.error.message || "Something went wrong", "error");
      return;
    }
    if (shopResult.error) {
      console.error("Category update error:", shopResult.error);
      showToast(shopResult.error.message || "Failed to update category", "error");
      return;
    }

    setCurrency(form.currency_symbol);
    setPaymentConfig(null, form.default_payment);
    document.documentElement.classList.toggle("dark", form.theme === "dark");

    const bh = {};
    hours.forEach((h) => { bh[h.key] = { open: h.open, close: h.close, active: h.active }; });
    setPristineSnapshot(JSON.stringify({ ...form, business_hours: bh }));
    showToast("Settings saved!");

    const prefs = form.notification_preferences || {};
    const unsubscribed = prefs.updates_email === false;
    supabase.functions.invoke("subscribe-contact", {
      body: { email: user?.email, store_name: form.store_name, shop_id: shopId, unsubscribed },
    }).catch(() => {});
  }

  useEffect(() => { saveHandlerRef.current = handleSave; });

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        saveHandlerRef.current?.();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  async function handleExport() {
    const shopId = await getShopId();
    if (!shopId) { showToast("Shop not found.", "error"); return; }
    const tables = ["products", "sales", "stock_movements", "catalogue", "expenses", "page_views"];
    const allData = {};
    const results = await Promise.allSettled(
      tables.map((table) => supabase.from(table).select("*").eq("shop_id", shopId))
    );
    tables.forEach((table, i) => {
      allData[table] = results[i].status === "fulfilled" ? results[i].value.data || [] : [];
    });
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `keel-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Export downloaded!");
  }

  async function handleRequestDeletion() {
    const shopId = await getShopId();
    if (!shopId) { showToast("Shop not found.", "error"); return; }
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + 30);
    const { error } = await supabase
      .from("shops")
      .update({ scheduled_deletion_at: deletionDate.toISOString() })
      .eq("id", shopId);
    if (error) { showToast(error.message || "Failed to schedule deletion", "error"); return; }
    setShowDeleteModal(false);
    logout();
  }

  async function handleCancelDeletion() {
    const shopId = await getShopId();
    if (!shopId) { showToast("Shop not found.", "error"); return; }
    const { error } = await supabase.from("shops").update({ scheduled_deletion_at: null }).eq("id", shopId);
    if (error) { showToast(error.message || "Failed to cancel deletion", "error"); return; }
    showToast("Deletion cancelled. Your shop is safe.");
  }

  async function handleDeleteAllData() {
    const shopId = await getShopId();
    if (!shopId) { showToast("Shop not found.", "error"); return; }
    setShowDeleteDataModal(false);

    await supabase.from("product_attribute_values").delete().eq("shop_id", shopId);
    await supabase.from("catalogue_attribute_values").delete().eq("shop_id", shopId);
    await supabase.from("catalogue").delete().eq("shop_id", shopId);
    await supabase.from("products").delete().eq("shop_id", shopId);

    await Promise.allSettled([
      supabase.from("stock_movements").delete().eq("shop_id", shopId),
      supabase.from("sales").delete().eq("shop_id", shopId),
      supabase.from("expenses").delete().eq("shop_id", shopId),
      supabase.from("payments").delete().eq("shop_id", shopId),
      supabase.from("posts").delete().eq("shop_id", shopId),
      supabase.from("banners").delete().eq("shop_id", shopId),
      supabase.from("page_views").delete().eq("shop_id", shopId),
      supabase.from("chat_faqs").delete().eq("shop_id", shopId),
      supabase.from("chat_messages").delete().eq("shop_id", shopId),
      supabase.from("chat_callbacks").delete().eq("shop_id", shopId),
      supabase.from("chat_stock_alerts").delete().eq("shop_id", shopId),
      supabase.from("announcement_dismissals").delete().eq("shop_id", shopId),
      supabase.from("storefront_deployments").delete().eq("shop_id", shopId),
    ]);

    settings.refreshSettings();
    showToast("All business data has been deleted.");
  }

  const [now] = useState(() => Date.now());
  const categoryLocked = useMemo(() => {
    if (!settings.categoryChangedAt) return false;
    return Math.floor((now - new Date(settings.categoryChangedAt).getTime()) / 86400000) < 30;
  }, [settings.categoryChangedAt, now]);
  const categoryRemainingDays = useMemo(() => {
    if (!settings.categoryChangedAt) return 0;
    return Math.max(0, 30 - Math.floor((now - new Date(settings.categoryChangedAt).getTime()) / 86400000));
  }, [settings.categoryChangedAt, now]);

  const showSaveBar = activeTab === "store" || activeTab === "preferences" || activeTab === "notifications";

  if (settings.loading) {
    return (
      <PageLayout title="Settings">
        <div className="flex gap-6">
          <div className="hidden lg:flex flex-col w-[220px] space-y-2">
            {[...Array(7)].map((_, i) => <Skeleton key={i} className="h-11 rounded-xl" />)}
          </div>
          <div className="flex-1 space-y-6">
            <Skeleton className="h-32 rounded-xl" /><Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" /><Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-52 rounded-xl" /><Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-11 rounded-lg" />
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Settings">
      <Helmet><title>Settings — Keel</title></Helmet>
      <style>{`@keyframes fadeSlideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-semibold shadow-xl ${
          toast.type === "error" ? "bg-red-500 text-white" : "bg-blue-600 text-white"
        }`}>
          {toast.msg}
        </div>
      )}

      <div className="lg:hidden overflow-x-auto pb-3 -mx-4 px-4 mb-4">
        <div className="flex gap-1.5 min-w-max">
          {TABS.map((t) => <TabButton key={t.id} tab={t} isActive={activeTab === t.id} onSelect={setActiveTab} isMobile />)}
        </div>
      </div>

      <div className="flex gap-8 items-start">
        <aside className="hidden lg:flex flex-col w-[220px] shrink-0 sticky top-6 max-h-[calc(100vh-10rem)] overflow-y-auto">
          <nav className="space-y-0.5">
            {TABS.map((t) => <TabButton key={t.id} tab={t} isActive={activeTab === t.id} onSelect={setActiveTab} />)}
          </nav>
        </aside>

        <div className="flex-1 min-w-0">
          <div key={activeTab} className="space-y-6 animate-[fadeSlideIn_0.2s_ease-out]">
            {activeTab === "store" && (
              <StoreTab form={form} setForm={setForm} hours={hours} updateHour={updateHour}
                validationErrors={validationErrors} categoryLocked={categoryLocked}
                categoryRemainingDays={categoryRemainingDays} />
            )}
            {activeTab === "preferences" && (
              <PreferencesTab form={form} setForm={setForm} handleThemeChange={handleThemeChange} />
            )}
            {activeTab === "notifications" && (
              <NotificationsTab form={form} setForm={setForm} whatsapp={settings.whatsapp} />
            )}
            {activeTab === "billing" && (
              <BillingTab subscriptionExpiresAt={settings.subscriptionExpiresAt}
                refreshSettings={settings.refreshSettings} />
            )}
            {activeTab === "security" && <SecurityTab sessionEmail={sessionEmail} showToast={showToast} />}
            {activeTab === "data" && <DataTab onExport={handleExport} />}
            {activeTab === "danger" && (
              <DangerZoneTab scheduledDeletionAt={settings.scheduledDeletionAt}
                onDeleteClick={() => setShowDeleteModal(true)} onCancelDeletion={handleCancelDeletion}
                onDeleteDataClick={() => setShowDeleteDataModal(true)} />
            )}
          </div>

          {showSaveBar && (
            <SettingsSaveBar isDirty={isDirty} saving={saving} onSave={handleSave} onDiscard={handleDiscard} />
          )}
        </div>
      </div>

      {showDeleteModal && <DeleteShopModal onClose={() => setShowDeleteModal(false)} onConfirm={handleRequestDeletion} />}
      {showDeleteDataModal && <DeleteDataModal onClose={() => setShowDeleteDataModal(false)} onConfirm={handleDeleteAllData} />}
    </PageLayout>
  );
}

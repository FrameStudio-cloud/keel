import { useState, useEffect } from "react";
import PageLayout from "../components/layout/PageLayout";
import Skeleton from "../components/Skeleton";
import { supabase } from "../lib/supabase";
import { getShopId } from "../lib/shop";
import { setCurrency } from "../lib/format";
import { setPaymentConfig } from "../lib/paymentConfig";
import { FiSave, FiDownload, FiShoppingBag, FiDollarSign, FiMonitor, FiFileText, FiSun, FiMoon, FiCheck, FiClock } from "react-icons/fi";

const CATEGORIES = ["general", "clothing", "electronics", "electricals"];
const DAYS = [
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
];

const defaultHours = () =>
  DAYS.map((d) => ({ key: d.key, label: d.label, active: true, open: "08:00", close: "17:00" }));

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [settingsId, setSettingsId] = useState(null);
  const [form, setForm] = useState({
    store_name: "",
    store_phone: "",
    store_address: "",
    currency_symbol: "KSh",
    low_stock_threshold: 6,
    default_payment: "Cash",
    receipt_footer: "",
    theme: "dark",
    website_url: "",
    whatsapp: "",
    business_category: "general",
    terms_of_service: "",
  });
  const [hours, setHours] = useState(defaultHours());

  useEffect(() => {
    (async () => {
      const shopId = await getShopId();
      if (!shopId) { setLoading(false); return; }

      const [{ data: shop }, { data: store }] = await Promise.all([
        supabase.from("shops").select("business_category").eq("id", shopId).single(),
        supabase.from("store_settings").select("*").eq("shop_id", shopId).maybeSingle(),
      ]);

      if (store) {
        setSettingsId(store.id);
        setForm({
          store_name: store.store_name || "",
          store_phone: store.store_phone || "",
          store_address: store.store_address || "",
          currency_symbol: store.currency_symbol || "KSh",
          low_stock_threshold: store.low_stock_threshold ?? 6,
          default_payment: store.default_payment || "Cash",
          receipt_footer: store.receipt_footer || "",
          theme: store.theme || "dark",
          website_url: store.website_url || "",
          whatsapp: store.whatsapp || "",
          business_category: shop?.business_category || "general",
          terms_of_service: store.terms_of_service || "",
        });
        if (store.business_hours) {
          setHours(
            DAYS.map((d) => {
              const h = store.business_hours[d.key];
              return {
                key: d.key,
                label: d.label,
                active: h?.active !== false,
                open: h?.open || "08:00",
                close: h?.close || "17:00",
              };
            })
          );
        }
      } else if (shop) {
        setForm((prev) => ({ ...prev, business_category: shop.business_category || "general" }));
      }
      setLoading(false);
    })();
  }, []);

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

  async function handleSave() {
    setSaving(true);

    const shopId = await getShopId();
    if (!shopId) {
      setSaving(false);
      showToast("Shop not found. Try signing out and back in.", "error");
      return;
    }

    const businessHours = {};
    hours.forEach((h) => {
      businessHours[h.key] = { open: h.open, close: h.close, active: h.active };
    });

    const payload = {
      store_name: form.store_name,
      store_phone: form.store_phone,
      store_address: form.store_address,
      currency_symbol: form.currency_symbol,
      low_stock_threshold: form.low_stock_threshold,
      default_payment: form.default_payment,
      receipt_footer: form.receipt_footer,
      theme: form.theme,
      website_url: form.website_url,
      whatsapp: form.whatsapp,
      business_hours: businessHours,
      terms_of_service: form.terms_of_service,
      shop_id: shopId,
    };
    if (settingsId) payload.id = settingsId;

    const [storeResult, shopResult] = await Promise.all([
      supabase.from("store_settings").upsert(payload).select().single(),
      supabase.from("shops").update({ business_category: form.business_category }).eq("id", shopId),
    ]);

    setSaving(false);

    const { data, error } = storeResult;
    if (error) {
      console.error("Settings save error:", error);
      showToast(error.message || "Something went wrong", "error");
      return;
    }
    if (shopResult.error) {
      console.error("Category update error:", shopResult.error);
    }

    if (data && !settingsId) setSettingsId(data.id);

    setCurrency(form.currency_symbol);
    setPaymentConfig(null, form.default_payment);
    document.documentElement.classList.toggle("dark", form.theme === "dark");

    showToast("Settings saved!");
  }

  async function handleExport() {
    const shopId = await getShopId();
    if (!shopId) { showToast("Shop not found.", "error"); return; }
    const tables = ["products", "sales", "stock_movements", "catalogue", "expenses", "page_views"];
    const allData = {};

    for (const table of tables) {
      const { data } = await supabase
        .from(table)
        .select("*")
        .eq("shop_id", shopId);
      allData[table] = data || [];
    }

    const blob = new Blob([JSON.stringify(allData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `keel-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Export downloaded!");
  }

  if (loading) {
    return (
      <PageLayout title="Settings">
        <div className="max-w-2xl mx-auto py-6 space-y-6">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-52 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-11 rounded-lg" />
          <Skeleton className="h-16 rounded-xl" />
        </div>
      </PageLayout>
    );
  }

  const inputClass = "w-full bg-white dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 transition-colors";

  const catClass = (cat) =>
    `flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${
      form.business_category === cat
        ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/25"
        : "bg-white dark:bg-[#1a1a2e] text-gray-500 dark:text-slate-400 border-gray-200 dark:border-white/10 hover:text-gray-800 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/20"
    }`;

  return (
    <PageLayout title="Settings">
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-semibold shadow-xl ${
            toast.type === "error"
              ? "bg-red-500 text-white"
              : "bg-blue-600 text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="max-w-2xl mx-auto py-6 space-y-6">

        <div className="bg-white dark:bg-[#16213e] rounded-xl border border-gray-100 dark:border-white/10 p-5">
          <div className="flex items-center gap-2 mb-4">
            <FiShoppingBag size={14} className="text-gray-400" />
            <h3 className="text-sm font-medium text-gray-800 dark:text-white">Store Details</h3>
          </div>
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-xs text-gray-400 dark:text-slate-500 mb-1">Store Name</label>
              <input type="text" value={form.store_name} onChange={(e) => setForm({ ...form, store_name: e.target.value })} className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 dark:text-slate-500 mb-1">Phone</label>
                <input type="text" value={form.store_phone} onChange={(e) => setForm({ ...form, store_phone: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-gray-400 dark:text-slate-500 mb-1">WhatsApp</label>
                <input type="text" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className={inputClass} />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 dark:text-slate-500 mb-1">Address</label>
              <input type="text" value={form.store_address} onChange={(e) => setForm({ ...form, store_address: e.target.value })} className={inputClass} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#16213e] rounded-xl border border-gray-100 dark:border-white/10 p-5">
          <div className="flex items-center gap-2 mb-4">
            <FiShoppingBag size={14} className="text-gray-400" />
            <h3 className="text-sm font-medium text-gray-800 dark:text-white">Business Category</h3>
          </div>
          <p className="text-xs text-gray-400 dark:text-slate-500 mb-3">Controls variant fields shown in Inventory (color, size, storage)</p>
          <div className="flex gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setForm({ ...form, business_category: cat })}
                className={catClass(cat)}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-[#16213e] rounded-xl border border-gray-100 dark:border-white/10 p-5">
          <div className="flex items-center gap-2 mb-4">
            <FiDollarSign size={14} className="text-gray-400" />
            <h3 className="text-sm font-medium text-gray-800 dark:text-white">Sales & Currency</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 dark:text-slate-500 mb-1">Currency Symbol</label>
              <input type="text" value={form.currency_symbol} onChange={(e) => setForm({ ...form, currency_symbol: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-gray-400 dark:text-slate-500 mb-1">Default Payment</label>
              <select value={form.default_payment} onChange={(e) => setForm({ ...form, default_payment: e.target.value })} className={inputClass}>
                <option>Cash</option>
                <option>M-Pesa</option>
                <option>Bank</option>

              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 dark:text-slate-500 mb-1">Low Stock Threshold</label>
              <input type="number" value={form.low_stock_threshold} onChange={(e) => setForm({ ...form, low_stock_threshold: parseInt(e.target.value) || 0 })} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-gray-400 dark:text-slate-500 mb-1">Website URL</label>
              <input type="text" value={form.website_url} onChange={(e) => setForm({ ...form, website_url: e.target.value })} className={inputClass} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#16213e] rounded-xl border border-gray-100 dark:border-white/10 p-5">
          <div className="flex items-center gap-2 mb-4">
            <FiMonitor size={14} className="text-gray-400" />
            <h3 className="text-sm font-medium text-gray-800 dark:text-white">Appearance</h3>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleThemeChange("dark")}
              className={`flex-1 py-3 rounded-lg text-sm font-semibold border transition-all flex items-center justify-center gap-2 ${
                form.theme === "dark"
                  ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/25"
                  : "bg-white dark:bg-[#1a1a2e] text-gray-500 dark:text-slate-400 border-gray-200 dark:border-white/10 hover:text-gray-800 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/20"
              }`}
            >
              <FiMoon size={14} />
              Dark
            </button>
            <button
              onClick={() => handleThemeChange("light")}
              className={`flex-1 py-3 rounded-lg text-sm font-semibold border transition-all flex items-center justify-center gap-2 ${
                form.theme === "light"
                  ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/25"
                  : "bg-white dark:bg-[#1a1a2e] text-gray-500 dark:text-slate-400 border-gray-200 dark:border-white/10 hover:text-gray-800 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/20"
              }`}
            >
              <FiSun size={14} />
              Light
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-[#16213e] rounded-xl border border-gray-100 dark:border-white/10 p-5">
          <div className="flex items-center gap-2 mb-4">
            <FiClock size={14} className="text-gray-400" />
            <h3 className="text-sm font-medium text-gray-800 dark:text-white">Business Hours</h3>
          </div>
          <div className="bg-slate-50 dark:bg-[#1a1a2e] rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden">
            {hours.map((h, i) => (
              <div
                key={h.key}
                className={`flex items-center gap-3 px-4 py-2.5 ${
                  i < hours.length - 1 ? "border-b border-slate-200 dark:border-white/10" : ""
                }`}
              >
                <button
                  onClick={() => updateHour(h.key, "active", !h.active)}
                  className={`w-5 h-5 rounded-md flex items-center justify-center transition-all flex-shrink-0 ${
                    h.active
                      ? "bg-blue-600 text-white"
                      : "bg-slate-200 dark:bg-white/10 text-transparent"
                  }`}
                >
                  {h.active && <FiCheck size={12} />}
                </button>
                <span className={`text-sm w-10 font-medium flex-shrink-0 ${
                  h.active ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500"
                }`}>
                  {h.label}
                </span>
                {h.active ? (
                  <div className="flex items-center gap-2 ml-auto">
                    <input
                      type="time"
                      value={h.open}
                      onChange={(e) => updateHour(h.key, "open", e.target.value)}
                      className="bg-white dark:bg-[#16213e] border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500/50"
                    />
                    <span className="text-xs text-slate-400">—</span>
                    <input
                      type="time"
                      value={h.close}
                      onChange={(e) => updateHour(h.key, "close", e.target.value)}
                      className="bg-white dark:bg-[#16213e] border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto">Closed</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-[#16213e] rounded-xl border border-gray-100 dark:border-white/10 p-5">
          <div className="flex items-center gap-2 mb-4">
            <FiFileText size={14} className="text-gray-400" />
            <h3 className="text-sm font-medium text-gray-800 dark:text-white">Receipt Footer</h3>
          </div>
          <textarea rows={2} value={form.receipt_footer} onChange={(e) => setForm({ ...form, receipt_footer: e.target.value })} placeholder="Thank you for your business!" className={`${inputClass} resize-none`} />
        </div>

        <div className="bg-white dark:bg-[#16213e] rounded-xl border border-gray-100 dark:border-white/10 p-5">
          <div className="flex items-center gap-2 mb-4">
            <FiFileText size={14} className="text-gray-400" />
            <h3 className="text-sm font-medium text-gray-800 dark:text-white">Terms of Service</h3>
          </div>
          <p className="text-xs text-gray-400 dark:text-slate-500 mb-3">
            Use <code className="text-blue-500 bg-blue-500/10 px-1 rounded">{`{store_name}`}</code> to insert your store name. Sections with <code className="text-blue-500 bg-blue-500/10 px-1 rounded">{`## `}</code> become headings.
          </p>
          <textarea
            rows={8}
            value={form.terms_of_service}
            onChange={(e) => setForm({ ...form, terms_of_service: e.target.value })}
            placeholder={`## 1. Use of Service\n\nBy using {store_name}, you agree to these terms...`}
            className={`${inputClass} resize-none font-mono text-xs`}
          />
        </div>

        <button onClick={handleSave} disabled={saving} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25">
          <FiSave size={14} />
          {saving ? "Saving..." : "Save Settings"}
        </button>

        <div className="bg-white dark:bg-[#16213e] rounded-xl border border-gray-100 dark:border-white/10 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiDownload size={14} className="text-gray-400" />
              <div>
                <h3 className="text-sm font-medium text-gray-800 dark:text-white">Data Export</h3>
                <p className="text-gray-400 dark:text-slate-500 text-xs mt-0.5">Download all your data as JSON</p>
              </div>
            </div>
            <button onClick={handleExport} className="px-4 py-2 bg-white dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/20 rounded-lg text-sm transition-all flex items-center gap-2">
              <FiDownload size={14} />
              Export
            </button>
          </div>
        </div>

      </div>
    </PageLayout>
  );
}

import { useState, useEffect } from "react";
import PageLayout from "../components/layout/PageLayout";
import { supabase } from "../lib/supabase";
import { getShopId } from "../lib/shop";
import { setCurrency } from "../lib/format";
import { setPaymentConfig } from "../lib/paymentConfig";
import { FiSave, FiDownload } from "react-icons/fi";

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
  });

  useEffect(() => {
    (async () => {
      const shopId = await getShopId();
      const { data } = await supabase
        .from("store_settings")
        .select("*")
        .eq("shop_id", shopId)
        .maybeSingle();

      if (data) {
        setSettingsId(data.id);
        setForm({
          store_name: data.store_name || "",
          store_phone: data.store_phone || "",
          store_address: data.store_address || "",
          currency_symbol: data.currency_symbol || "KSh",
          low_stock_threshold: data.low_stock_threshold ?? 6,
          default_payment: data.default_payment || "Cash",
          receipt_footer: data.receipt_footer || "",
          theme: data.theme || "dark",
          website_url: data.website_url || "",
          whatsapp: data.whatsapp || "",
        });
      }
      setLoading(false);
    })();
  }, []);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function handleThemeChange(theme) {
    setForm({ ...form, theme });
    document.documentElement.classList.toggle("dark", theme === "dark");
  }

  async function handleSave() {
    setSaving(true);

    const shopId = await getShopId();
    const payload = { ...form, shop_id: shopId };
    if (settingsId) payload.id = settingsId;

    const { data, error } = await supabase
      .from("store_settings")
      .upsert(payload)
      .select()
      .single();

    setSaving(false);
    if (error) {
      console.error("Settings save error:", error);
      showToast("Something went wrong", "error");
      return;
    }

    if (data && !settingsId) setSettingsId(data.id);

    setCurrency(form.currency_symbol);
    setPaymentConfig(null, form.default_payment);
    document.documentElement.classList.toggle("dark", form.theme === "dark");

    showToast("Settings saved!");
  }

  async function handleExport() {
    const shopId = await getShopId();
    const tables = ["products", "sales", "stock_movements", "catalogue"];
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
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </PageLayout>
    );
  }

  const inputClass = "w-full bg-slate-100 dark:bg-[#1a1a2e] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors";

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

      <div className="max-w-lg mx-auto py-4 space-y-8">

        <section>
          <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Store Details</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Store Name</label>
              <input type="text" value={form.store_name} onChange={(e) => setForm({ ...form, store_name: e.target.value })} className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Phone</label>
                <input type="text" value={form.store_phone} onChange={(e) => setForm({ ...form, store_phone: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">WhatsApp</label>
                <input type="text" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className={inputClass} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Address</label>
              <input type="text" value={form.store_address} onChange={(e) => setForm({ ...form, store_address: e.target.value })} className={inputClass} />
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Sales & Currency</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Currency Symbol</label>
              <input type="text" value={form.currency_symbol} onChange={(e) => setForm({ ...form, currency_symbol: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Default Payment</label>
              <select value={form.default_payment} onChange={(e) => setForm({ ...form, default_payment: e.target.value })} className={inputClass}>
                <option>Cash</option>
                <option>M-Pesa</option>
                <option>Bank</option>
                <option>IntaSend</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Low Stock Threshold</label>
              <input type="number" value={form.low_stock_threshold} onChange={(e) => setForm({ ...form, low_stock_threshold: parseInt(e.target.value) || 0 })} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Website URL</label>
              <input type="text" value={form.website_url} onChange={(e) => setForm({ ...form, website_url: e.target.value })} className={inputClass} />
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Appearance</h3>
          <div className="flex gap-3">
            <button
              onClick={() => handleThemeChange("dark")}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-all ${
                form.theme === "dark"
                  ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/25"
                  : "bg-slate-100 dark:bg-[#1a1a2e] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:text-slate-900 dark:hover:text-white hover:border-white/20"
              }`}
            >
              Dark
            </button>
            <button
              onClick={() => handleThemeChange("light")}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-all ${
                form.theme === "light"
                  ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/25"
                  : "bg-slate-100 dark:bg-[#1a1a2e] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:text-slate-900 dark:hover:text-white hover:border-white/20"
              }`}
            >
              Light
            </button>
          </div>
        </section>

        <section>
          <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Receipt Footer</h3>
          <textarea rows={2} value={form.receipt_footer} onChange={(e) => setForm({ ...form, receipt_footer: e.target.value })} placeholder="Thank you for your business!" className={`${inputClass} resize-none`} />
        </section>

        <button onClick={handleSave} disabled={saving} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25">
          <FiSave size={14} />
          {saving ? "Saving..." : "Save Settings"}
        </button>

        <section className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Data Export</h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs mt-0.5">Download all your data as JSON</p>
          </div>
          <button onClick={handleExport} className="px-4 py-2 bg-slate-100 dark:bg-[#1a1a2e] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-white/20 rounded-xl text-sm transition-all flex items-center gap-2">
            <FiDownload size={14} />
            Export
          </button>
        </section>

      </div>
    </PageLayout>
  );
}

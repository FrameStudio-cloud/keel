import { useState, useEffect } from "react";
import PageLayout from "../components/layout/PageLayout";
import { supabase } from "../lib/supabase";
import { getShopId, withShop } from "../lib/shop";
import { setCurrency } from "../lib/format";
import { setPaymentConfig } from "../lib/paymentConfig";
import { FiSave, FiDownload, FiHome, FiDollarSign, FiMonitor, FiFileText } from "react-icons/fi";

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
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
    business_hours: "",
  });

  useEffect(() => {
    (async () => {
      const shopId = await getShopId();
      const { data } = await supabase
        .from("store_settings")
        .select("*")
        .eq("shop_id", shopId)
        .single();

      if (data) {
        setForm({
          store_name: data.store_name || "",
          store_phone: data.store_phone || "",
          store_address: data.store_address || "",
          currency_symbol: data.currency_symbol || "KSh",
          low_stock_threshold: data.low_stock_threshold || 6,
          default_payment: data.default_payment || "Cash",
          receipt_footer: data.receipt_footer || "",
          theme: data.theme || "dark",
          website_url: data.website_url || "",
          whatsapp: data.whatsapp || "",
          business_hours: data.business_hours
            ? JSON.stringify(data.business_hours, null, 2)
            : "",
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
    let businessHours = null;
    try {
      if (form.business_hours) businessHours = JSON.parse(form.business_hours);
    } catch {
      showToast("Invalid JSON in business hours", "error");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("store_settings")
      .upsert(withShop({ ...form, business_hours: businessHours }));

    setSaving(false);
    if (error) {
      showToast("Something went wrong", "error");
      return;
    }

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

      <div className="max-w-lg mx-auto space-y-6 py-4">
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 flex items-center justify-center">
              <FiHome className="text-blue-400" size={14} />
            </div>
            <h3 className="text-[var(--text-primary)] font-semibold text-sm">Store Details</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Store Name</label>
              <input type="text" value={form.store_name} onChange={(e) => setForm({ ...form, store_name: e.target.value })} className="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-blue-500/50 transition-colors" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Phone</label>
                <input type="text" value={form.store_phone} onChange={(e) => setForm({ ...form, store_phone: e.target.value })} className="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-blue-500/50 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">WhatsApp</label>
                <input type="text" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-blue-500/50 transition-colors" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Address</label>
              <input type="text" value={form.store_address} onChange={(e) => setForm({ ...form, store_address: e.target.value })} className="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-blue-500/50 transition-colors" />
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 flex items-center justify-center">
              <FiDollarSign className="text-blue-400" size={14} />
            </div>
            <h3 className="text-[var(--text-primary)] font-semibold text-sm">Sales & Currency</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Currency Symbol</label>
              <input type="text" value={form.currency_symbol} onChange={(e) => setForm({ ...form, currency_symbol: e.target.value })} className="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-blue-500/50 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Default Payment</label>
              <select value={form.default_payment} onChange={(e) => setForm({ ...form, default_payment: e.target.value })} className="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500/50 transition-colors">
                <option>Cash</option>
                <option>M-Pesa</option>
                <option>Bank</option>
                <option>IntaSend</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Low Stock Threshold</label>
              <input type="number" value={form.low_stock_threshold} onChange={(e) => setForm({ ...form, low_stock_threshold: parseInt(e.target.value) || 0 })} className="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500/50 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Website URL</label>
              <input type="text" value={form.website_url} onChange={(e) => setForm({ ...form, website_url: e.target.value })} className="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-blue-500/50 transition-colors" />
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 flex items-center justify-center">
              <FiMonitor className="text-blue-400" size={14} />
            </div>
            <h3 className="text-[var(--text-primary)] font-semibold text-sm">Appearance</h3>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleThemeChange("dark")}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-all ${
                form.theme === "dark"
                  ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/25"
                  : "bg-[var(--bg-page)] text-[var(--text-secondary)] border-[var(--border)] hover:text-[var(--text-primary)] hover:border-white/20"
              }`}
            >
              Dark
            </button>
            <button
              onClick={() => handleThemeChange("light")}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-all ${
                form.theme === "light"
                  ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/25"
                  : "bg-[var(--bg-page)] text-[var(--text-secondary)] border-[var(--border)] hover:text-[var(--text-primary)] hover:border-white/20"
              }`}
            >
              Light
            </button>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 flex items-center justify-center">
              <FiFileText className="text-blue-400" size={14} />
            </div>
            <h3 className="text-[var(--text-primary)] font-semibold text-sm">Receipt Footer</h3>
          </div>
          <textarea rows={2} value={form.receipt_footer} onChange={(e) => setForm({ ...form, receipt_footer: e.target.value })} placeholder="Thank you for your business!" className="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-blue-500/50 transition-colors resize-none" />
        </div>

        <button onClick={handleSave} disabled={saving} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25">
          <FiSave size={14} />
          {saving ? "Saving..." : "Save Settings"}
        </button>

        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[var(--text-primary)] font-semibold text-sm">Data Export</h3>
              <p className="text-[var(--text-secondary)] text-xs mt-0.5">Download all your data as JSON</p>
            </div>
            <button onClick={handleExport} className="px-4 py-2 bg-[var(--bg-page)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-white/20 rounded-xl text-sm transition-all flex items-center gap-2">
              <FiDownload size={14} />
              Export
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

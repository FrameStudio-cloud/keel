import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { getShopId, withShop } from "../../lib/shop";

export default function BusinessTab() {
  const [form, setForm] = useState({
    store_name: "",
    store_phone: "",
    store_address: "",
    whatsapp: "",
    business_hours: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

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
      .upsert(withShop({
        ...form,
        business_hours: businessHours,
      }));

    setSaving(false);
    if (error) return showToast("Something went wrong", "error");
    showToast("Business info saved!");
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-semibold shadow-xl ${
          toast.type === "error" ? "bg-red-500 text-white" : "bg-blue-600 text-white"
        }`}>
          {toast.msg}
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="block text-xs text-[var(--text-secondary)] mb-1">Store Name</label>
          <input value={form.store_name} onChange={(e) => setForm({ ...form, store_name: e.target.value })} className="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500/50" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">Phone</label>
            <input value={form.store_phone} onChange={(e) => setForm({ ...form, store_phone: e.target.value })} className="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-xl pxtext-[var(--text-primary)]xt-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500/50" />
          </div>
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">WhatsApp</label>
            <input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="w-full bg-[var(--bg-page)] border border-[var(--bordertext-[var(--text-primary)]-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500/50" />
          </div>
        </div>
        <div>
          <label className="block text-xs text-[var(--text-secondary)] mb-1">Address</label>
          <input value={form.store_address} onChange={(e) => setForm({ ...form, store_address: e.target.value })} className="w-full bg-[var(--bg-page)] border border)]border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500/50" />
        </div>
        <div>
          <label className="block text-xs text-[var(--text-secondary)] mb-1">Business Hours (JSON)</label>
          <textarea rows={3} value={form.business_hours} onChange={(e) => setForm({ ...form, business_hours: e.target.value })} className="w-full bg-[var(--bg-page)]r border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-blue-500/50 resize-none font-mono" placeholder='{"mon":"8:00-17:00","tue":"8:00-17:00"}' />
        </div>
        <button onClick={handleSave} disabled={saving} className="w-full py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-500 transition-all disabled:opacity-50">
          {saving ? "Saving..." : "Save Business Info"}
        </button>
      </div>
    </div>
  );
}

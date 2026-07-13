import { useState, useEffect } from "react";
import { FiCheck } from "react-icons/fi";
import { supabase } from "../../lib/supabase";
import { getShopId } from "../../lib/shop";
import { useSettings } from "../../hooks/useSettings";
import ImageUploader from "../ImageUploader";
import { uploadImage } from "../../lib/storage";

const DAYS = [
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
];

function hoursFromSettings(businessHours) {
  if (!businessHours) return DAYS.map((d) => ({ key: d.key, label: d.label, active: true, open: "08:00", close: "17:00" }));
  return DAYS.map((d) => {
    const h = businessHours[d.key];
    return { key: d.key, label: d.label, active: h?.active !== false, open: h?.open || "08:00", close: h?.close || "17:00" };
  });
}

const inputClass = "w-full bg-white dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 transition-colors";

export default function BusinessTab() {
  const settings = useSettings();
  const [form, setForm] = useState({
    email: settings.email || "",
    description: settings.description || "",
    instagram: settings.instagram || "",
    facebook: settings.facebook || "",
    tiktok: settings.tiktok || "",
    logo_url: settings.logoUrl || null,
  });
  const [logoFile, setLogoFile] = useState(null);
  const [hours, setHours] = useState(() => hoursFromSettings(settings.businessHours));
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (settings.loading) return;
    setForm({
      email: settings.email || "",
      description: settings.description || "",
      instagram: settings.instagram || "",
      facebook: settings.facebook || "",
      tiktok: settings.tiktok || "",
      logo_url: settings.logoUrl || null,
    });
    setLogoFile(null);
    setHours(hoursFromSettings(settings.businessHours));
  }, [settings]);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function updateHour(key, field, value) {
    setHours((prev) => prev.map((h) => (h.key === key ? { ...h, [field]: value } : h)));
  }

  async function handleSave() {
    setSaving(true);

    const shopId = await getShopId();
    if (!shopId) {
      setSaving(false);
      showToast("Shop not found", "error");
      return;
    }

    let logo_url = form.logo_url;
    if (logoFile) {
      try {
        logo_url = await uploadImage(logoFile, shopId);
      } catch {
        setSaving(false);
        showToast("Failed to upload logo", "error");
        return;
      }
    }

    const businessHours = {};
    hours.forEach((h) => {
      businessHours[h.key] = { open: h.open, close: h.close, active: h.active };
    });

    const { error } = await supabase
      .from("store_settings")
      .upsert({
        email: form.email,
        description: form.description,
        instagram: form.instagram,
        facebook: form.facebook,
        tiktok: form.tiktok,
        logo_url,
        business_hours: businessHours,
        shop_id: shopId,
      }, { onConflict: "shop_id" });

    setSaving(false);
    if (error) return showToast("Something went wrong", "error");
    showToast("Business info saved!");
  }

  return (
    <div className="max-w-xl mx-auto">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-semibold shadow-xl ${
          toast.type === "error" ? "bg-red-500 text-white" : "bg-blue-600 text-white"
        }`}>
          {toast.msg}
        </div>
      )}

      <div className="space-y-6">

        <div className="bg-white dark:bg-[#16213e] rounded-xl border border-gray-100 dark:border-white/10 p-5 shadow-sm">
          <h3 className="text-sm font-medium text-gray-800 dark:text-white mb-3">Store Description</h3>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="A short description of your store for the public website"
            className={`${inputClass} resize-none`}
          />
        </div>

        <div className="bg-white dark:bg-[#16213e] rounded-xl border border-gray-100 dark:border-white/10 p-5 shadow-sm">
          <h3 className="text-sm font-medium text-gray-800 dark:text-white mb-3">Contact & Social</h3>
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-xs text-gray-400 dark:text-slate-500 mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-400 dark:text-slate-500 mb-1">Instagram</label>
                <input type="text" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} placeholder="https://instagram.com/..." className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-gray-400 dark:text-slate-500 mb-1">Facebook</label>
                <input type="text" value={form.facebook} onChange={(e) => setForm({ ...form, facebook: e.target.value })} placeholder="https://facebook.com/..." className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-gray-400 dark:text-slate-500 mb-1">TikTok</label>
                <input type="text" value={form.tiktok} onChange={(e) => setForm({ ...form, tiktok: e.target.value })} placeholder="https://tiktok.com/..." className={inputClass} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#16213e] rounded-xl border border-gray-100 dark:border-white/10 p-5 shadow-sm">
          <h3 className="text-sm font-medium text-gray-800 dark:text-white mb-3">Store Logo</h3>
          <ImageUploader currentImage={form.logo_url} onImageChange={(file) => setLogoFile(file)} />
        </div>

        <div className="bg-white dark:bg-[#16213e] rounded-xl border border-gray-100 dark:border-white/10 p-5 shadow-sm">
          <h3 className="text-sm font-medium text-gray-800 dark:text-white mb-3">Business Hours</h3>
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

        <button onClick={handleSave} disabled={saving} className="w-full py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-500 transition-all disabled:opacity-50">
          {saving ? "Saving..." : "Save Business Info"}
        </button>
      </div>
    </div>
  );
}

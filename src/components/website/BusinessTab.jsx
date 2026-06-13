import { useState, useEffect } from "react";
import { FiCheck } from "react-icons/fi";
import { supabase } from "../../lib/supabase";
import { getShopId } from "../../lib/shop";

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

export default function BusinessTab() {
  const [hours, setHours] = useState(defaultHours());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    (async () => {
      const shopId = await getShopId();
      const { data } = await supabase
        .from("store_settings")
        .select("business_hours")
        .eq("shop_id", shopId)
        .single();

      if (data?.business_hours) {
        setHours(
          DAYS.map((d) => {
            const h = data.business_hours[d.key];
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
      setLoading(false);
    })();
  }, []);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function updateHour(key, field, value) {
    setHours((prev) => prev.map((h) => (h.key === key ? { ...h, [field]: value } : h)));
  }

  async function handleSave() {
    setSaving(true);

    const businessHours = {};
    hours.forEach((h) => {
      businessHours[h.key] = { open: h.open, close: h.close, active: h.active };
    });

    const shopId = await getShopId();
    const { error } = await supabase
      .from("store_settings")
      .upsert({
        business_hours: businessHours,
        shop_id: shopId,
      });

    setSaving(false);
    if (error) return showToast("Something went wrong", "error");
    showToast("Business hours saved!");
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
    <div className="max-w-xl mx-auto">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-semibold shadow-xl ${
          toast.type === "error" ? "bg-red-500 text-white" : "bg-blue-600 text-white"
        }`}>
          {toast.msg}
        </div>
      )}

      <div className="space-y-4">

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wider">Business Hours</label>
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

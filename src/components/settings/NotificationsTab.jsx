import SectionCard from "./SectionCard";
import { inputClass } from "./settingsStyles";
import {
  FiBell, FiMail, FiTag, FiClock,
  FiMessageCircle, FiPhone, FiCheck
} from "react-icons/fi";

function Toggle({ enabled, onChange, label, desc }) {
  return (
    <label className="flex items-start gap-3 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] cursor-pointer hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors">
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); onChange(!enabled); }}
        className={`w-9 h-5 rounded-full relative transition-all shrink-0 mt-0.5 ${
          enabled ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-600"
        }`}
      >
        <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-all shadow-sm ${
          enabled ? "left-[18px]" : "left-[3px]"
        }`} />
      </button>
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-800 dark:text-white">{label}</p>
        {desc && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{desc}</p>}
      </div>
    </label>
  );
}

export default function NotificationsTab({ form, setForm, whatsapp }) {
  const prefs = form.notification_preferences || {};

  function setPref(key, value) {
    setForm({
      ...form,
      notification_preferences: { ...prefs, [key]: value },
    });
  }

  return (
    <>
      <SectionCard icon={FiMail} title="Notification Email">
        <div>
          <label className="block text-xs text-gray-400 dark:text-slate-500 mb-1">
            Where to receive email alerts
          </label>
          <div className="relative">
            <FiMail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              value={prefs.email || ""}
              onChange={(e) => setPref("email", e.target.value)}
              placeholder="shop@example.com"
              className={`${inputClass} pl-9`}
            />
          </div>
          <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1">
            Used for low stock alerts, daily summaries, and other automated notifications.
            Leave blank to use your account email.
          </p>
        </div>
      </SectionCard>

      <SectionCard icon={FiTag} title="Low Stock Threshold">
        <div>
          <label className="block text-xs text-gray-400 dark:text-slate-500 mb-1">
            Minimum stock level before alert
          </label>
          <input
            type="number"
            value={form.low_stock_threshold}
            onChange={(e) => setForm({ ...form, low_stock_threshold: parseInt(e.target.value) || 0 })}
            className={`${inputClass} max-w-[120px]`}
          />
          <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1">
            Products at or below this level trigger low-stock warnings in the bell icon and alerts.
          </p>
        </div>
      </SectionCard>

      <SectionCard icon={FiClock} title="Email Notifications">
        <div className="flex flex-col gap-2">
          <Toggle
            enabled={prefs.low_stock_email !== false}
            onChange={(v) => setPref("low_stock_email", v)}
            label="Low stock alerts"
            desc="When any product drops below the low stock threshold"
          />
          <Toggle
            enabled={prefs.daily_summary_email !== false}
            onChange={(v) => setPref("daily_summary_email", v)}
            label="Daily sales summary"
            desc="End-of-day recap of sales, revenue, and top products"
          />
          <Toggle
            enabled={prefs.weekly_report_email === true}
            onChange={(v) => setPref("weekly_report_email", v)}
            label="Weekly report"
            desc="Full weekly breakdown of performance and trends"
          />
          <Toggle
            enabled={prefs.updates_email !== false}
            onChange={(v) => setPref("updates_email", v)}
            label="Product updates &amp; tips"
            desc="New features, tips, and occasional product announcements"
          />
        </div>
      </SectionCard>

      <SectionCard icon={FiBell} title="In-App Notifications">
        <div className="flex flex-col gap-2">
          <Toggle
            enabled={prefs.callbacks_inapp !== false}
            onChange={(v) => setPref("callbacks_inapp", v)}
            label="Callback requests"
            desc="When a customer requests a call back from your website"
          />
          <Toggle
            enabled={prefs.stock_alerts_inapp !== false}
            onChange={(v) => setPref("stock_alerts_inapp", v)}
            label="Stock alert requests"
            desc="When a customer asks to be notified when an item is back in stock"
          />
        </div>
      </SectionCard>

      {whatsapp && (
        <SectionCard icon={FiMessageCircle} title="WhatsApp">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03]">
            <FiPhone size={14} className="text-gray-400 shrink-0" />
            <span className="text-sm text-gray-800 dark:text-white">{whatsapp}</span>
            <span className="text-[10px] text-gray-400 dark:text-slate-500 ml-auto flex items-center gap-1">
              <FiCheck size={10} />
              Connected
            </span>
          </div>
          <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-2">
            WhatsApp bot notifications are coming soon. You'll be able to receive alerts directly
            on WhatsApp.
          </p>
        </SectionCard>
      )}
    </>
  );
}

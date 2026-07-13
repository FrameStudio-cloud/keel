import SectionCard, { CARD_CLASS } from "./SectionCard";
import { inputClass } from "./settingsStyles";
import { FiMonitor, FiSun, FiMoon, FiDollarSign, FiFileText } from "react-icons/fi";

export default function PreferencesTab({ form, setForm, handleThemeChange }) {
  return (
    <>
      <SectionCard icon={FiMonitor} title="Appearance">
        <div className="flex gap-3">
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
        </div>
      </SectionCard>

      <SectionCard icon={FiDollarSign} title="Currency & Payments">
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
        </div>
      </SectionCard>

      <SectionCard icon={FiFileText} title="Receipt Footer">
        <textarea rows={2} value={form.receipt_footer} onChange={(e) => setForm({ ...form, receipt_footer: e.target.value })} placeholder="Thank you for your business!" className={`${inputClass} resize-none`} />
      </SectionCard>

      <a href="/terms" target="_blank" className={`${CARD_CLASS} block hover:border-gray-300 dark:hover:border-white/20 transition-all group`}>
        <div className="flex items-center gap-2">
          <FiFileText size={14} className="text-gray-400" />
          <h3 className="text-sm font-medium text-gray-800 dark:text-white">Terms of Service</h3>
          <span className="ml-auto text-gray-400 group-hover:text-gray-600 dark:group-hover:text-slate-300 transition-all">&gt;</span>
        </div>
      </a>
    </>
  );
}

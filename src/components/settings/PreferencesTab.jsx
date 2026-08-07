import SectionCard, { CARD_CLASS } from "./SectionCard";
import { inputClass } from "./settingsStyles";
import ThemePicker from "./ThemePicker";
import { FiMonitor, FiDollarSign, FiFileText } from "react-icons/fi";

export default function PreferencesTab({ form, setForm, handleThemeChange }) {
  return (
    <>
      <SectionCard icon={FiMonitor} title="Appearance">
        <ThemePicker value={form.theme} onSelect={handleThemeChange} />
      </SectionCard>

      <SectionCard icon={FiDollarSign} title="Currency & Payments">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-text-faint mb-1">Currency Symbol</label>
            <input type="text" value={form.currency_symbol} onChange={(e) => setForm({ ...form, currency_symbol: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs text-text-faint mb-1">Default Payment</label>
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

      <a href="/terms" target="_blank" className={`${CARD_CLASS} block hover:border-border-strong dark:hover:border-white/20 transition-all group`}>
        <div className="flex items-center gap-2">
          <FiFileText size={14} className="text-text-faint" />
          <h3 className="text-sm font-medium text-text-primary">Terms of Service</h3>
          <span className="ml-auto text-text-faint group-hover:text-text-body dark:group-hover:text-text-body transition-all">&gt;</span>
        </div>
      </a>
    </>
  );
}

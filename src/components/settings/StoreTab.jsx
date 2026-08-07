import SectionCard from "./SectionCard";
import { inputClass } from "./settingsStyles";
import {
  FiShoppingBag, FiGlobe, FiLock, FiClock, FiCheck, FiDroplet, FiAtSign
} from "react-icons/fi";

const CATEGORY_GROUPS = [
  {
    name: "Fashion & Beauty",
    items: ["clothing", "footwear", "wigs",       "cosmetics-beauty", "nails-salon", "barber-grooming", "jewelry-accessories"],
  },
  {
    name: "Electronics & Electrical",
    items: ["electronics", "electricals", "electronics-repair"],
  },
  {
    name: "Home & Living",
    items: ["furniture-home-decor", "groceries-foodstuffs", "hardware-building"],
  },
  {
    name: "Sports & Kids",
    items: ["sports-fitness", "baby-kids"],
  },
  {
    name: "Media & Office",
    items: ["books-stationery"],
  },
  {
    name: "Automotive",
    items: ["automotive-car", "auto-repair-garage"],
  },
  {
    name: "Services & Repairs",
    items: ["laundry", "photography", "cleaning-services"],
  },
  {
    name: "Other",
    items: ["general"],
  },
];

function catClass(cat, selected, locked) {
  return `py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap ${
    locked && selected !== cat
      ? "opacity-40 cursor-not-allowed bg-surface-1 text-text-muted border-border-subtle"
      : selected === cat
      ? "bg-brand text-white border-brand shadow-lg shadow-brand/25"
      : "bg-surface-1 text-text-muted border-border-subtle hover:text-text-primary dark:hover:text-white hover:border-border-strong dark:hover:border-white/20"
  }`;
}

function categoryLabel(slug) {
  return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export default function StoreTab({ form, setForm, hours, updateHour, validationErrors, categoryLocked, categoryRemainingDays }) {
  return (
    <>
      <SectionCard icon={FiShoppingBag} title="Store Details">
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-xs text-text-faint mb-1">Store Name</label>
            <input type="text" value={form.store_name} onChange={(e) => setForm({ ...form, store_name: e.target.value })} className={`${inputClass} ${validationErrors.store_name ? "border-danger focus:border-danger focus:ring-danger/20" : ""}`} />
            {validationErrors.store_name && <p className="text-xs text-danger mt-1">{validationErrors.store_name}</p>}
          </div>
          <div>
            <label className="block text-xs text-text-faint mb-1">Accent Word <span className="text-[10px] text-text-faint">(e.g. "Fashion" in "Campus Fashion")</span></label>
            <input type="text" value={form.name_accent} onChange={(e) => setForm({ ...form, name_accent: e.target.value })} placeholder="Auto-detected from store name" className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-text-faint mb-1">Phone</label>
              <input type="text" value={form.store_phone} onChange={(e) => setForm({ ...form, store_phone: e.target.value })} className={`${inputClass} ${validationErrors.store_phone ? "border-danger focus:border-danger focus:ring-danger/20" : ""}`} />
              {validationErrors.store_phone && <p className="text-xs text-danger mt-1">{validationErrors.store_phone}</p>}
            </div>
            <div>
              <label className="block text-xs text-text-faint mb-1">WhatsApp</label>
              <input type="text" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-xs text-text-faint mb-1">Address</label>
            <input type="text" value={form.store_address} onChange={(e) => setForm({ ...form, store_address: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs text-text-faint mb-1">Website URL</label>
            <div className="relative">
              <FiGlobe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint" />
              <input type="text" value={form.website_url} onChange={(e) => setForm({ ...form, website_url: e.target.value })} placeholder="https://your-shop.vercel.app" className={`${inputClass} pl-9 ${validationErrors.website_url ? "border-danger focus:border-danger focus:ring-danger/20" : ""}`} />
            </div>
            {validationErrors.website_url && <p className="text-xs text-danger mt-1">{validationErrors.website_url}</p>}
            <p className="text-[10px] text-text-faint mt-1">Enables website analytics on Overview and Website management page</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard icon={FiAtSign} title="Social Links">
        <p className="text-xs text-text-faint mb-3">Displayed on your storefront site's footer</p>
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-xs text-text-faint mb-1">Instagram</label>
            <input type="text" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} placeholder="username (without @)" className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-text-faint mb-1">Facebook</label>
              <input type="text" value={form.facebook} onChange={(e) => setForm({ ...form, facebook: e.target.value })} placeholder="URL or username" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-text-faint mb-1">TikTok</label>
              <input type="text" value={form.tiktok} onChange={(e) => setForm({ ...form, tiktok: e.target.value })} placeholder="username (without @)" className={inputClass} />
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard icon={FiDroplet} title="Brand Colors">
        <p className="text-xs text-text-faint mb-3">Used by your generated storefront site</p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-text-faint mb-1">Primary</label>
            <div className="flex items-center gap-2">
              <input type="color" value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} className="w-8 h-8 rounded border border-border-subtle cursor-pointer bg-transparent" />
              <input type="text" value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} className={`${inputClass} flex-1 font-mono text-xs`} />
            </div>
          </div>
          <div>
            <label className="block text-xs text-text-faint mb-1">Secondary</label>
            <div className="flex items-center gap-2">
              <input type="color" value={form.secondary_color} onChange={(e) => setForm({ ...form, secondary_color: e.target.value })} className="w-8 h-8 rounded border border-border-subtle cursor-pointer bg-transparent" />
              <input type="text" value={form.secondary_color} onChange={(e) => setForm({ ...form, secondary_color: e.target.value })} className={`${inputClass} flex-1 font-mono text-xs`} />
            </div>
          </div>
          <div>
            <label className="block text-xs text-text-faint mb-1">Accent</label>
            <div className="flex items-center gap-2">
              <input type="color" value={form.accent_color} onChange={(e) => setForm({ ...form, accent_color: e.target.value })} className="w-8 h-8 rounded border border-border-subtle cursor-pointer bg-transparent" />
              <input type="text" value={form.accent_color} onChange={(e) => setForm({ ...form, accent_color: e.target.value })} className={`${inputClass} flex-1 font-mono text-xs`} />
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard icon={FiShoppingBag} title="Business Category">
        <p className="text-xs text-text-faint mb-3">Controls variant fields shown in Inventory (color, size, storage)</p>
        <div className="space-y-3 max-h-[320px] overflow-y-auto">
          {CATEGORY_GROUPS.map((group) => (
            <div key={group.name}>
              <p className="text-[10px] uppercase tracking-widest text-text-faint font-semibold mb-1.5">
                {group.name}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {group.items.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      if (categoryLocked && form.business_category !== cat) return;
                      setForm({ ...form, business_category: cat });
                    }}
                    className={catClass(cat, form.business_category, categoryLocked)}
                  >
                    {categoryLabel(cat)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        {categoryLocked && (
          <div className="mt-3 flex items-center gap-2 text-xs text-warning bg-warning-muted border border-warning rounded-lg px-3 py-2">
            <FiLock size={12} className="shrink-0" />
            <span>You can change your business category again in <strong>{categoryRemainingDays}</strong> {categoryRemainingDays === 1 ? "day" : "days"}.</span>
          </div>
        )}
      </SectionCard>

      <SectionCard icon={FiClock} title="Business Hours">
        <div className="bg-surface-2 rounded-xl border border-border-subtle overflow-hidden">
          {hours.map((h, i) => (
            <div
              key={h.key}
              className={`flex items-center gap-3 px-4 py-2.5 ${i < hours.length - 1 ? "border-b border-border-subtle" : ""}`}
            >
              <button
                onClick={() => updateHour(h.key, "active", !h.active)}
                className={`w-5 h-5 rounded-md flex items-center justify-center transition-all flex-shrink-0 ${h.active ? "bg-brand text-white" : "bg-surface-2 text-transparent"}`}
              >
                {h.active && <FiCheck size={12} />}
              </button>
              <span className={`text-sm w-10 font-medium flex-shrink-0 ${h.active ? "text-text-primary" : "text-text-faint"}`}>
                {h.label}
              </span>
              {h.active ? (
                <div className="flex items-center gap-2 ml-auto">
                  <input type="time" value={h.open} onChange={(e) => updateHour(h.key, "open", e.target.value)} className="bg-surface-1 border border-border-subtle rounded-lg px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:border-brand/50" />
                  <span className="text-xs text-text-faint">—</span>
                  <input type="time" value={h.close} onChange={(e) => updateHour(h.key, "close", e.target.value)} className="bg-surface-1 border border-border-subtle rounded-lg px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:border-brand/50" />
                </div>
              ) : (
                <span className="text-xs text-text-faint ml-auto">Closed</span>
              )}
            </div>
          ))}
        </div>
      </SectionCard>
    </>
  );
}

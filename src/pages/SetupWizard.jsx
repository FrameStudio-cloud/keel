import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { FiArrowLeft, FiArrowRight, FiMonitor, FiLayers, FiTool, FiGrid, FiUser, FiDroplet, FiHeart, FiHome, FiPackage, FiBook, FiActivity, FiSmile, FiCompass, FiStar, FiTruck, FiCamera, FiWind } from "react-icons/fi";
import { supabase } from "../lib/supabase";
import { getShopId } from "../lib/shop";
import { AuthContext } from "../context/AuthContext";
import ImageUploader from "../components/ImageUploader";
import { uploadImage } from "../lib/storage";

const CATEGORY_GROUPS = [
  {
    name: "Fashion & Beauty",
    items: [
      { id: "clothing", label: "Clothing", icon: FiLayers },
      { id: "footwear", label: "Footwear", icon: FiCompass },
      { id: "wigs", label: "Wigs", icon: FiUser },
      { id: "cosmetics-beauty", label: "Cosmetics & Beauty", icon: FiDroplet },
      { id: "nails-salon", label: "Nails & Salon", icon: FiHeart },
      { id: "barber-grooming", label: "Barber & Grooming", icon: FiUser },
      { id: "jewelry-accessories", label: "Jewelry & Accessories", icon: FiStar },
    ],
  },
  {
    name: "Electronics & Electrical",
    items: [
      { id: "electronics", label: "Electronics", icon: FiMonitor },
      { id: "electricals", label: "Electricals", icon: FiTool },
      { id: "electronics-repair", label: "Electronics Repair", icon: FiTool },
    ],
  },
  {
    name: "Home & Living",
    items: [
      { id: "furniture-home-decor", label: "Furniture & Decor", icon: FiHome },
      { id: "groceries-foodstuffs", label: "Groceries & Food", icon: FiPackage },
      { id: "hardware-building", label: "Hardware & Building", icon: FiTool },
    ],
  },
  {
    name: "Sports & Kids",
    items: [
      { id: "sports-fitness", label: "Sports & Fitness", icon: FiActivity },
      { id: "baby-kids", label: "Baby & Kids", icon: FiSmile },
    ],
  },
  {
    name: "Media & Office",
    items: [
      { id: "books-stationery", label: "Books & Stationery", icon: FiBook },
    ],
  },
  {
    name: "Automotive",
    items: [
      { id: "automotive-car", label: "Automotive & Car", icon: FiTruck },
      { id: "auto-repair-garage", label: "Auto Repair & Garage", icon: FiTruck },
    ],
  },
  {
    name: "Services & Repairs",
    items: [
      { id: "laundry", label: "Laundry", icon: FiGrid },
      { id: "photography", label: "Photography", icon: FiCamera },
      { id: "cleaning-services", label: "Cleaning Services", icon: FiWind },
    ],
  },
  {
    name: "Other",
    items: [
      { id: "general", label: "General", icon: FiGrid },
    ],
  },
];

const STEPS = ["category", "store", "details", "currency", "payment", "done"];

const KEYFRAME_STYLE = `
@keyframes blob-drift-1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(40px, -30px) scale(1.1); }
  66% { transform: translate(-20px, 40px) scale(0.95); }
}
@keyframes blob-drift-2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(-30px, 40px) scale(1.05); }
  66% { transform: translate(30px, -20px) scale(0.9); }
}
@keyframes blob-drift-3 {
  0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
  50% { transform: translate(-20px, -20px) scale(1.15) rotate(5deg); }
}
.animate-blob-1 { animation: blob-drift-1 18s ease-in-out infinite; }
.animate-blob-2 { animation: blob-drift-2 22s ease-in-out infinite; }
.animate-blob-3 { animation: blob-drift-3 15s ease-in-out infinite; }
@keyframes slide-up {
  0% { opacity: 0; transform: translateY(12px); }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes scale-in {
  0% { transform: scale(0); opacity: 0; }
  60% { transform: scale(1.15); }
  100% { transform: scale(1); opacity: 1; }
}
.animate-slide-up { animation: slide-up 0.35s ease-out both; }
.animate-scale-in { animation: scale-in 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
`;

export default function SetupWizard() {
  const { logout, completeSetup } = useContext(AuthContext);
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    category: "general",
    storeName: "",
    storePhone: "",
    storeAddress: "",
    currencySymbol: "KSh",
    defaultPayment: "Cash",
    lowStockThreshold: 6,
  });
  const [logoFile, setLogoFile] = useState(null);
  const [saving, setSaving] = useState(false);

  async function handleFinish() {
    setSaving(true);
    const shopId = await getShopId();
    if (!shopId) return;

    let logo_url = null;
    if (logoFile) {
      try {
        logo_url = await uploadImage(logoFile, shopId);
      } catch (err) {
        console.error("Logo upload failed:", err);
      }
    }

    await supabase.from("shops").update({ business_category: form.category, category_changed_at: new Date().toISOString(), setup_completed_at: new Date().toISOString() }).eq("id", shopId);

    const payload = {
      store_name: form.storeName,
      store_phone: form.storePhone,
      store_address: form.storeAddress,
      currency_symbol: form.currencySymbol,
      default_payment: form.defaultPayment,
      low_stock_threshold: form.lowStockThreshold,
      theme: "keel-light",
      logo_url,
    };

    const { data: existing } = await supabase.from("store_settings").select("id").eq("shop_id", shopId).maybeSingle();
    if (existing) {
      await supabase.from("store_settings").update(payload).eq("shop_id", shopId);
    } else {
      await supabase.from("store_settings").insert({ ...payload, shop_id: shopId });
    }

    setSaving(false);
    completeSetup();
    setStep(STEPS.length - 1);
  }

  if (step === STEPS.length - 1) {
    return (
      <>
        <style>{KEYFRAME_STYLE}</style>
        <div className="min-h-screen bg-surface-0 flex items-center justify-center p-4 relative overflow-hidden">
          <div className="fixed inset-0 pointer-events-none">
            <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px] animate-blob-1" />
            <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-indigo-500/15 rounded-full blur-[120px] animate-blob-2" />
            <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] animate-blob-3" />
            <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle, #0f172a 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
          </div>
          <div className="relative z-10 bg-surface-1/90 backdrop-blur-xl border border-border-subtle rounded-2xl p-8 w-full max-w-md text-center shadow-xl shadow-black/5 dark:shadow-black/20">
            <div className="w-14 h-14 rounded-full bg-success-muted flex items-center justify-center mx-auto mb-4 animate-scale-in">
              <span className="text-2xl text-success">✓</span>
            </div>
            <h2 className="text-text-primary font-bold text-lg mb-2">You're all set!</h2>
            <p className="text-text-body text-sm mb-6">
              Your shop is ready. Start adding products and managing sales.
            </p>
            <button
              onClick={() => navigate("/", { replace: true })}
              className="w-full py-2.5 bg-brand hover:bg-brand-soft text-white font-bold rounded-xl text-sm transition-all"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet><title>Setup — Keel</title></Helmet>
      <style>{KEYFRAME_STYLE}</style>
    <div className="min-h-screen bg-surface-0 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px] animate-blob-1" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-indigo-500/15 rounded-full blur-[120px] animate-blob-2" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] animate-blob-3" />
        <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle, #0f172a 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
      </div>
      <div className="relative z-10 bg-surface-1/90 backdrop-blur-xl border border-border-subtle rounded-2xl p-8 w-full max-w-md shadow-xl shadow-black/5 dark:shadow-black/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center flex-1 max-w-xs mx-auto">
            {STEPS.slice(0, -1).map((_, i) => (
              <div key={i} className="flex items-center flex-1 last:flex-none">
                <div className={`
                  w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-300 border-2
                  ${i < step
                    ? "bg-brand border-brand text-white"
                    : i === step
                    ? "bg-brand border-brand text-white shadow-[0_0_0_4px_rgba(59,130,246,0.2)] dark:shadow-[0_0_0_4px_rgba(59,130,246,0.15)]"
                    : "border-border-strong dark:border-white/20 text-text-faint bg-transparent"
                  }
                `}>
                  {i < step ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                {i < STEPS.length - 2 && (
                  <div className={`flex-1 h-0.5 mx-1.5 transition-colors duration-300 ${i < step ? "bg-brand" : "bg-surface-2"}`} />
                )}
              </div>
            ))}
          </div>
          <button
            onClick={logout}
            className="text-xs text-text-faint hover:text-text-body dark:hover:text-text-body shrink-0 ml-4"
          >
            Sign out
          </button>
        </div>

        <div key={step} className="animate-slide-up">
          <h2 className="text-text-primary font-bold text-lg mb-1">
            {STEPS[step] === "category" && "What do you sell?"}
            {STEPS[step] === "store" && "Shop name"}
            {STEPS[step] === "details" && "Contact details"}
            {STEPS[step] === "currency" && "Currency"}
            {STEPS[step] === "payment" && "Payment settings"}
          </h2>
          <p className="text-text-muted text-sm mb-6">
            {STEPS[step] === "category" && "Choose your business category so we can tailor the experience."}
            {STEPS[step] === "store" && "What's your store called?"}
            {STEPS[step] === "details" && "Phone number and location for receipts and website."}
            {STEPS[step] === "currency" && "Set your local currency symbol."}
            {STEPS[step] === "payment" && "Choose a default payment method and low stock threshold."}
          </p>

          <div className="space-y-3">
            {STEPS[step] === "category" && (
              <div className="space-y-4 max-h-[340px] overflow-y-auto pr-1">
                {CATEGORY_GROUPS.map((group) => (
                  <div key={group.name}>
                    <p className="text-[10px] uppercase tracking-widest text-text-faint font-semibold mb-2">
                      {group.name}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {group.items.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setForm({ ...form, category: cat.id })}
                          className={`flex flex-col items-center text-center p-3 rounded-xl border text-sm transition-all ${
                            form.category === cat.id
                              ? "border-brand bg-brand-muted text-brand"
                              : "border-border-subtle text-text-body hover:border-border-strong"
                          }`}
                        >
                          <cat.icon className="text-lg mb-1.5" />
                          <div className="font-medium text-xs leading-tight">{cat.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {STEPS[step] === "store" && (
              <>
                <input
                  type="text"
                  placeholder="e.g. Lewis Electronics"
                  value={form.storeName}
                  onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                  className="w-full bg-surface-2 border border-border-subtle rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder-text-faint focus:outline-none focus:border-brand/50"
                />
                <ImageUploader currentImage={null} onImageChange={(file) => setLogoFile(file)} />
              </>
            )}

            {STEPS[step] === "details" && (
              <>
                <input
                  type="tel"
                  placeholder="+254 700 000 000"
                  value={form.storePhone}
                  onChange={(e) => setForm({ ...form, storePhone: e.target.value })}
                  className="w-full bg-surface-2 border border-border-subtle rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder-text-faint focus:outline-none focus:border-brand/50"
                />
                <input
                  type="text"
                  placeholder="Thika, Kenya"
                  value={form.storeAddress}
                  onChange={(e) => setForm({ ...form, storeAddress: e.target.value })}
                  className="w-full bg-surface-2 border border-border-subtle rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder-text-faint focus:outline-none focus:border-brand/50"
                />
              </>
            )}

            {STEPS[step] === "currency" && (
              <select
                value={form.currencySymbol}
                onChange={(e) => setForm({ ...form, currencySymbol: e.target.value })}
                className="w-full bg-surface-2 border border-border-subtle rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand/50"
              >
                <option value="KSh">KSh — Kenyan Shilling</option>
                <option value="$">$ — US Dollar</option>
                <option value="TSh">TSh — Tanzanian Shilling</option>
                <option value="UGX">UGX — Ugandan Shilling</option>
                <option value="RWF">RWF — Rwandan Franc</option>
                <option value="KES">KES — Kenyan Shilling (alt)</option>
                <option value="£">£ — British Pound</option>
                <option value="€">€ — Euro</option>
              </select>
            )}

            {STEPS[step] === "payment" && (
              <>
                <select
                  value={form.defaultPayment}
                  onChange={(e) => setForm({ ...form, defaultPayment: e.target.value })}
                  className="w-full bg-surface-2 border border-border-subtle rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand/50"
                >
                  <option value="Cash">Cash</option>
                  <option value="M-Pesa">M-Pesa</option>
                  <option value="Bank">Bank</option>

                </select>
                <div>
                  <label className="block text-xs text-text-muted mb-1">
                    Low stock alert at
                  </label>
                  <input
                    type="number"
                    value={form.lowStockThreshold}
                    onChange={(e) => setForm({ ...form, lowStockThreshold: parseInt(e.target.value) || 6 })}
                    className="w-full bg-surface-2 border border-border-subtle rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand/50"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 border border-border-subtle text-text-body text-sm py-2.5 rounded-xl hover:bg-surface-2 transition-all flex items-center justify-center gap-1.5"
            >
              <FiArrowLeft className="text-sm" />
              Back
            </button>
          )}
          <button
            onClick={() => (step < STEPS.length - 2 ? setStep(step + 1) : handleFinish())}
            disabled={saving}
            className="flex-1 bg-brand hover:bg-brand-soft text-white font-bold text-sm py-2.5 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {saving ? "Saving..." : step === STEPS.length - 2 ? "Finish" : "Next"}
            {!saving && <FiArrowRight className="text-sm" />}
          </button>
        </div>
      </div>
    </div>
    </>
  );
}

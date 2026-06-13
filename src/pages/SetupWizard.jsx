import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiBox, FiShoppingBag, FiMonitor, FiZap } from "react-icons/fi";
import { supabase } from "../lib/supabase";
import { getShopId, withShop } from "../lib/shop";

const CATEGORIES = [
  { id: "general", label: "General", icon: <FiBox /> },
  { id: "clothing", label: "Clothing", icon: <FiShoppingBag /> },
  { id: "electronics", label: "Electronics", icon: <FiMonitor /> },
  { id: "electricals", label: "Electricals", icon: <FiZap /> },
];

const STEPS = [
  { id: "category", label: "Category" },
  { id: "details", label: "Details" },
  { id: "currency", label: "Currency" },
  { id: "payment", label: "Payment" },
  { id: "threshold", label: "Threshold" },
];

export default function SetupWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    businessCategory: "general",
    storeName: "",
    storePhone: "",
    storeAddress: "",
    currencySymbol: "KSh",
    defaultPayment: "Cash",
    lowStockThreshold: 6,
  });

  const shopIdPromise = getShopId();

  async function handleFinish() {
    setLoading(true);
    const shopId = await shopIdPromise;

    if (shopId) {
      await supabase
        .from("shops")
        .update({ business_category: form.businessCategory })
        .eq("id", shopId);

      await supabase.from("store_settings").upsert(
        withShop({
          store_name: form.storeName,
          store_phone: form.storePhone,
          store_address: form.storeAddress,
          currency_symbol: form.currencySymbol,
          default_payment: form.defaultPayment,
          low_stock_threshold: form.lowStockThreshold,
          theme: "dark",
        })
      );
    }

    setLoading(false);
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#1a1a2e] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#16213e] border border-slate-200 dark:border-white/10 rounded-2xl p-8 w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center gap-1 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex-1 flex items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  i <= step
                    ? "bg-blue-600 text-white"
                    : "bg-white/10 text-slate-400 dark:text-slate-500"
                }`}
              >
                {i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 transition-colors ${
                    i < step ? "bg-blue-600" : "bg-white/10"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Category Step */}
        {step === 0 && (
          <div>
            <h2 className="text-slate-900 dark:text-white font-bold text-lg mb-2">
              What do you sell?
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
              This helps us set up the right options for your products.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() =>
                    setForm({ ...form, businessCategory: cat.id })
                  }
                  className={`p-4 rounded-xl border text-left transition-all ${
                    form.businessCategory === cat.id
                      ? "bg-blue-500/10 border-blue-500"
                      : "bg-slate-100 dark:bg-[#1a1a2e] border-slate-200 dark:border-white/10 hover:border-white/20"
                  }`}
                >
                  <span className="text-2xl text-slate-600 dark:text-slate-400">{cat.icon}</span>
                <p className="text-slate-900 dark:text-white font-semibold text-sm mt-2">
                    {cat.label}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Details Step */}
        {step === 1 && (
          <>
          <h2 className="text-slate-900 dark:text-white font-bold text-lg mb-2">
              Tell us about your store
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
              Your customers will see this on your website.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  Store Name
                </label>
                <input
                  type="text"
                  value={form.storeName}
                  onChange={(e) =>
                    setForm({ ...form, storeName: e.target.value })
                  }
                  className="w-full bg-slate-100 dark:bg-[#1a1a2e] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                  placeholder="My Shop"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  Phone
                </label>
                <input
                  type="text"
                  value={form.storePhone}
                  onChange={(e) =>
                    setForm({ ...form, storePhone: e.target.value })
                  }
                  className="w-full bg-slate-100 dark:bg-[#1a1a2e] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                  placeholder="+254 700 000 000"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  Address
                </label>
                <input
                  type="text"
                  value={form.storeAddress}
                  onChange={(e) =>
                    setForm({ ...form, storeAddress: e.target.value })
                  }
                  className="w-full bg-slate-100 dark:bg-[#1a1a2e] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                />
              </div>
            </div>
          </>
        )}

        {/* Currency Step */}
        {step === 2 && (
          <div>
            <h2 className="text-slate-900 dark:text-white font-bold text-lg mb-2">
              Choose your currency
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
              All prices will be displayed using this symbol.
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { symbol: "KSh", label: "Kenyan Shilling" },
                { symbol: "TSh", label: "Tanzanian Shilling" },
                { symbol: "USh", label: "Ugandan Shilling" },
                { symbol: "$", label: "US Dollar" },
                { symbol: "KES", label: "KES" },
                { symbol: "UGX", label: "UGX" },
              ].map((opt) => (
                <button
                  key={opt.symbol}
                  onClick={() =>
                    setForm({ ...form, currencySymbol: opt.symbol })
                  }
                  className={`p-3 rounded-xl text-center transition-all ${
                    form.currencySymbol === opt.symbol
                      ? "bg-blue-500/10 border border-blue-500"
                      : "bg-slate-100 dark:bg-[#1a1a2e] border border-slate-200 dark:border-white/10 hover:border-white/20"
                  }`}
                >
                  <p className="text-slate-900 dark:text-white font-bold text-lg">{opt.symbol}</p>
                  <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">{opt.label}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Payment Step */}
        {step === 3 && (
          <div>
            <h2 className="text-slate-900 dark:text-white font-bold text-lg mb-2">
              Default payment method
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
              Pre-selected when logging a sale.
            </p>
            {["Cash", "M-Pesa", "Bank", "IntaSend"].map((method) => (
              <button
                key={method}
                onClick={() =>
                  setForm({ ...form, defaultPayment: method })
                }
                className={`w-full p-3 rounded-xl text-left mb-2 transition-all ${
                  form.defaultPayment === method
                    ? "bg-blue-500/10 border border-blue-500"
                    : "bg-slate-100 dark:bg-[#1a1a2e] border border-slate-200 dark:border-white/10 hover:border-white/20"
                }`}
              >
                <span className="text-slate-900 dark:text-white font-semibold text-sm">
                  {method}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Threshold Step */}
        {step === 4 && (
          <div>
            <h2 className="text-slate-900 dark:text-white font-bold text-lg mb-2">
              Low stock threshold
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
              Get alerted when stock drops below this number.
            </p>
            <input
              type="number"
              value={form.lowStockThreshold}
              onChange={(e) =>
                setForm({
                  ...form,
                  lowStockThreshold: parseInt(e.target.value) || 0,
                })
              }
              className="w-full bg-slate-100 dark:bg-[#1a1a2e] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500/50"
            />
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-2 mt-8">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 text-sm py-2.5 rounded-xl hover:text-slate-900 dark:text-white transition-colors"
            >
              Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex-1 bg-blue-600 text-white font-bold text-sm py-2.5 rounded-xl hover:bg-blue-500 transition-all"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white font-bold text-sm py-2.5 rounded-xl hover:bg-blue-500 transition-all disabled:opacity-50"
            >
              {loading ? "Saving..." : "Finish Setup"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

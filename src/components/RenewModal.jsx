import { useState, useContext } from "react";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { AuthContext } from "../context/AuthContext";
import { getShopId } from "../lib/shop";
import { supabase } from "../lib/supabase";
import { FiX, FiCheck, FiStar, FiShield } from "react-icons/fi";

const PLANS = [
  {
    id: "basic",
    label: "Basic",
    price: 500,
    desc: "Keeps your shop active for 30 days",
    features: [
      "Full dashboard access",
      "Sales & inventory tracking",
      "Social media management",
      "Basic reports",
    ],
  },
  {
    id: "pro",
    label: "Pro",
    price: 1000,
    desc: "Everything in Basic plus all Pro features",
    features: [
      "Custom website & storefront",
      "AI caption generator",
      "P&L reports & data export",
      "QR codes & marketing tools",
      "Website analytics",
      "M-Pesa reconciliation",
    ],
  },
];

function loadPaystack() {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) return resolve();
    const s = document.createElement("script");
    s.src = "https://js.paystack.co/v1/inline.js";
    s.onerror = () => reject(new Error("Failed to load payment script"));
    const timer = setTimeout(() => reject(new Error("Payment script timed out")), 15000);
    s.onload = () => { clearTimeout(timer); resolve(); };
    document.body.appendChild(s);
  });
}

export default function RenewModal({ onClose, subscriptionExpiresAt, onRenewed, defaultPlan }) {
  const trapRef = useFocusTrap(true);
  const { user } = useContext(AuthContext);
  const [step, setStep] = useState("plan");
  const [selectedPlan, setSelectedPlan] = useState(defaultPlan === "pro" ? "pro" : "basic");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const [now] = useState(() => Date.now());
  const currentExpiry = subscriptionExpiresAt
    ? new Date(subscriptionExpiresAt)
    : new Date(now);

  const plan = PLANS.find((p) => p.id === selectedPlan);

  const getNewExpiry = () => new Date(
    Math.max(currentExpiry.getTime(), now) + 30 * 86400000
  );

  const handlePay = async () => {
    setError(null);
    setProcessing(true);
    try {
      await loadPaystack();
      const shopId = await getShopId();
      if (!window.PaystackPop?.setup) throw new Error("Payment service unavailable");

      const payRef = `KEL-${shopId.slice(0, 8)}-${Date.now()}`;
      const payAmount = plan.price * 100;

      const handler = window.PaystackPop.setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        email: user?.email || "customer@keel.app",
        amount: payAmount,
        currency: "KES",
        ref: payRef,
        callback: function (response) {
          setProcessing(true);
          supabase.functions.invoke(
            "verify-paystack-subscription",
            { body: { reference: response.reference, shop_id: shopId } }
          ).then(({ data, error: fnError }) => {
            if (fnError) throw new Error(fnError.message);
            if (!data.success) throw new Error(data.error || "Verification failed");
            setStep("success");
          }).catch((e) => {
            setError(e.message);
          }).finally(() => {
            setProcessing(false);
          });
        },
        onClose: function () {
          setProcessing(false);
        },
      });
      handler.openIframe();
    } catch (e) {
      setError(e.message || "Something went wrong");
      setProcessing(false);
    }
  };

  const handleDone = () => {
    onRenewed?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60">
      <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-label="Renew subscription"
        className="bg-white dark:bg-[#16213e] rounded-2xl border border-gray-100 dark:border-white/10 p-6 w-full max-w-md mx-4 shadow-xl"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            {step === "plan" && "Renew Subscription"}
            {step === "pay" && "Complete Payment"}
            {step === "success" && "Payment Successful"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close"
          >
            <FiX size={16} className="text-gray-400" />
          </button>
        </div>

        {step === "plan" && (
          <div className="space-y-3">
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Choose a plan to renew your subscription for 30 days.
            </p>
            {PLANS.map((p) => {
              const isSelected = selectedPlan === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlan(p.id)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? "border-blue-500 bg-blue-50/50 dark:bg-blue-500/10 dark:border-blue-400"
                      : "border-gray-100 dark:border-white/10 hover:border-gray-200 dark:hover:border-white/20"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {p.id === "pro" ? (
                        <FiStar className="text-amber-500" size={16} />
                      ) : (
                        <FiShield className="text-blue-500" size={16} />
                      )}
                      <span className="font-semibold text-sm text-gray-900 dark:text-white">
                        {p.label}
                      </span>
                    </div>
                    <span className="font-bold text-base text-gray-900 dark:text-white">
                      KSh {p.price.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 ml-7">
                    {p.desc}
                  </p>
                  <ul className="mt-2 ml-7 space-y-0.5">
                    {p.features.map((f) => (
                      <li
                        key={f}
                        className={`text-xs flex items-center gap-1.5 ${
                          isSelected
                            ? "text-blue-700 dark:text-blue-300"
                            : "text-gray-500 dark:text-slate-400"
                        }`}
                      >
                        <FiCheck size={10} className="shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
            <button
              onClick={() => setStep("pay")}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25"
            >
              Continue
            </button>
          </div>
        )}

        {step === "pay" && (
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-slate-400">Plan</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {plan.label}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-slate-400">Duration</span>
                <span className="font-medium text-gray-900 dark:text-white">30 days</span>
              </div>
              <div className="border-t border-gray-200 dark:border-white/10 pt-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">Total</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  KSh {plan.price.toLocaleString()}
                </span>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-500 text-center">{error}</p>
            )}

            <button
              onClick={handlePay}
              disabled={processing}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25"
            >
              {processing ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing...
                </>
              ) : (
                `Pay KSh ${plan.price.toLocaleString()}`
              )}
            </button>

            <p className="text-xs text-center text-gray-400 dark:text-slate-500">
              Secure payment. Your information is encrypted.
            </p>
          </div>
        )}

        {step === "success" && (
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-green-100 dark:bg-green-500/10 flex items-center justify-center">
              <FiCheck className="text-green-500" size={26} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Subscription Renewed
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                Your subscription is now active until{" "}
                <span className="font-medium text-gray-700 dark:text-slate-300">
                  {getNewExpiry().toLocaleDateString("en-KE", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                .
              </p>
            </div>
            <button
              onClick={handleDone}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-sm transition-all shadow-lg shadow-blue-600/25"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

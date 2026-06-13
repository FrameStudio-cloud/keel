import { useState } from "react";
import { getCurrency } from "../lib/format";

export function IntaSendCheckout({
  amount,
  onSuccess,
  onFailure,
  onClose,
}) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currency = getCurrency();

  async function handleSubmit() {
    if (!phone || phone.length < 10) {
      setError("Enter a valid M-Pesa phone number");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "https://sandbox.intasend.com/api/v1/checkout/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount,
            phone_number: phone,
            api_key: import.meta.env.VITE_INTASEND_API_KEY || "",
          }),
        }
      );

      const data = await response.json();

      if (data.state === "COMPLETED" || data.invoice?.state === "COMPLETED") {
        onSuccess?.(data);
      } else {
        onFailure?.(data);
      }
    } catch (err) {
      setError("Payment failed. Please try again.");
      onFailure?.(err);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="inta-phone" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
          M-Pesa Phone Number
        </label>
        <input
          id="inta-phone"
          type="tel"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            setError("");
          }}
          placeholder="0712345678"
          className="w-full bg-slate-100 dark:bg-[#1a1a2e] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
        />
      </div>

      {error && <p className="text-red-400 text-xs" role="alert">{error}</p>}

      <div className="flex gap-2">
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Cancel payment"
            className="flex-1 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 text-sm py-2.5 rounded-xl hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.05] transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={loading}
          aria-label="Pay now"
          className="flex-1 bg-blue-600 text-white font-bold text-sm py-2.5 rounded-xl hover:bg-blue-500 transition-all disabled:opacity-50"
        >
          {loading ? "Processing..." : `Pay ${currency} ${amount?.toLocaleString()}`}
        </button>
      </div>
    </div>
  );
}

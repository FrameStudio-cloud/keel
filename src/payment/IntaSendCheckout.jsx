import { useState } from "react";

export function IntaSendCheckout({
  amount,
  onSuccess,
  onFailure,
  onClose,
}) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
        <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">
          M-Pesa Phone Number
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            setError("");
          }}
          placeholder="0712345678"
          className="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-blue-500/50"
        />
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}

      <div className="flex gap-2">
        {onClose && (
          <button
            onClick={onClose}
            className="flex-1 border border-[var(--border)] text-[var(--text-secondary)] text-sm py-2.5 rtext-[var(--text-primary)]hover:text-[var(--text-primary)] transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 bg-blue-600 text-white font-bold text-sm py-2.5 rounded-xl hover:bg-blue-500 transition-all disabled:opacity-50"
        >
          {loading ? "Processing..." : `Pay KSh ${amount?.toLocaleString()}`}
        </button>
      </div>
    </div>
  );
}

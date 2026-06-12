import { useSettings } from "../hooks/useSettings";
import { formatPrice } from "../lib/format";

export default function ReceiptModal({ sale, onClose }) {
  const { storeName, storePhone, storeAddress, receiptFooter } = useSettings();

  if (!sale) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 w-full max-w-sm mx-4"
        role="dialog"
        aria-modal="true"
        aria-label="Sale receipt"
      >
        <div className="text-center mb-5">
          <h2
            className="text-[var(--text-primary)] font-bold text-lg"
            style={{ fontFamily: "var(--font-display, inherit)" }}
          >
            {storeName || "Keel Shop"}
          </h2>
          {storePhone && (
            <p className="text-[var(--text-secondary)] text-xs">{storePhone}</p>
          )}
          {storeAddress && (
            <p className="text-[var(--text-secondary)] text-xs">{storeAddress}</p>
          )}
          <div className="w-12 h-0.5 bg-blue-500/30 mx-auto mt-3" />
        </div>

        <div className="text-sm space-y-2 mb-5">
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Item</span>
            <text-[var(--text-primary)]Name="text-[var(--text-primary)] font-semibold">{sale.product_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Quantity</spage)]     <span className="text-[var(--text-primary)]">{sale.quantity}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondarytext-[var(--text-primary)]t</span>
            <span className="text-[var(--text-primary)]">{sale.method}</span>
          </div>
          <div className="border-t border-[var(--border)] pt-2 mt-2">
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)] font-semibold">Total</span>
              <span
                className="text-blue-400 font-bold text-lg"
                style={{ fontFamily: "var(--font-display, inherit)" }}
              >
                {formatPrice(sale.amount)}
              </span>
            </div>
          </div>
        </div>

        {receiptFooter && (
          <p className="text-center text-xs text-[var(--text-muted)] mb-4">
            {receiptFooter}
          </p>
        )}

        <button
          onClick={onClose}
          className="w-full border border-[var(--bordertext-[var(--text-primary)]ar(--text-secondary)] text-sm py-2.5 rounded-xl hover:text-[var(--text-primary)] transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

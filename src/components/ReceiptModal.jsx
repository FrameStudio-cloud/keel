import { useSettings } from "../hooks/useSettings";
import { formatPrice } from "../lib/format";

export default function ReceiptModal({ sale, onClose }) {
  const { storeName, storePhone, storeAddress, receiptFooter } = useSettings();

  if (!sale) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="bg-white dark:bg-[#16213e] border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-sm mx-4"
        role="dialog"
        aria-modal="true"
        aria-label="Sale receipt"
      >
        <div className="text-center mb-5">
          <h2
            className="text-slate-900 dark:text-white font-bold text-lg"
            style={{ fontFamily: "inherit" }}
          >
            {storeName || "Keel Shop"}
          </h2>
          {storePhone && (
            <p className="text-slate-600 dark:text-slate-400 text-xs">{storePhone}</p>
          )}
          {storeAddress && (
            <p className="text-slate-600 dark:text-slate-400 text-xs">{storeAddress}</p>
          )}
          <div className="w-12 h-0.5 bg-blue-500/30 mx-auto mt-3" />
        </div>

        <div className="text-sm space-y-2 mb-5">
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Item</span>
            <span className="text-slate-900 dark:text-white font-semibold">{sale.product_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Quantity</span>
            <span className="text-slate-900 dark:text-white">{sale.quantity}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Method</span>
            <span className="text-slate-900 dark:text-white">{sale.method}</span>
          </div>
          <div className="border-t border-slate-200 dark:border-white/10 pt-2 mt-2">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400 font-semibold">Total</span>
              <span
                className="text-blue-400 font-bold text-lg"
                style={{ fontFamily: "inherit" }}
              >
                {formatPrice(sale.amount)}
              </span>
            </div>
          </div>
        </div>

        {receiptFooter && (
          <p className="text-center text-xs text-slate-400 dark:text-slate-500 mb-4">
            {receiptFooter}
          </p>
        )}

        <button
          onClick={onClose}
          className="w-full border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 text-sm py-2.5 rounded-xl hover:text-slate-900 dark:text-white transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

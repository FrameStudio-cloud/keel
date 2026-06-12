import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useSettings } from "../hooks/useSettings";

export default function StockAdjustModal({ product, onClose, onAdjusted }) {
  const [change, setChange] = useState(0);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const { lowStockThreshold } = useSettings();

  const newStock = product.stock + change;

  async function handleSubmit() {
    if (change === 0 || !reason) return;
    setLoading(true);

    const { error } = await supabase.from("stock_movements").insert({
      product_id: product.id,
      product_name: product.name,
      change,
      reason,
    });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("products")
      .update({ stock: newStock })
      .eq("id", product.id);

    if (updateError) {
      console.error(updateError);
    } else {
      onAdjusted();
      onClose();
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 w-full max-w-md mx-4"
        role="dialog"
        aria-modal="true"
        aria-label="Adjust stock"
      >
        <div className="flex items-center justify-between mb-5">
          <h2
            className="text-[var(--text-primary)] font-bold text-sm"
            style={{ fontFamily: "var(--font-display, inherit)" }}
          >
            Adjust Stock
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)]hover:text-[var(--text-primary)] text-lg"
          >
            âœ•
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-secondary)]">{product.name}</spage)]     <span className="text-[var(--text-primary)] font-semibold">
              Current: {product.stock}
            </span>
          </div>

          {newStock < lowStockThreshold && newStock >= 0 && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2 text-xs text-blue-300">
              New stock ({newStock}) will be below the low stock threshold (
              {lowStockThreshold})
            </div>
          )}

          {newStock < 0 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-xs text-red-400">
              Stock cannot go below 0
            </div>
          )}

          <div>
            <label className="text-xs text-[var(--text-secondary)] mb-1 block">
              Change (+/-)
            </label>
            <input
              type="number"
              value={change}
              onChange={(e) => setChange(parseInt(e.target.value) || 0)}
              className="w-full bg-[var(--bg-page)] border bordertext-[var(--text-primary)]rder)] rounded-xl px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500/50"
              placeholder="e.g. -2 or +5"
            />
          </div>

          <div>
            <label className="text-xs text-[var(--text-secondary)] mb-1 block">Reason</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-[var(--bg-pagetext-[var(--text-primary)]border-[var(--border)] rounded-xl px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500/50"
              placeholder="e.g. Damaged, restock, return"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button
            onClick={onClose}
            className="flex-1 border border)]border)] text-[var(--text-secondary)] text-sm py-2.5 rounded-xl hover:text-[var(--text-primary)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || change === 0 || !reason || newStock < 0}
            className="flex-1 bg-blue-600 text-white font-bold text-sm py-2.5 rounded-xl hover:bg-blue-500 transition-all disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

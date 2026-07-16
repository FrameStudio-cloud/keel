import { useState } from "react";
import { getShopId, withShop } from "../lib/shop";
import { supabase } from "../lib/supabase";
import { useSettings } from "../hooks/useSettings";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { FiX } from "react-icons/fi";

export default function StockAdjustModal({ product, onClose, onAdjusted }) {
  const trapRef = useFocusTrap(true);
  const [change, setChange] = useState(0);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const { lowStockThreshold } = useSettings();

  const newStock = product.stock + change;

  async function handleSubmit() {
    if (change === 0 || !reason) return;
    const shopId = await getShopId();
    setLoading(true);

    const { error } = await supabase.from("stock_movements").insert(withShop({
      product_id: product.id,
      product_name: product.name,
      change,
      reason,
    }));

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("products")
      .update({ stock: newStock })
      .eq("id", product.id)
      .eq("shop_id", shopId);

    if (updateError) {
      console.error(updateError);
    } else {
      onAdjusted();
      if (newStock < lowStockThreshold && newStock >= 0) {
        supabase.functions.invoke("send-low-stock-alert", {
          body: { shop_id: shopId, product_id: product.id, product_name: product.name, current_stock: newStock, threshold: lowStockThreshold },
        }).catch((e) => console.error("low stock alert failed", e));
      }
      onClose();
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        ref={trapRef}
        className="bg-white dark:bg-[#16213e] border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-md mx-4"
        role="dialog"
        aria-modal="true"
        aria-label="Adjust stock"
      >
        <div className="flex items-center justify-between mb-5">
          <h2
            className="text-slate-900 dark:text-white font-bold text-sm"
            style={{ fontFamily: "inherit" }}
          >
            Adjust Stock
          </h2>
          <button
            onClick={onClose}
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white"
          >
            <FiX size={16} />
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">{product.name}</span>
            <span className="text-slate-900 dark:text-white font-semibold">
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
            <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">
              Change (+/-)
            </label>
            <input
              type="number"
              value={change}
              onChange={(e) => setChange(parseInt(e.target.value) || 0)}
              className="w-full bg-slate-100 dark:bg-[#1a1a2e] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500/50"
              placeholder="e.g. -2 or +5"
            />
          </div>

          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">Reason</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-100 dark:bg-[#1a1a2e] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500/50"
              placeholder="e.g. Damaged, restock, return"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button
            onClick={onClose}
            className="flex-1 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 text-sm py-2.5 rounded-xl hover:text-slate-900 dark:text-white transition-colors"
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

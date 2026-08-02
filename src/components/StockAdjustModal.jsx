import { useState } from "react";
import { getShopId } from "../lib/shop";
import { useSettings } from "../hooks/useSettings";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { enqueueWrite } from "../lib/writeQueue";
import { FiX } from "react-icons/fi";

export default function StockAdjustModal({ product, onClose, onAdjusted }) {
  const trapRef = useFocusTrap(true);
  const [change, setChange] = useState(0);
  const [reason, setReason] = useState("");
  const { lowStockThreshold } = useSettings();

  const newStock = product.stock + change;

  async function handleSubmit() {
    if (change === 0 || !reason) return;
    if (newStock < 0) return;

    const shopId = await getShopId();
    const lowStockAlert =
      newStock < lowStockThreshold && newStock >= 0
        ? { shop_id: shopId, product_id: product.id, product_name: product.name, current_stock: newStock, threshold: lowStockThreshold }
        : null;

    onAdjusted();
    onClose();

    enqueueWrite({
      type: "adjustStock",
      shopId,
      payload: {
        movement: { product_id: product.id, product_name: product.name, change, reason },
        stockUpdate: { productId: product.id, newStock, lowStockAlert },
      },
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        ref={trapRef}
        className="bg-surface-1 border border-border-subtle rounded-2xl p-6 w-full max-w-md mx-4"
        role="dialog"
        aria-modal="true"
        aria-label="Adjust stock"
      >
        <div className="flex items-center justify-between mb-5">
          <h2
            className="text-text-primary font-bold text-sm"
            style={{ fontFamily: "inherit" }}
          >
            Adjust Stock
          </h2>
          <button
            onClick={onClose}
            className="text-text-body hover:text-text-primary"
          >
            <FiX size={16} />
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-text-body">{product.name}</span>
            <span className="text-text-primary font-semibold">
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
            <div className="bg-danger-muted border border-danger rounded-lg px-3 py-2 text-xs text-danger">
              Stock cannot go below 0
            </div>
          )}

          <div>
            <label className="text-xs text-text-body mb-1 block">
              Change (+/-)
            </label>
            <input
              type="number"
              value={change}
              onChange={(e) => setChange(parseInt(e.target.value) || 0)}
              className="w-full bg-surface-2 border border-border-subtle rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand/50"
              placeholder="e.g. -2 or +5"
            />
          </div>

          <div>
            <label className="text-xs text-text-body mb-1 block">Reason</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-surface-2 border border-border-subtle rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand/50"
              placeholder="e.g. Damaged, restock, return"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button
            onClick={onClose}
            className="flex-1 border border-border-subtle text-text-body text-sm py-2.5 rounded-xl hover:text-text-primary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={change === 0 || !reason || newStock < 0}
            className="flex-1 bg-brand text-white font-bold text-sm py-2.5 rounded-xl hover:bg-brand-soft transition-all disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

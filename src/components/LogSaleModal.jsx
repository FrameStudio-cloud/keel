/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { FiX, FiCamera, FiSearch, FiCheck } from "react-icons/fi";
import { supabase } from "../lib/supabase";
import { getShopId } from "../lib/shop";
import { getPaymentMethods, getDefaultPayment } from "../lib/paymentConfig";
import { formatPrice } from "../lib/format";
import { useSettings } from "../hooks/useSettings";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { enqueueWrite } from "../lib/writeQueue";
import { track } from "../lib/posthog";
import BarcodeScanner from "./BarcodeScanner";

export default function LogSaleModal({ onClose, onAdded }) {
  const trapRef = useFocusTrap(true);
  const { businessCategory, lowStockThreshold } = useSettings();
  const showBarcode = businessCategory === "electricals" || businessCategory === "electronics";

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    product_id: "",
    quantity: 1,
    method: getDefaultPayment(),
    mpesa_code: "",
  });
  const [error, setError] = useState("");
  const [showScanner, setShowScanner] = useState(false);

  async function fetchProducts() {
    const shopId = await getShopId();
    const { data } = await supabase.from("products").select("*").eq("shop_id", shopId).order("name").limit(200);
    setProducts(data || []);
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  const selectedProduct = products.find((p) => p.id === form.product_id);
  const total = selectedProduct ? selectedProduct.price * form.quantity : 0;

  async function handleSubmit() {
    if (!form.product_id || !form.quantity) return;
    if (selectedProduct.stock < form.quantity) {
      setError("Not enough stock");
      return;
    }

    const shopId = await getShopId();
    const newStock = selectedProduct.stock - parseInt(form.quantity);
    const lowStockAlert =
      newStock < lowStockThreshold && newStock >= 0
        ? { shop_id: shopId, product_id: selectedProduct.id, product_name: selectedProduct.name, current_stock: newStock, threshold: lowStockThreshold }
        : null;

    onAdded();
    onClose();

    track("log_sale", {
      amount: total,
      quantity: parseInt(form.quantity),
      method: form.method,
      product_name: selectedProduct.name,
    });

    enqueueWrite({
      type: "logSale",
      shopId,
      payload: {
        sale: {
          product_id: selectedProduct.id,
          product_name: selectedProduct.name,
          amount: total,
          quantity: parseInt(form.quantity),
          method: form.method,
          mpesa_code: form.mpesa_code || null,
        },
        stockUpdate: { productId: selectedProduct.id, newStock, lowStockAlert },
      },
    });
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div
        ref={trapRef}
        className="bg-surface-1 rounded-2xl border border-border-subtle p-6 w-full max-w-md mx-4"
        role="dialog"
        aria-modal="true"
        aria-label="Log a sale"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-medium text-text-primary">Log a sale</h2>
          <button
            onClick={onClose}
            className="text-text-faint hover:text-text-body text-lg"
            aria-label="Close"
          >
            <FiX />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-text-faint mb-1 block">Product</label>
            <div className="relative">
              <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setForm((prev) => ({ ...prev, product_id: "" })); }}
                placeholder={showBarcode ? "Search by name or scan barcode..." : "Search by name..."}
                className="w-full border border-border-subtle rounded-lg pl-9 pr-9 py-2 text-sm bg-surface-1 text-text-primary focus:outline-none focus:border-brand"
              />
              {showBarcode && (
                <button
                  type="button"
                  onClick={() => setShowScanner(true)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-text-faint hover:text-brand transition-colors"
                  title="Scan barcode"
                >
                  <FiCamera size={16} />
                </button>
              )}
            </div>
            {showScanner && (
              <BarcodeScanner
                onScan={(code) => {
                  const match = products.find(
                    (p) => p.barcode && p.barcode.toLowerCase() === code.toLowerCase()
                  );
                  if (match) {
                    setForm((prev) => ({ ...prev, product_id: match.id }));
                    setSearch(`${match.name} — ${formatPrice(match.price)} (stock: ${match.stock})`);
                  } else {
                    setError("No product found with this barcode");
                  }
                  setShowScanner(false);
                }}
                onClose={() => setShowScanner(false)}
              />
            )}
            <div className="relative mt-2">
              {search && !form.product_id && (
                <div className="absolute z-10 w-full bg-surface-1 border border-border-subtle rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {(() => {
                    const q = search.toLowerCase();
                    const filtered = products.filter((p) =>
                      !q ||
                      p.name.toLowerCase().includes(q) ||
                      (showBarcode && p.barcode && p.barcode.toLowerCase().includes(q))
                    );
                    return filtered.length === 0 ? (
                      <div className="px-3 py-2 text-xs text-text-faint">No products found</div>
                    ) : (
                      filtered.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setForm((prev) => ({ ...prev, product_id: p.id }));
                            setSearch(`${p.name} — ${formatPrice(p.price)} (stock: ${p.stock})`);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-text-body hover:bg-surface-2 transition-colors flex items-center justify-between"
                        >
                          <span>{p.name}</span>
                          <span className="text-xs text-text-faint">{formatPrice(p.price)} · stock: {p.stock}</span>
                        </button>
                      ))
                    );
                  })()}
                </div>
              )}
            </div>
            {form.product_id && selectedProduct && (
              <div className="mt-2 flex items-center gap-2 text-xs text-success">
                <FiCheck size={14} />
                {selectedProduct.name} — {formatPrice(selectedProduct.price)}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-text-faint mb-1 block">
                Quantity
              </label>
              <input
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                type="number"
                min="1"
                className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm bg-surface-1 text-text-primary focus:outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="text-xs text-text-faint mb-1 block">
                Payment method
              </label>
              <select
                name="method"
                value={form.method}
                onChange={handleChange}
                className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm bg-surface-1 text-text-primary focus:outline-none focus:border-brand"
              >
                {getPaymentMethods().map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {form.method === "M-Pesa" && (
            <div>
              <label className="text-xs text-text-faint mb-1 block">M-Pesa Receipt Code (optional)</label>
              <input
                name="mpesa_code"
                value={form.mpesa_code}
                onChange={handleChange}
                placeholder="e.g. SDF34JKL"
                className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm bg-surface-1 text-text-primary focus:outline-none focus:border-brand font-mono"
              />
            </div>
          )}

          {selectedProduct && (
            <div className="bg-brand-muted rounded-lg px-4 py-3 flex justify-between items-center">
              <span className="text-xs text-brand">Total</span>
              <span className="text-sm font-medium text-brand">
                {formatPrice(total)}
              </span>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-danger-muted border border-danger rounded-lg px-3 py-2 text-xs text-danger">
            {error}
          </div>
        )}

        <div className="flex gap-2 mt-5">
          <button
            onClick={onClose}
            className="flex-1 border border-border-subtle text-text-muted text-sm py-2 rounded-lg hover:bg-surface-2 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 bg-brand text-white text-sm py-2 rounded-lg hover:bg-brand-strong transition-all"
          >
            Log sale
          </button>
        </div>
      </div>
    </div>
  );
}

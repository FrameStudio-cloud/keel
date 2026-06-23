/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { FiX, FiCamera, FiSearch } from "react-icons/fi";
import { getShopId, withShop } from "../lib/shop";
import { supabase } from "../lib/supabase";
import { getPaymentMethods, getDefaultPayment } from "../lib/paymentConfig";
import { formatPrice } from "../lib/format";
import { useSettings } from "../hooks/useSettings";
import { useFocusTrap } from "../hooks/useFocusTrap";
import BarcodeScanner from "./BarcodeScanner";

export default function LogSaleModal({ onClose, onAdded }) {
  const trapRef = useFocusTrap(true);
  const { businessCategory } = useSettings();
  const showBarcode = businessCategory === "electricals" || businessCategory === "electronics";

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    product_id: "",
    quantity: 1,
    method: getDefaultPayment(),
  });
  const [loading, setLoading] = useState(false);
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

    setLoading(true);

    // 1 — insert the sale
    const { data: saleData, error: saleError } = await supabase.from("sales").insert(withShop({
      product_id: selectedProduct.id,
      product_name: selectedProduct.name,
      amount: total,
      quantity: parseInt(form.quantity),
      method: form.method,
    })).select("id").single();

    if (saleError) {
      console.error(saleError);
      setLoading(false);
      return;
    }

    // 2 — reduce the stock
    const shopId = await getShopId();
    const { error: stockError } = await supabase
      .from("products")
      .update({ stock: selectedProduct.stock - parseInt(form.quantity) })
      .eq("id", selectedProduct.id)
      .eq("shop_id", shopId);

    if (stockError) {
      console.error(stockError);
      await supabase.from("sales").delete().eq("id", saleData.id);
    } else {
      onAdded();
      onClose();
    }

    setLoading(false);
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div
        ref={trapRef}
        className="bg-white dark:bg-[#16213e] rounded-2xl border border-gray-100 dark:border-white/10 p-6 w-full max-w-md mx-4"
        role="dialog"
        aria-modal="true"
        aria-label="Log a sale"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-medium text-gray-800 dark:text-white">Log a sale</h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-slate-500 hover:text-gray-600 text-lg"
            aria-label="Close"
          >
            <FiX />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-gray-400 dark:text-slate-500 mb-1 block">Product</label>
            <div className="relative mb-2">
              <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={showBarcode ? "Search by name or scan barcode..." : "Search by name..."}
                className="w-full border border-gray-200 dark:border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm bg-white dark:bg-[#1a1a2e] text-gray-800 dark:text-white focus:outline-none focus:border-blue-400"
              />
              {showBarcode && (
                <button
                  type="button"
                  onClick={() => setShowScanner(true)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
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
                  } else {
                    setError("No product found with this barcode");
                  }
                  setShowScanner(false);
                }}
                onClose={() => setShowScanner(false)}
              />
            )}
            <select
              name="product_id"
              value={form.product_id}
              onChange={handleChange}
              className="w-full border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#1a1a2e] text-gray-800 dark:text-white focus:outline-none focus:border-blue-400"
            >
              <option value="">Select a product</option>
              {products
                .filter((p) => {
                  const q = search.toLowerCase();
                  return (
                    !q ||
                    p.name.toLowerCase().includes(q) ||
                    (showBarcode && p.barcode && p.barcode.toLowerCase().includes(q))
                  );
                })
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {formatPrice(p.price)} (stock: {p.stock})
                    {showBarcode && p.barcode ? ` [${p.barcode}]` : ""}
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 dark:text-slate-500 mb-1 block">
                Quantity
              </label>
              <input
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                type="number"
                min="1"
                className="w-full border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#1a1a2e] text-gray-800 dark:text-white focus:outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 dark:text-slate-500 mb-1 block">
                Payment method
              </label>
              <select
                name="method"
                value={form.method}
                onChange={handleChange}
                className="w-full border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#1a1a2e] text-gray-800 dark:text-white focus:outline-none focus:border-blue-400"
              >
                {getPaymentMethods().map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {selectedProduct && (
            <div className="bg-blue-50 dark:bg-blue-500/10 rounded-lg px-4 py-3 flex justify-between items-center">
              <span className="text-xs text-blue-500">Total</span>
              <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                {formatPrice(total)}
              </span>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg px-3 py-2 text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="flex gap-2 mt-5">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-slate-400 text-sm py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white text-sm py-2 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            {loading ? "Saving..." : "Log sale"}
          </button>
        </div>
      </div>
    </div>
  );
}

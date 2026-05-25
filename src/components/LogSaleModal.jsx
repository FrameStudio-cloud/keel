import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function LogSaleModal({ onClose, onAdded }) {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    product_id: "",
    quantity: 1,
    method: "Cash",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const { data } = await supabase.from("products").select("*").order("name");
    setProducts(data || []);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  const selectedProduct = products.find((p) => p.id === form.product_id);
  const total = selectedProduct ? selectedProduct.price * form.quantity : 0;

  async function handleSubmit() {
    if (!form.product_id || !form.quantity) return;
    if (selectedProduct.stock < form.quantity) {
      alert("Not enough stock");
      return;
    }

    setLoading(true);

    // 1 — insert the sale
    const { error: saleError } = await supabase.from("sales").insert({
      product_id: selectedProduct.id,
      product_name: selectedProduct.name,
      amount: total,
      quantity: parseInt(form.quantity),
      method: form.method,
    });

    if (saleError) {
      console.error(saleError);
      setLoading(false);
      return;
    }

    // 2 — reduce the stock
    const { error: stockError } = await supabase
      .from("products")
      .update({ stock: selectedProduct.stock - parseInt(form.quantity) })
      .eq("id", selectedProduct.id);

    if (stockError) {
      console.error(stockError);
    } else {
      onAdded();
      onClose();
    }

    setLoading(false);
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-medium text-gray-800">Log a sale</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Product</label>
            <select
              name="product_id"
              value={form.product_id}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
            >
              <option value="">Select a product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — KSh {p.price.toLocaleString()} (stock: {p.stock})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">
                Quantity
              </label>
              <input
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                type="number"
                min="1"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">
                Payment method
              </label>
              <select
                name="method"
                value={form.method}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              >
                <option>Cash</option>
                <option>M-Pesa</option>
              </select>
            </div>
          </div>

          {selectedProduct && (
            <div className="bg-blue-50 rounded-lg px-4 py-3 flex justify-between items-center">
              <span className="text-xs text-blue-500">Total</span>
              <span className="text-sm font-medium text-blue-700">
                KSh {total.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-5">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-500 text-sm py-2 rounded-lg hover:bg-gray-50 transition-all"
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

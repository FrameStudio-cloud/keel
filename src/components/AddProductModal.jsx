import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function AddProductModal({ onClose, onAdded }) {
  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
  });
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit() {
    if (!form.name || !form.category || !form.price || !form.stock) return;

    setLoading(true);

    const { error } = await supabase.from("products").insert({
      name: form.name,
      category: form.category,
      price: parseInt(form.price),
      stock: parseInt(form.stock),
    });

    if (error) {
      console.error(error);
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
          <h2 className="text-sm font-medium text-gray-800">Add product</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">
              Product name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. iPhone 15 case"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Category</label>
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="e.g. Cases"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">
                Price (KSh)
              </label>
              <input
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="350"
                type="number"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">
                Stock quantity
              </label>
              <input
                name="stock"
                value={form.stock}
                onChange={handleChange}
                placeholder="10"
                type="number"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>
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
            {loading ? "Saving..." : "Add product"}
          </button>
        </div>
      </div>
    </div>
  );
}

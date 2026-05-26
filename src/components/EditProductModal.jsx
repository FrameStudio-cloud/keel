import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function EditProductModal({ product, onClose, onUpdated }) {
  const [form, setForm] = useState({
    name: product.name,
    category: product.category,
    price: product.price,
    stock: product.stock,
  });
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleUpdate() {
    setLoading(true);
    const { error } = await supabase
      .from("products")
      .update({
        name: form.name,
        category: form.category,
        price: parseInt(form.price),
        stock: parseInt(form.stock),
      })
      .eq("id", product.id);

    if (error) {
      console.error(error);
    } else {
      onUpdated();
      onClose();
    }
    setLoading(false);
  }

  async function handleDelete() {
    setLoading(true);
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);

    if (error) {
      console.error(error);
    } else {
      onUpdated();
      onClose();
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-medium text-gray-800">Edit product</h2>
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
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Category</label>
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
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
                type="number"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>

          {confirmDelete && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-600">
              Are you sure? This will permanently delete{" "}
              <strong>{product.name}</strong>.
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-5">
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex-1 border border-red-200 text-red-500 text-sm py-2 rounded-lg hover:bg-red-50 transition-all"
            >
              Delete
            </button>
          ) : (
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 bg-red-500 text-white text-sm py-2 rounded-lg hover:bg-red-600 transition-all disabled:opacity-50"
            >
              {loading ? "Deleting..." : "Confirm delete"}
            </button>
          )}
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white text-sm py-2 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

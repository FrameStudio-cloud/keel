import { useState } from "react";
import { FiX, FiCamera } from "react-icons/fi";
import { getShopId, withShop } from "../lib/shop";
import { supabase } from "../lib/supabase";
import { uploadImage } from "../lib/storage";
import { useSettings } from "../hooks/useSettings";
import ImageUploader from "./ImageUploader";
import BarcodeScanner from "./BarcodeScanner";

export default function AddProductModal({ onClose, onAdded }) {
  const { businessCategory } = useSettings();
  const showBarcode = businessCategory === "electricals" || businessCategory === "electronics";

  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    barcode: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [existingProduct, setExistingProduct] = useState(null);
  const [showScanner, setShowScanner] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (existingProduct) setExistingProduct(null);
  }

  async function handleSubmit() {
    if (!form.name || !form.category || !form.price || !form.stock) return;

    setLoading(true);

    const shopId = await getShopId();

    const { data: matches } = await supabase
      .from("products")
      .select("*")
      .eq("shop_id", shopId)
      .ilike("name", form.name);

    if (matches && matches.length > 0) {
      setExistingProduct(matches[0]);
      setLoading(false);
      return;
    }

    let image = null;
    if (imageFile) {
      try {
        image = await uploadImage(imageFile, shopId);
      } catch (err) {
        console.error("Upload failed:", err);
      }
    }

    const payload = {
      name: form.name,
      category: form.category,
      price: parseInt(form.price),
      stock: parseInt(form.stock),
      image,
    };
    if (showBarcode && form.barcode) payload.barcode = form.barcode;

    const { error } = await supabase.from("products").insert(withShop(payload));

    if (error) {
      console.error(error);
    } else {
      onAdded();
      onClose();
    }

    setLoading(false);
  }

  async function handleUpdate() {
    const shopId = await getShopId();
    setLoading(true);

    let image = existingProduct.image;
    if (imageFile) {
      try {
        image = await uploadImage(imageFile, shopId);
      } catch (err) {
        console.error("Upload failed:", err);
      }
    }

    const { error } = await supabase
      .from("products")
      .update({
        stock: parseInt(form.stock),
        price: parseInt(form.price),
        image,
      })
      .eq("id", existingProduct.id)
      .eq("shop_id", shopId);

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
      <div
        className="bg-white dark:bg-[#16213e] rounded-2xl border border-gray-100 dark:border-white/10 p-6 w-full max-w-md mx-4"
        role="dialog"
        aria-modal="true"
        aria-label="Add product"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-medium text-gray-800 dark:text-white">Add product</h2>
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
            <label className="text-xs text-gray-400 dark:text-slate-500 mb-1 block">
              Product name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. iPhone 15 case"
              className="w-full border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#1a1a2e] text-gray-800 dark:text-white focus:outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 dark:text-slate-500 mb-1 block">Category</label>
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="e.g. Cases"
              className="w-full border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#1a1a2e] text-gray-800 dark:text-white focus:outline-none focus:border-blue-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 dark:text-slate-500 mb-1 block">
                Price (KSh)
              </label>
              <input
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="350"
                type="number"
                className="w-full border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#1a1a2e] text-gray-800 dark:text-white focus:outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 dark:text-slate-500 mb-1 block">
                Stock quantity
              </label>
              <input
                name="stock"
                value={form.stock}
                onChange={handleChange}
                placeholder="10"
                type="number"
                className="w-full border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#1a1a2e] text-gray-800 dark:text-white focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>

          {showBarcode && (
            <div>
              <label className="text-xs text-gray-400 dark:text-slate-500 mb-1 block">
                Barcode
              </label>
              <div className="flex gap-2">
                <input
                  name="barcode"
                  value={form.barcode}
                  onChange={handleChange}
                  placeholder="Scan or type barcode"
                  className="flex-1 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#1a1a2e] text-gray-800 dark:text-white focus:outline-none focus:border-blue-400 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowScanner(true)}
                  className="flex items-center gap-1.5 px-3 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-slate-400 text-xs rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-all"
                >
                  <FiCamera size={14} />
                  Scan
                </button>
              </div>
            </div>
          )}

          <ImageUploader
            currentImage={existingProduct?.image}
            onImageChange={setImageFile}
          />

          {showScanner && (
            <BarcodeScanner
              onScan={(code) => {
                setForm((prev) => ({ ...prev, barcode: code }));
                setShowScanner(false);
              }}
              onClose={() => setShowScanner(false)}
            />
          )}

          {existingProduct && (
            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
              <p className="font-medium mb-1">
                "{existingProduct.name}" already exists
              </p>
              <p>
                Current stock: {existingProduct.stock} &nbsp;·&nbsp; Price: KSh{" "}
                {existingProduct.price.toLocaleString()}
              </p>
              <p className="mt-1 text-amber-500 dark:text-amber-400">
                Your new stock and price values will replace these.
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-5">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-slate-400 text-sm py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={existingProduct ? handleUpdate : handleSubmit}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white text-sm py-2 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            {loading
              ? "Saving..."
              : existingProduct
                ? "Update product"
                : "Add product"}
          </button>
        </div>
      </div>
    </div>
  );
}

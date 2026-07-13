/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { FiX, FiCamera } from "react-icons/fi";
import { getShopId, withShop } from "../lib/shop";
import { supabase } from "../lib/supabase";
import { uploadImage } from "../lib/storage";
import { useSettings } from "../hooks/useSettings";
import { formatPrice } from "../lib/format";
import ImageUploader from "./ImageUploader";
import { useFocusTrap } from "../hooks/useFocusTrap";
import BarcodeScanner from "./BarcodeScanner";

export default function AddProductModal({ onClose, onAdded }) {
  const trapRef = useFocusTrap(true);
  const { businessCategory } = useSettings();
  const showBarcode = businessCategory === "electricals" || businessCategory === "electronics";

  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    cost_price: "",
    stock: "",
    barcode: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [existingProduct, setExistingProduct] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [attributes, setAttributes] = useState([]);
  const [attributeValues, setAttributeValues] = useState({});
  const [customAttrValues, setCustomAttrValues] = useState({});

  async function fetchAttributes() {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", businessCategory)
      .single();
    if (!cat) return;
    const { data } = await supabase
      .from("category_attributes")
      .select("id, name, type, options, required, sort_order")
      .eq("category_id", cat.id)
      .order("sort_order");
    if (data) setAttributes(data);
  }

  useEffect(() => {
    fetchAttributes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessCategory]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (existingProduct) setExistingProduct(null);
  }

  function handleAttrChange(attrId, value) {
    setAttributeValues((prev) => ({ ...prev, [attrId]: value }));
  }

  async function handleSubmit() {
    if (!form.name || !form.category || !form.price || !form.stock) return;

    const missingRequired = attributes.some(
      (a) => a.required && !attributeValues[a.id]?.trim()
    );
    if (missingRequired) return;

    setLoading(true);

    const shopId = await getShopId();

    const { data: matches } = await supabase
      .from("products")
      .select("*")
      .eq("shop_id", shopId)
      .eq("name", form.name);

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
      cost_price: parseInt(form.cost_price) || 0,
      stock: parseInt(form.stock),
      image,
    };
    if (showBarcode && form.barcode) payload.barcode = form.barcode;

    const { data: newProduct, error } = await supabase
      .from("products")
      .insert(withShop(payload))
      .select()
      .single();

    if (error) {
      console.error(error);
    } else if (newProduct) {
      const attrEntries = Object.entries(attributeValues).filter(
        (entry) => entry[1].trim()
      ).map(([attrId, val]) => ({
          product_id: newProduct.id,
          attribute_id: attrId,
          value: val === "__other__" ? (customAttrValues[attrId] || "") : val,
          shop_id: shopId,
        }));
      if (attrEntries.length > 0) {
        await supabase.from("product_attribute_values").insert(attrEntries);
      }
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
        cost_price: parseInt(form.cost_price) || 0,
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
        ref={trapRef}
        className="bg-white dark:bg-[#16213e] rounded-2xl border border-gray-100 dark:border-white/10 p-6 w-full max-w-md mx-4 max-h-[85vh] overflow-y-auto"
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
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-400 dark:text-slate-500 mb-1 block">
                Price
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
                Cost price
              </label>
              <input
                name="cost_price"
                value={form.cost_price}
                onChange={handleChange}
                placeholder="200"
                type="number"
                className="w-full border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#1a1a2e] text-gray-800 dark:text-white focus:outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 dark:text-slate-500 mb-1 block">
                Stock
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

          {attributes.length > 0 && (
            <div className="border-t border-gray-100 dark:border-white/10 pt-3">
              <p className="text-xs text-gray-400 dark:text-slate-500 mb-3 font-medium">
                Variant attributes
              </p>
              <div className="flex flex-col gap-3">
                {attributes.map((attr) => (
                  <div key={attr.id}>
                    <label className="text-xs text-gray-400 dark:text-slate-500 mb-1 block">
                      {attr.name}
                      {attr.required && <span className="text-red-400 ml-0.5">*</span>}
                    </label>
                    {attr.type === "select" && attr.options ? (
                      <div>
                        <select
                          value={attributeValues[attr.id] || ""}
                          onChange={(e) => { handleAttrChange(attr.id, e.target.value); if (e.target.value !== "__other__") setCustomAttrValues((prev) => ({ ...prev, [attr.id]: "" })); }}
                          className="w-full border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#1a1a2e] text-gray-800 dark:text-white focus:outline-none focus:border-blue-400"
                        >
                          <option value="">{attr.required ? `Select ${attr.name.toLowerCase()}` : "Optional"}</option>
                          {attr.options.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                          <option value="__other__">Other</option>
                        </select>
                        {attributeValues[attr.id] === "__other__" && (
                          <input
                            value={customAttrValues[attr.id] || ""}
                            onChange={(e) => setCustomAttrValues((prev) => ({ ...prev, [attr.id]: e.target.value }))}
                            placeholder={`Type custom ${attr.name.toLowerCase()}`}
                            className="w-full border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#1a1a2e] text-gray-800 dark:text-white focus:outline-none focus:border-blue-400 mt-2"
                            autoFocus
                          />
                        )}
                      </div>
                    ) : (
                      <input
                        value={attributeValues[attr.id] || ""}
                        onChange={(e) => handleAttrChange(attr.id, e.target.value)}
                        type={attr.type === "number" ? "number" : "text"}
                        placeholder={`Enter ${attr.name.toLowerCase()}`}
                        className="w-full border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#1a1a2e] text-gray-800 dark:text-white focus:outline-none focus:border-blue-400"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

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
                Current stock: {existingProduct.stock} &nbsp;·&nbsp; Price:{" "}
                {formatPrice(existingProduct.price)}
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

/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { FiX, FiCamera } from "react-icons/fi";
import { getShopId } from "../lib/shop";
import { supabase } from "../lib/supabase";
import { uploadImage, deleteImage } from "../lib/storage";
import { useSettings } from "../hooks/useSettings";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { enqueueWrite } from "../lib/writeQueue";
import ImageUploader from "./ImageUploader";
import BarcodeScanner from "./BarcodeScanner";

export default function EditProductModal({ product, onClose, onUpdated }) {
  const trapRef = useFocusTrap(true);
  const { businessCategory } = useSettings();
  const showBarcode = businessCategory === "electricals" || businessCategory === "electronics";

  const [form, setForm] = useState({
    name: product.name,
    category: product.category,
    price: product.price,
    cost_price: product.cost_price || "",
    stock: product.stock,
    barcode: product.barcode || "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [attributes, setAttributes] = useState([]);
  const [attributeValues, setAttributeValues] = useState({});
  const [customAttrValues, setCustomAttrValues] = useState({});

  async function fetchAttributesAndValues() {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", businessCategory)
      .single();
    if (!cat) return;

    const { data: attrs } = await supabase
      .from("category_attributes")
      .select("id, name, type, options, required, sort_order")
      .eq("category_id", cat.id)
      .order("sort_order");
    if (attrs) setAttributes(attrs);

    const { data: vals } = await supabase
      .from("product_attribute_values")
      .select("attribute_id, value")
      .eq("product_id", product.id);
    if (vals) {
      const map = {};
      const custom = {};
      vals.forEach((v) => {
        const attr = attrs.find(a => a.id === v.attribute_id);
        if (attr && attr.options && Array.isArray(attr.options) && !attr.options.includes(v.value)) {
          map[v.attribute_id] = "__other__";
          custom[v.attribute_id] = v.value;
        } else {
          map[v.attribute_id] = v.value;
        }
      });
      setAttributeValues(map);
      setCustomAttrValues(custom);
    }
  }

  useEffect(() => {
    fetchAttributesAndValues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessCategory, product.id]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleAttrChange(attrId, value) {
    setAttributeValues((prev) => ({ ...prev, [attrId]: value }));
  }

  async function handleUpdate() {
    setLoading(true);

    const shopId = await getShopId();

    let image = product.image;
    if (imageFile === null) {
      if (product.image) {
        await deleteImage(product.image).catch(() => {});
        image = null;
      }
    } else if (imageFile) {
      if (product.image) await deleteImage(product.image).catch(() => {});
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
    if (showBarcode) payload.barcode = form.barcode || null;

    const attrEntries = Object.entries(attributeValues).filter(
      (entry) => entry[1].trim()
    ).map(([attrId, val]) => ({
      attribute_id: attrId,
      value: val === "__other__" ? (customAttrValues[attrId] || "") : val,
    }));

    onUpdated();
    onClose();
    setLoading(false);

    enqueueWrite({
      type: "updateProduct",
      shopId,
      payload: { productId: product.id, product: payload, attributes: attrEntries },
    });
  }

  async function handleDelete() {
    setLoading(true);

    const shopId = await getShopId();

    if (product.image) {
      await deleteImage(product.image).catch(() => {});
    }

    onUpdated();
    onClose();
    setLoading(false);

    enqueueWrite({
      type: "deleteProduct",
      shopId,
      payload: { id: product.id, name: product.name },
    });
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div
        ref={trapRef}
        className="bg-white dark:bg-[#16213e] rounded-2xl border border-gray-100 dark:border-white/10 p-6 w-full max-w-md mx-4 max-h-[85vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label="Edit product"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-medium text-gray-800 dark:text-white">Edit product</h2>
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
              className="w-full border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#1a1a2e] text-gray-800 dark:text-white focus:outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 dark:text-slate-500 mb-1 block">Category</label>
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
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

          {showScanner && (
            <BarcodeScanner
              onScan={(code) => {
                setForm((prev) => ({ ...prev, barcode: code }));
                setShowScanner(false);
              }}
              onClose={() => setShowScanner(false)}
            />
          )}

          <ImageUploader
            currentImage={product.image}
            onImageChange={setImageFile}
          />

          {confirmDelete && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-600 dark:text-red-400">
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

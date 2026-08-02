/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { FiX, FiCamera } from "react-icons/fi";
import { getShopId } from "../lib/shop";
import { supabase } from "../lib/supabase";
import { uploadImage } from "../lib/storage";
import { useSettings } from "../hooks/useSettings";
import { formatPrice } from "../lib/format";
import ImageUploader from "./ImageUploader";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { enqueueWrite } from "../lib/writeQueue";
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
  const [errors, setErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [existingProduct, setExistingProduct] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [attributes, setAttributes] = useState([]);
  const [attributeValues, setAttributeValues] = useState({});
  const [customAttrValues, setCustomAttrValues] = useState({});
  const [showVariants, setShowVariants] = useState(false);
  const [showAllAttrs, setShowAllAttrs] = useState({});

  function validate() {
    const next = {};
    if (!form.name.trim()) next.name = "Product name is required";
    if (!form.category.trim()) next.category = "Category is required";
    if (!form.price || Number(form.price) <= 0) next.price = "Enter a valid price";
    if (!form.stock || Number(form.stock) < 0) next.stock = "Enter a valid stock quantity";
    const missingRequired = attributes.some((a) => {
      if (!a.required) return false;
      if (a.type === "text") return (attributeValues[a.id] || "").split("|||").filter(Boolean).length === 0;
      return !attributeValues[a.id]?.trim();
    });
    if (missingRequired) next.attributes = "Fill in all required variant attributes";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

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
    if (errors[e.target.name]) setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  }

  function handleAttrChange(attrId, value) {
    setAttributeValues((prev) => ({ ...prev, [attrId]: value }));
    if (errors.attributes) setErrors((prev) => ({ ...prev, attributes: undefined }));
  }

  async function handleSubmit() {
    if (!validate()) return;

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

    const attrEntries = Object.entries(attributeValues).filter(
      (entry) => entry[1].trim()
    ).map(([attrId, val]) => ({
      attribute_id: attrId,
      value: val === "__other__" ? (customAttrValues[attrId] || "") : val,
    }));

    onAdded();
    onClose();
    setLoading(false);

    enqueueWrite({
      type: "addProduct",
      shopId,
      payload: { product: payload, attributes: attrEntries },
    });
  }

  async function handleUpdate() {
    setLoading(true);

    const shopId = await getShopId();

    let image = existingProduct.image;
    if (imageFile) {
      try {
        image = await uploadImage(imageFile, shopId);
      } catch (err) {
        console.error("Upload failed:", err);
      }
    }

    onAdded();
    onClose();
    setLoading(false);

    enqueueWrite({
      type: "updateProduct",
      shopId,
      payload: {
        productId: existingProduct.id,
        product: {
          stock: parseInt(form.stock),
          price: parseInt(form.price),
          cost_price: parseInt(form.cost_price) || 0,
          image,
        },
        attributes: [],
      },
    });
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div
        ref={trapRef}
        className="bg-surface-1 rounded-2xl border border-border-subtle p-6 w-full max-w-md mx-4 max-h-[85vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label="Add product"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-medium text-text-primary">Add product</h2>
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
            <label className="text-xs text-text-faint mb-1 block">
              Product name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. iPhone 15 case"
              className={`w-full border rounded-lg px-3 py-2 text-sm bg-surface-1 text-text-primary focus:outline-none focus:border-brand ${errors.name ? "border-danger" : "border-border-subtle"}`}
            />
            {errors.name && <p className="text-danger text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="text-xs text-text-faint mb-1 block">Category</label>
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="e.g. Cases"
              className={`w-full border rounded-lg px-3 py-2 text-sm bg-surface-1 text-text-primary focus:outline-none focus:border-brand ${errors.category ? "border-danger" : "border-border-subtle"}`}
            />
            {errors.category && <p className="text-danger text-xs mt-1">{errors.category}</p>}
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-text-faint mb-1 block">
                Price
              </label>
              <input
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="350"
                type="number"
                className={`w-full border rounded-lg px-3 py-2 text-sm bg-surface-1 text-text-primary focus:outline-none focus:border-brand ${errors.price ? "border-danger" : "border-border-subtle"}`}
              />
              {errors.price && <p className="text-danger text-xs mt-1">{errors.price}</p>}
            </div>
            <div>
              <label className="text-xs text-text-faint mb-1 block">
                Cost price
              </label>
              <input
                name="cost_price"
                value={form.cost_price}
                onChange={handleChange}
                placeholder="200"
                type="number"
                className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm bg-surface-1 text-text-primary focus:outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="text-xs text-text-faint mb-1 block">
                Stock
              </label>
              <input
                name="stock"
                value={form.stock}
                onChange={handleChange}
                placeholder="10"
                type="number"
                className={`w-full border rounded-lg px-3 py-2 text-sm bg-surface-1 text-text-primary focus:outline-none focus:border-brand ${errors.stock ? "border-danger" : "border-border-subtle"}`}
              />
              {errors.stock && <p className="text-danger text-xs mt-1">{errors.stock}</p>}
            </div>
          </div>

          {attributes.length > 0 && (
            <div className="border-t border-border-subtle pt-3">
              <button
                type="button"
                onClick={() => setShowVariants((v) => !v)}
                className="flex items-center gap-1.5 text-xs text-text-faint font-medium mb-1 hover:text-text-body dark:hover:text-text-body transition-colors w-full text-left"
              >
                <span className={`transition-transform ${showVariants ? "rotate-90" : ""}`}>▸</span>
                Product Attributes
                {!attributes.some((a) => a.required) && (
                  <span className="text-text-faint dark:text-text-body font-normal">(Optional)</span>
                )}
              </button>
              {showVariants && (
                <div className="flex flex-col gap-3 mt-3">
                  {errors.attributes && <p className="text-danger text-xs">{errors.attributes}</p>}
                  {attributes.map((attr) => (
                    <div key={attr.id}>
                      <label className="text-xs text-text-faint mb-1 block">
                        {attr.name}
                        {attr.required && <span className="text-danger ml-0.5">*</span>}
                      </label>
                      {attr.type === "select" && attr.options ? (
                        <div>
                          <div className="flex flex-wrap gap-1.5">
                            {(() => {
                              const showAll = showAllAttrs[attr.id];
                              const pills = showAll ? attr.options : attr.options.slice(0, 3);
                              return pills.map((opt) => {
                                const selected = attributeValues[attr.id] === opt;
                                return (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() => {
                                      if (selected) {
                                        handleAttrChange(attr.id, "");
                                      } else {
                                        handleAttrChange(attr.id, opt);
                                        setCustomAttrValues((prev) => ({ ...prev, [attr.id]: "" }));
                                      }
                                    }}
                                    className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                                      selected
                                        ? "bg-brand-muted border-brand-soft text-brand"
                                        : "border-border-subtle text-text-body hover:border-border-strong dark:border-white/10 dark:hover:border-white/20"
                                    }`}
                                  >
                                    {selected && <span className="mr-1">✓</span>}
                                    {opt}
                                  </button>
                                );
                              });
                            })()}
                            {!showAllAttrs[attr.id] && attr.options.length > 3 && (
                              <button
                                type="button"
                                onClick={() => setShowAllAttrs((prev) => ({ ...prev, [attr.id]: true }))}
                                className="px-2.5 py-1 text-xs rounded-lg border border-dashed border-border-subtle text-text-faint hover:text-text-body hover:border-border-strong dark:border-white/10 dark:text-text-muted dark:hover:text-text-body transition-all"
                              >
                                + {attr.options.length - 3} more
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                if (attributeValues[attr.id] === "__other__") {
                                  handleAttrChange(attr.id, "");
                                  setCustomAttrValues((prev) => ({ ...prev, [attr.id]: "" }));
                                } else {
                                  handleAttrChange(attr.id, "__other__");
                                }
                              }}
                              className={`px-2.5 py-1 text-xs rounded-lg border border-dashed transition-all ${
                                attributeValues[attr.id] === "__other__"
                                  ? "bg-brand-muted border-brand-soft text-brand"
                                  : "border-border-subtle text-text-faint hover:text-text-body hover:border-border-strong dark:border-white/10 dark:text-text-muted dark:hover:text-text-body"
                              }`}
                            >
                              {attributeValues[attr.id] === "__other__" ? "✓ Custom" : "+ Add"}
                            </button>
                          </div>
                          {attributeValues[attr.id] === "__other__" && (
                            <input
                              value={customAttrValues[attr.id] || ""}
                              onChange={(e) => setCustomAttrValues((prev) => ({ ...prev, [attr.id]: e.target.value }))}
                              placeholder={`Type custom ${attr.name.toLowerCase()}`}
                              className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm bg-surface-1 text-text-primary focus:outline-none focus:border-brand mt-2"
                              autoFocus
                            />
                          )}
                        </div>
                      ) : attr.type === "text" ? (
                        <div>
                          <div className="flex flex-wrap gap-1.5 mb-1.5">
                            {(attributeValues[attr.id] || "").split("|||").filter(Boolean).map((val, i) => (
                              <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-lg bg-brand-muted border border-brand-soft text-brand">
                                {val}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const vals = (attributeValues[attr.id] || "").split("|||").filter(Boolean);
                                    vals.splice(i, 1);
                                    handleAttrChange(attr.id, vals.join("|||"));
                                  }}
                                  className="hover:text-brand-soft leading-none"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                          <div className="flex gap-1.5">
                            <input
                              value={customAttrValues[attr.id] || ""}
                              onChange={(e) => setCustomAttrValues((prev) => ({ ...prev, [attr.id]: e.target.value }))}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && customAttrValues[attr.id]?.trim()) {
                                  const vals = (attributeValues[attr.id] || "").split("|||").filter(Boolean);
                                  vals.push(customAttrValues[attr.id].trim());
                                  handleAttrChange(attr.id, vals.join("|||"));
                                  setCustomAttrValues((prev) => ({ ...prev, [attr.id]: "" }));
                                }
                              }}
                              placeholder={`Type ${attr.name.toLowerCase()} and press Enter`}
                              className="flex-1 border border-border-subtle rounded-lg px-3 py-2 text-sm bg-surface-1 text-text-primary focus:outline-none focus:border-brand"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (customAttrValues[attr.id]?.trim()) {
                                  const vals = (attributeValues[attr.id] || "").split("|||").filter(Boolean);
                                  vals.push(customAttrValues[attr.id].trim());
                                  handleAttrChange(attr.id, vals.join("|||"));
                                  setCustomAttrValues((prev) => ({ ...prev, [attr.id]: "" }));
                                }
                              }}
                              className="px-3 py-2 text-xs font-medium rounded-lg bg-brand text-white hover:bg-brand-strong transition-all"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      ) : (
                        <input
                          value={attributeValues[attr.id] || ""}
                          onChange={(e) => handleAttrChange(attr.id, e.target.value)}
                          type="number"
                          placeholder={`Enter ${attr.name.toLowerCase()}`}
                          className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm bg-surface-1 text-text-primary focus:outline-none focus:border-brand"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {showBarcode && (
            <div>
              <label className="text-xs text-text-faint mb-1 block">
                Barcode
              </label>
              <div className="flex gap-2">
                <input
                  name="barcode"
                  value={form.barcode}
                  onChange={handleChange}
                  placeholder="Scan or type barcode"
                  className="flex-1 border border-border-subtle rounded-lg px-3 py-2 text-sm bg-surface-1 text-text-primary focus:outline-none focus:border-brand font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowScanner(true)}
                  className="flex items-center gap-1.5 px-3 border border-border-subtle text-text-muted text-xs rounded-lg hover:bg-surface-2 transition-all"
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
            <div className="bg-warning-muted border border-warning rounded-lg px-3 py-2 text-xs text-accent-300">
              <p className="font-medium mb-1">
                "{existingProduct.name}" already exists
              </p>
              <p>
                Current stock: {existingProduct.stock} &nbsp;·&nbsp; Price:{" "}
                {formatPrice(existingProduct.price)}
              </p>
              <p className="mt-1 text-accent">
                Your new stock and price values will replace these.
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-5">
          <button
            onClick={onClose}
            className="flex-1 border border-border-subtle text-text-muted text-sm py-2 rounded-lg hover:bg-surface-2 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={existingProduct ? handleUpdate : handleSubmit}
            disabled={loading}
            className="flex-1 bg-brand text-white text-sm py-2 rounded-lg hover:bg-brand-strong transition-all disabled:opacity-50"
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

import { useState } from "react";
import { FiX } from "react-icons/fi";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { formatPrice } from "../lib/format";

const pricingModes = [
  { value: "flat", label: "Flat rate (one price)" },
  { value: "per_unit", label: "Per item (e.g. per shirt)" },
  { value: "per_weight", label: "Per weight (e.g. per kg)" },
  { value: "per_hour", label: "Per hour" },
];


export default function ServiceFormModal({ service, defaultCategory, onSave, onClose }) {
  const trapRef = useFocusTrap(true);
  const [form, setForm] = useState({
    name: service?.name || "",
    category: service?.category || defaultCategory || "Laundry",
    price: service?.price || "",
    pricing_mode: service?.pricing_mode || "flat",
    unit_label: service?.unit_label || "",
    description: service?.description || "",
  });
  const [errors, setErrors] = useState({});

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  }

  function validate() {
    const next = {};
    if (!form.name.trim()) next.name = "Service name is required";
    if (!form.price || Number(form.price) <= 0) next.price = "Enter a valid price";
    if ((form.pricing_mode === "per_unit" || form.pricing_mode === "per_weight" || form.pricing_mode === "per_hour") && !form.unit_label.trim()) {
      next.unit_label = "Unit label is required for this pricing mode";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    onSave({
      name: form.name,
      category: form.category,
      price: parseInt(form.price),
      pricing_mode: form.pricing_mode,
      unit_label: form.pricing_mode === "flat" ? "" : form.unit_label,
      description: form.description,
    });
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div
        ref={trapRef}
        className="bg-surface-1 rounded-2xl border border-border-subtle p-6 w-full max-w-md mx-4"
        role="dialog"
        aria-modal="true"
        aria-label={service ? "Edit service" : "Add service"}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-medium text-text-primary">{service ? "Edit service" : "Add service"}</h2>
          <button onClick={onClose} className="text-text-faint hover:text-text-body text-lg" aria-label="Close"><FiX /></button>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-text-faint mb-1 block">Service name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Wash & Fold"
              className={`w-full border rounded-lg px-3 py-2 text-sm bg-surface-1 text-text-primary focus:outline-none focus:border-brand ${errors.name ? "border-danger" : "border-border-subtle"}`}
            />
            {errors.name && <p className="text-danger text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="text-xs text-text-faint mb-1 block">Pricing mode</label>
            <select
              name="pricing_mode"
              value={form.pricing_mode}
              onChange={handleChange}
              className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm bg-surface-1 text-text-primary focus:outline-none focus:border-brand"
            >
              {pricingModes.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-text-faint mb-1 block">Price</label>
              <input
                name="price"
                value={form.price}
                onChange={handleChange}
                type="number"
                min="0"
                placeholder="200"
                className={`w-full border rounded-lg px-3 py-2 text-sm bg-surface-1 text-text-primary focus:outline-none focus:border-brand ${errors.price ? "border-danger" : "border-border-subtle"}`}
              />
              {errors.price && <p className="text-danger text-xs mt-1">{errors.price}</p>}
            </div>
            {form.pricing_mode !== "flat" && (
              <div>
                <label className="text-xs text-text-faint mb-1 block">Unit label</label>
                <input
                  name="unit_label"
                  value={form.unit_label}
                  onChange={handleChange}
                  placeholder="kg, item, hour"
                  className={`w-full border rounded-lg px-3 py-2 text-sm bg-surface-1 text-text-primary focus:outline-none focus:border-brand ${errors.unit_label ? "border-danger" : "border-border-subtle"}`}
                />
                {errors.unit_label && <p className="text-danger text-xs mt-1">{errors.unit_label}</p>}
              </div>
            )}
          </div>

          {form.pricing_mode !== "flat" && (
            <p className="text-xs text-text-faint">
              Example: {formatPrice(parseInt(form.price) || 0)} per {form.unit_label || "unit"}
            </p>
          )}

          <div>
            <label className="text-xs text-text-faint mb-1 block">Description (optional)</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Brief description of this service"
              rows={2}
              className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm bg-surface-1 text-text-primary focus:outline-none focus:border-brand resize-none"
            />
          </div>
        </div>

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
            {service ? "Save changes" : "Add service"}
          </button>
        </div>
      </div>
    </div>
  );
}
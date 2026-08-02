import { useState } from "react";
import { FiX } from "react-icons/fi";
import { useFocusTrap } from "../hooks/useFocusTrap";

export default function CustomerFormModal({ customer, onSave, onClose }) {
  const trapRef = useFocusTrap(true);
  const [form, setForm] = useState({
    name: customer?.name || "",
    phone: customer?.phone || "",
    email: customer?.email || "",
    notes: customer?.notes || "",
  });
  const [errors, setErrors] = useState({});

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  }

  function validate() {
    const next = {};
    if (!form.name.trim()) next.name = "Customer name is required";
    if (!form.phone.trim()) next.phone = "Phone number is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    onSave({
      name: form.name,
      phone: form.phone,
      email: form.email,
      notes: form.notes,
    });
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div
        ref={trapRef}
        className="bg-surface-1 rounded-2xl border border-border-subtle p-6 w-full max-w-md mx-4"
        role="dialog"
        aria-modal="true"
        aria-label={customer ? "Edit customer" : "Add customer"}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-medium text-text-primary">{customer ? "Edit customer" : "Add customer"}</h2>
          <button onClick={onClose} className="text-text-faint hover:text-text-body text-lg" aria-label="Close"><FiX /></button>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-text-faint mb-1 block">Customer name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Jane Muthoni"
              className={`w-full border rounded-lg px-3 py-2 text-sm bg-surface-1 text-text-primary focus:outline-none focus:border-brand ${errors.name ? "border-danger" : "border-border-subtle"}`}
            />
            {errors.name && <p className="text-danger text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="text-xs text-text-faint mb-1 block">Phone number</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="e.g. 0712345678"
              className={`w-full border rounded-lg px-3 py-2 text-sm bg-surface-1 text-text-primary focus:outline-none focus:border-brand ${errors.phone ? "border-danger" : "border-border-subtle"}`}
            />
            {errors.phone && <p className="text-danger text-xs mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="text-xs text-text-faint mb-1 block">Email (optional)</label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="e.g. jane@email.com"
              type="email"
              className="w-full border border-border-subtle rounded-lg px-3 py-2 text-sm bg-surface-1 text-text-primary focus:outline-none focus:border-brand"
            />
          </div>

          <div>
            <label className="text-xs text-text-faint mb-1 block">Notes (optional)</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Preferences, instructions, notes..."
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
            {customer ? "Save changes" : "Add customer"}
          </button>
        </div>
      </div>
    </div>
  );
}
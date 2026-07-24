import { useState, useEffect } from "react";
import { FiX, FiPlus, FiTrash2 } from "react-icons/fi";
import { formatPrice } from "../lib/format";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { useSettings } from "../hooks/useSettings";
import { fetchServices } from "../lib/serviceData";

function emptyRow() {
  return { service_id: "", service_name: "", service_price: 0, quantity: 1, weight_kg: "", notes: "" };
}

function computeLineTotal(svc, qty, weight) {
  if (!svc) return 0;
  if (svc.pricing_mode === "per_weight") return svc.price * (weight || 0);
  if (svc.pricing_mode === "flat") return svc.price;
  return svc.price * (parseInt(qty) || 1);
}

export default function EditOrderModal({ order, onSave, onClose }) {
  const trapRef = useFocusTrap(true);
  const { businessCategory } = useSettings();
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchServices(businessCategory);
        setServices(data);
      } catch (e) {
        console.error("Failed to load services:", e);
      }
      setLoadingServices(false);
    })();
  }, [businessCategory]);

  const initialRows = order.items.map((item) => {
    const svc = services.find((s) => s.name === item.service_name);
    return {
      service_id: svc ? svc.id : item.service_id || "",
      service_name: item.service_name || "",
      service_price: item.service_price || svc?.price || 0,
      quantity: item.quantity || 1,
      weight_kg: item.weight_kg ? String(item.weight_kg) : "",
      notes: item.notes || "",
    };
  });

  const [rows, setRows] = useState(initialRows.length > 0 ? initialRows : [emptyRow()]);
  const [orderNotes, setOrderNotes] = useState(order.notes || "");
  const [paymentMethod, setPaymentMethod] = useState(order.payment_method || "Cash");
  const [loading, setLoading] = useState(false);

  const total = rows.reduce((sum, r) => {
    const svc = services.find((s) => s.id === r.service_id);
    return sum + computeLineTotal(svc, r.quantity, parseFloat(r.weight_kg) || 0);
  }, 0);

  function handleServiceChange(index, serviceId) {
    const svc = services.find((s) => s.id === serviceId);
    setRows((prev) =>
      prev.map((r, i) =>
        i === index ? { ...r, service_id: serviceId, service_name: svc ? svc.name : "", service_price: svc ? svc.price : 0, quantity: 1, weight_kg: "" } : r
      )
    );
  }

  function handleRowChange(index, field, value) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  }

  function addRow() { setRows((prev) => [...prev, emptyRow()]); }

  function removeRow(index) { setRows((prev) => prev.filter((_, i) => i !== index)); }

  async function handleSubmit() {
    setLoading(true);
    const items = rows
      .filter((r) => r.service_id)
      .map((r) => {
        const svc = services.find((s) => s.id === r.service_id);
        const qty = parseInt(r.quantity) || 1;
        const weight = parseFloat(r.weight_kg) || null;
        const lineTotal = computeLineTotal(svc, r.quantity, weight || 0);
        return {
          service_id: r.service_id,
          service_name: r.service_name,
          service_price: svc ? svc.price : 0,
          quantity: svc?.pricing_mode === "flat" ? 1 : svc?.pricing_mode === "per_weight" ? (weight || 1) : qty,
          weight_kg: weight,
          line_total: lineTotal,
          notes: r.notes || "",
        };
      });
    if (items.length === 0) { setLoading(false); return; }

    await onSave(order.id, { items, notes: orderNotes, payment_method: paymentMethod, total, subtotal: total });
    setLoading(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div
        ref={trapRef}
        className="bg-white dark:bg-[#16213e] rounded-2xl border border-gray-100 dark:border-white/10 p-6 w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label="Edit order"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-medium text-gray-800 dark:text-white">Edit {order.id}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg" aria-label="Close"><FiX /></button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-slate-50 dark:bg-[#1a1a2e] rounded-xl px-3 py-2 text-sm">
            <span className="text-gray-400 dark:text-slate-500">Customer: </span>
            <span className="text-gray-800 dark:text-white font-medium">{order.customer.name}</span>
            <span className="text-gray-400 dark:text-slate-500 ml-2">{order.customer.phone}</span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-gray-400 dark:text-slate-500">Items</label>
              <button type="button" onClick={addRow} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-all"><FiPlus size={12} /> Add line</button>
            </div>
            <div className="space-y-2">
              {loadingServices ? (
                <div className="h-12 bg-slate-50 dark:bg-[#1a1a2e] rounded-xl animate-pulse" />
              ) : (
                rows.map((row, i) => {
                  const svc = services.find((s) => s.id === row.service_id);
                  const lineTotal = computeLineTotal(svc, row.quantity, parseFloat(row.weight_kg) || 0);
                  return (
                    <div key={i} className="bg-slate-50 dark:bg-[#1a1a2e] rounded-xl p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <select
                          value={row.service_id}
                          onChange={(e) => handleServiceChange(i, e.target.value)}
                          className="flex-1 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2.5 sm:py-2 text-sm bg-white dark:bg-[#1a1a2e] text-gray-800 dark:text-white focus:outline-none focus:border-blue-400"
                        >
                          <option value="">Select service...</option>
                          {services.map((s) => (
                            <option key={s.id} value={s.id}>{s.name} — {formatPrice(s.price)}/{s.unit_label || "each"}</option>
                          ))}
                        </select>
                        {svc && svc.pricing_mode !== "flat" && (
                          <div className="w-14 sm:w-16">
                            <input
                              type="number" min="1"
                              value={row.quantity}
                              onChange={(e) => handleRowChange(i, "quantity", e.target.value)}
                              className="w-full border border-gray-200 dark:border-white/10 rounded-lg px-2 sm:px-3 py-2.5 sm:py-2 text-sm bg-white dark:bg-[#1a1a2e] text-gray-800 dark:text-white focus:outline-none focus:border-blue-400 text-center"
                              title={svc.pricing_mode === "per_weight" ? "Weight in kg" : "Quantity"}
                            />
                          </div>
                        )}
                        {rows.length > 1 && (
                          <button type="button" onClick={() => removeRow(i)} className="p-2 sm:p-1.5 text-red-400 hover:text-red-500 transition-all"><FiTrash2 size={15} /></button>
                        )}
                      </div>
                      {svc?.pricing_mode === "per_weight" && (
                        <input
                          type="number" min="0" step="0.5"
                          value={row.weight_kg}
                          onChange={(e) => handleRowChange(i, "weight_kg", e.target.value)}
                          placeholder="Weight (kg)"
                          className="w-full border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#1a1a2e] text-gray-800 dark:text-white focus:outline-none focus:border-blue-400"
                        />
                      )}
                      <input
                        value={row.notes}
                        onChange={(e) => handleRowChange(i, "notes", e.target.value)}
                        placeholder="Notes..."
                        className="w-full border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#1a1a2e] text-gray-800 dark:text-white focus:outline-none focus:border-blue-400"
                      />
                      {svc && (
                        <p className="text-xs text-gray-400 dark:text-slate-500 text-right">{formatPrice(lineTotal)}</p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 dark:text-slate-500 mb-1 block">Payment method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#1a1a2e] text-gray-800 dark:text-white focus:outline-none focus:border-blue-400"
            >
              {["Cash", "M-Pesa", "Card", "Bank Transfer", "Other"].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-400 dark:text-slate-500 mb-1 block">Order notes</label>
            <input
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="e.g. Collect by 5pm..."
              className="w-full border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#1a1a2e] text-gray-800 dark:text-white focus:outline-none focus:border-blue-400"
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-500/10 rounded-lg px-4 py-3 flex justify-between items-center">
            <span className="text-xs text-blue-500">Total</span>
            <span className="text-sm font-medium text-blue-700 dark:text-blue-400">{formatPrice(total)}</span>
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-slate-400 text-sm py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-all">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={loading || !rows.some((r) => r.service_id)}
            className="flex-1 bg-blue-600 text-white text-sm py-2 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

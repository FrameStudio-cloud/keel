import { useMemo, useState } from "react";
import { FiX, FiSearch, FiShoppingBag, FiTrash2, FiPlus } from "react-icons/fi";
import { formatPrice } from "../../lib/format";
import { createOrder } from "../../lib/serviceData";
import { getPaymentMethods } from "../../lib/paymentConfig";
import { useShopProducts } from "../../hooks/useWhatsAppInbox";
import { useToast } from "../../context/ToastProvider";
import { useFocusTrap } from "../../hooks/useFocusTrap";

const inputClass = "w-full bg-surface-1 border border-border-subtle rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder-text-faint focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-colors";

export default function LogOrderModal({ conversation, onClose, onSend }) {
  const trapRef = useFocusTrap(true);
  const { showToast } = useToast();
  const { data: products } = useShopProducts();

  const [customerName, setCustomerName] = useState(conversation.customer_name || "");
  const [customerPhone, setCustomerPhone] = useState(conversation.customer_phone || "");
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(getPaymentMethods()[0] || "Cash");
  const [notes, setNotes] = useState("");
  const [sendConfirm, setSendConfirm] = useState(true);
  const [saving, setSaving] = useState(false);

  const productResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return (products || []).filter(
      (p) =>
        (p.name || "").toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q),
    );
  }, [products, query]);

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  function addProduct(product) {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { id: product.id, name: product.name, price: Number(product.price) || 0, qty: 1 }];
    });
    setQuery("");
  }

  function removeItem(id) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function handleSave() {
    if (!customerPhone || items.length === 0 || saving) return;
    setSaving(true);
    try {
      const orderItems = items.map((i) => ({
        service_name: i.name,
        service_price: i.price,
        quantity: i.qty,
        line_total: i.price * i.qty,
      }));
      const { id } = await createOrder({
        customerName: customerName || "Customer",
        customerPhone,
        items: orderItems,
        notes: notes || `Order from WhatsApp chat with ${conversation.customer_phone}`,
        total,
        payment_method: paymentMethod,
      });
      if (sendConfirm) {
        await onSend({
          body: `Order received! We'll confirm your order of ${formatPrice(total)} shortly. Thank you for shopping with us.`,
        });
      }
      showToast(`Order ${String(id).slice(0, 8)} logged`);
      onClose();
    } catch (e) {
      showToast(e.message, "error");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-label="Log an order"
        className="bg-surface-1 rounded-2xl border border-border-subtle w-full max-w-lg flex flex-col max-h-[88vh]"
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <FiShoppingBag size={16} className="text-brand" />
            <h2 className="text-sm font-bold text-text-primary">Log this order</h2>
          </div>
          <button type="button" onClick={onClose} className="text-text-faint hover:text-text-body" aria-label="Close">
            <FiX size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-text-faint mb-1.5">Customer name</label>
              <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Name" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-text-faint mb-1.5">Phone</label>
              <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="2547..." className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-xs text-text-faint mb-1.5">Add products</label>
            <div className="flex items-center gap-2 bg-surface-2 dark:bg-white/5 border border-border-subtle rounded-lg px-3">
              <FiSearch size={14} className="text-text-faint shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search inventory..."
                className="flex-1 bg-transparent py-2 text-sm text-text-primary placeholder-text-faint focus:outline-none"
              />
            </div>
            {query.trim() && (
              <div className="mt-1.5 border border-border-subtle rounded-lg overflow-hidden bg-surface-1">
                {productResults.length === 0 ? (
                  <p className="px-3 py-2 text-xs text-text-faint">No products found.</p>
                ) : (
                  productResults.slice(0, 6).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => addProduct(p)}
                      className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left hover:bg-surface-2 dark:hover:bg-white/5 transition-colors"
                    >
                      <span className="text-sm text-text-primary truncate">{p.name}</span>
                      <span className="text-xs text-text-muted shrink-0">{formatPrice(p.price)}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="space-y-1.5">
              {items.map((i) => (
                <div key={i.id} className="flex items-center gap-2 border border-border-subtle rounded-lg px-3 py-2">
                  <span className="flex-1 text-sm text-text-primary truncate">{i.name}</span>
                  <input
                    type="number"
                    min={1}
                    value={i.qty}
                    onChange={(e) => {
                      const qty = Math.max(1, Number(e.target.value) || 1);
                      setItems((prev) => prev.map((x) => (x.id === i.id ? { ...x, qty } : x)));
                    }}
                    className="w-14 bg-surface-2 dark:bg-white/5 border border-border-subtle rounded-md px-2 py-1 text-sm text-text-primary focus:outline-none focus:border-brand"
                  />
                  <span className="w-20 text-right text-sm text-text-muted">{formatPrice(i.price * i.qty)}</span>
                  <button type="button" onClick={() => removeItem(i.id)} className="text-text-faint hover:text-danger" aria-label="Remove item">
                    <FiTrash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-text-faint mb-1.5">Payment method</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className={inputClass}>
                {getPaymentMethods().map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-text-faint mb-1.5">Notes</label>
              <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes" className={inputClass} />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-text-body">
            <input
              type="checkbox"
              checked={sendConfirm}
              onChange={(e) => setSendConfirm(e.target.checked)}
              className="w-4 h-4 accent-brand"
            />
            Send a confirmation message to the customer
          </label>
        </div>

        <div className="px-5 py-3.5 border-t border-border-subtle flex items-center justify-between gap-3">
          <p className="text-sm text-text-muted">
            Total: <span className="font-bold text-text-primary">{formatPrice(total)}</span>
          </p>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || items.length === 0 || !customerPhone}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand hover:bg-brand-strong text-white font-semibold text-sm rounded-xl transition-all disabled:opacity-40"
          >
            <FiPlus size={14} />
            {saving ? "Logging..." : "Log order"}
          </button>
        </div>
      </div>
    </div>
  );
}

import { useMemo, useState } from "react";
import { FiX, FiSearch, FiPackage, FiSend } from "react-icons/fi";
import { formatPrice } from "../../lib/format";
import { useShopProducts } from "../../hooks/useWhatsAppInbox";
import { useFocusTrap } from "../../hooks/useFocusTrap";

export default function ProductPickerModal({ onClose, onSend, initialSearch = "", sending }) {
  const trapRef = useFocusTrap(true);
  const { data: products, isLoading } = useShopProducts();
  const [query, setQuery] = useState(initialSearch);
  const [selected, setSelected] = useState(new Set());

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products || [];
    return (products || []).filter(
      (p) =>
        (p.name || "").toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q) ||
        (p.barcode || "").toLowerCase().includes(q),
    );
  }, [products, query]);

  function toggle(product) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(product.id)) next.delete(product.id);
      else next.add(product.id);
      return next;
    });
  }

  function buildMessage(product) {
    const caption = `${product.name}\n${formatPrice(product.price)} • ${product.stock} in stock`;
    return product.image ? { image_url: product.image, caption } : { body: caption };
  }

  async function handleSend() {
    const chosen = (products || []).filter((p) => selected.has(p.id));
    for (const product of chosen) {
      await onSend(buildMessage(product));
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-label="Send products"
        className="bg-surface-1 rounded-2xl border border-border-subtle w-full max-w-md flex flex-col max-h-[82vh]"
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <FiPackage size={16} className="text-brand" />
            <h2 className="text-sm font-bold text-text-primary">Send products</h2>
          </div>
          <button type="button" onClick={onClose} className="text-text-faint hover:text-text-body" aria-label="Close">
            <FiX size={18} />
          </button>
        </div>

        <div className="px-5 py-3">
          <div className="flex items-center gap-2 bg-surface-2 dark:bg-white/5 border border-border-subtle rounded-lg px-3">
            <FiSearch size={14} className="text-text-faint shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="flex-1 bg-transparent py-2 text-sm text-text-primary placeholder-text-faint focus:outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-2 min-h-0">
          {isLoading ? (
            <div className="space-y-2 p-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-14 bg-surface-2 dark:bg-white/5 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-xs text-text-faint py-8">No products found.</p>
          ) : (
            filtered.map((p) => {
              const isSel = selected.has(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggle(p)}
                  className={`w-full flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all mb-1.5 ${
                    isSel
                      ? "border-brand bg-brand-muted"
                      : "border-border-subtle hover:bg-surface-2 dark:hover:bg-white/5"
                  }`}
                >
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-11 h-11 rounded-lg object-cover bg-surface-2 shrink-0"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-brand to-brand-strong flex items-center justify-center shrink-0">
                      <FiPackage size={16} className="text-white" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-text-primary truncate">{p.name}</p>
                    <p className="text-xs text-text-muted">
                      {formatPrice(p.price)}
                      <span className="text-text-faint"> • {p.stock} in stock</span>
                    </p>
                  </div>
                  <span
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                      isSel ? "border-brand bg-brand text-white" : "border-border-strong"
                    }`}
                  >
                    {isSel && <FiSend size={10} />}
                  </span>
                </button>
              );
            })
          )}
        </div>

        <div className="px-5 py-3.5 border-t border-border-subtle">
          <button
            type="button"
            onClick={handleSend}
            disabled={selected.size === 0 || sending}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand hover:bg-brand-strong text-white font-semibold text-sm rounded-xl transition-all disabled:opacity-40"
          >
            <FiSend size={14} />
            {sending ? "Sending..." : `Send ${selected.size} product${selected.size === 1 ? "" : "s"}`}
          </button>
        </div>
      </div>
    </div>
  );
}

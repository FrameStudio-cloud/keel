import { useEffect, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { FiX, FiSearch, FiFileText, FiPrinter } from "react-icons/fi";
import { formatPrice } from "../../lib/format";
import { uploadImage } from "../../lib/storage";
import { getShopId } from "../../lib/shop";
import { supabase } from "../../lib/supabase";
import { useSettings } from "../../hooks/useSettings";
import { useFocusTrap } from "../../hooks/useFocusTrap";

function dataURLtoFile(dataUrl, filename) {
  const [head, body] = dataUrl.split(",");
  const mime = head.match(/:(.*?);/)?.[1] || "image/png";
  const bin = atob(body);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new File([arr], filename, { type: mime });
}

export default function SendReceiptModal({ onClose, onSend, sending }) {
  const trapRef = useFocusTrap(true);
  const receiptRef = useRef(null);
  const { storeName } = useSettings();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      const shopId = await getShopId();
      if (!shopId) return;
      const { data, error } = await supabase
        .from("sales")
        .select("id, product_name, amount, quantity, method, mpesa_code, created_at")
        .eq("shop_id", shopId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (active) {
        setSales(data || []);
        setLoading(false);
        setSelected((prev) => prev || (data?.[0] || null));
        if (error) setSales([]);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sales;
    return sales.filter((s) => (s.product_name || "").toLowerCase().includes(q));
  }, [sales, query]);

  async function handleSend() {
    if (!selected || busy) return;
    setBusy(true);
    setError("");
    try {
      const dataUrl = await toPng(receiptRef.current, { pixelRatio: 2, backgroundColor: "#ffffff" });
      const shopId = await getShopId();
      const publicUrl = await uploadImage(dataURLtoFile(dataUrl, "receipt.png"), shopId);
      await onSend({
        image_url: publicUrl,
        caption: `Your receipt from ${storeName || "us"} — thank you!`,
      });
      onClose();
    } catch (e) {
      setError(e.message || "Couldn't send the receipt");
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-label="Send a receipt"
        className="bg-surface-1 rounded-2xl border border-border-subtle w-full max-w-2xl flex flex-col max-h-[88vh]"
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <FiFileText size={16} className="text-brand" />
            <h2 className="text-sm font-bold text-text-primary">Send a receipt</h2>
          </div>
          <button type="button" onClick={onClose} className="text-text-faint hover:text-text-body" aria-label="Close">
            <FiX size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 min-h-0 flex-1">
          <div className="flex flex-col min-h-0 border-b sm:border-b-0 sm:border-r border-border-subtle">
            <div className="px-5 pt-3 pb-2">
              <div className="flex items-center gap-2 bg-surface-2 dark:bg-white/5 border border-border-subtle rounded-lg px-3">
                <FiSearch size={14} className="text-text-faint shrink-0" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search recent sales..."
                  className="flex-1 bg-transparent py-2 text-sm text-text-primary placeholder-text-faint focus:outline-none"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-2 min-h-0">
              {loading ? (
                <div className="space-y-2 p-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-surface-2 dark:bg-white/5 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <p className="text-center text-xs text-text-faint py-8">No sales to send a receipt for.</p>
              ) : (
                filtered.map((s) => {
                  const isSel = selected?.id === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelected(s)}
                      className={`w-full text-left rounded-xl border px-3 py-2.5 transition-all mb-1.5 ${
                        isSel ? "border-brand bg-brand-muted" : "border-border-subtle hover:bg-surface-2 dark:hover:bg-white/5"
                      }`}
                    >
                      <p className="text-sm font-semibold text-text-primary truncate">{s.product_name || "Sale"}</p>
                      <p className="text-xs text-text-muted">
                        {formatPrice(s.amount)} <span className="text-text-faint">• {s.method || "Cash"}</span>
                      </p>
                      <p className="text-[10px] text-text-faint mt-0.5">
                        {new Date(s.created_at).toLocaleDateString()} {new Date(s.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto p-4 bg-surface-0 dark:bg-transparent">
              {selected ? (
                <div className="flex justify-center">
                  <div
                    ref={receiptRef}
                    className="bg-white text-black font-mono text-[11px] p-4 w-full max-w-[280px] shrink-0 shadow-md"
                  >
                    <h3 className="text-center text-[13px] font-bold mb-0.5">{storeName || "Store"}</h3>
                    <p className="text-center text-[10px]">
                      {new Date(selected.created_at).toLocaleDateString()} {new Date(selected.created_at).toLocaleTimeString()}
                    </p>
                    <p className="text-center text-[10px] mb-2">{String(selected.id).slice(0, 8)}</p>
                    <hr className="border-t border-dashed border-black/30 mb-2" />
                    <p className="mb-2">{selected.product_name}</p>
                    <div className="flex justify-between">
                      <span>Qty</span>
                      <span>{selected.quantity || 1}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total</span>
                      <span>{formatPrice(selected.amount)}</span>
                    </div>
                    <p className="text-right mt-1">{selected.method || "Cash"}</p>
                    <hr className="border-t border-dashed border-black/30 my-2" />
                    <p className="text-center text-[10px]">Thank you for your business!</p>
                  </div>
                </div>
              ) : (
                <p className="text-center text-xs text-text-faint py-10">Pick a sale on the left to preview its receipt.</p>
              )}
            </div>
            <div className="px-4 py-3.5 border-t border-border-subtle">
              {error && <p className="text-xs text-danger mb-2">{error}</p>}
              <button
                type="button"
                onClick={handleSend}
                disabled={!selected || busy || sending}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand hover:bg-brand-strong text-white font-semibold text-sm rounded-xl transition-all disabled:opacity-40"
              >
                <FiPrinter size={14} />
                {busy ? "Preparing..." : "Send receipt"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useRef } from "react";
import { toPng } from "html-to-image";
import { useSettings } from "../hooks/useSettings";
import { formatPrice } from "../lib/format";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { FiDownload } from "react-icons/fi";

export default function ReceiptModal({ sale, onClose }) {
  const trapRef = useFocusTrap(true);
  const printRef = useRef(null);
  const { storeName, storePhone, storeAddress, receiptFooter } = useSettings();

  if (!sale) return null;

  const dateStr = sale.created_at
    ? new Date(sale.created_at).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  async function handleDownload() {
    if (!printRef.current) return;
    try {
      const dataUrl = await toPng(printRef.current, {
        backgroundColor: "#ffffff",
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      const date = new Date(sale.created_at).toLocaleDateString("en-GB").replace(/\//g, "-");
      link.download = `${(storeName || "Keel-Shop").replace(/\s+/g, "-")}-receipt-${date}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to download receipt:", err);
    }
  }

  const line = "─".repeat(32);
  const dash = "·".repeat(32);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        ref={trapRef}
        className="bg-white dark:bg-[#16213e] border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-sm mx-4"
        role="dialog"
        aria-modal="true"
        aria-label="Sale receipt"
      >
        {/* Visible receipt — modern modal look */}
        <div className="bg-white p-4 rounded-xl">
          <div className="text-center mb-5">
            <h2 className="text-slate-900 font-bold text-lg">
              {storeName || "Keel Shop"}
            </h2>
            {storePhone && (
              <p className="text-slate-600 text-xs">{storePhone}</p>
            )}
            {storeAddress && (
              <p className="text-slate-600 text-xs">{storeAddress}</p>
            )}
            <div className="w-12 h-0.5 bg-blue-500/30 mx-auto mt-3" />
          </div>

          <div className="text-sm space-y-2 mb-5">
            <div className="flex justify-between">
              <span className="text-slate-600">Item</span>
              <span className="text-slate-900 font-semibold">{sale.product_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Quantity</span>
              <span className="text-slate-900">{sale.quantity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Method</span>
              <span className="text-slate-900">{sale.method}</span>
            </div>
            <div className="border-t border-slate-200 pt-2 mt-2">
              <div className="flex justify-between">
                <span className="text-slate-600 font-semibold">Total</span>
                <span className="text-blue-500 font-bold text-lg">
                  {formatPrice(sale.amount)}
                </span>
              </div>
            </div>
          </div>

          {receiptFooter && (
            <p className="text-center text-xs text-slate-400 mb-4">
              {receiptFooter}
            </p>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 text-white text-sm py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
          >
            <FiDownload size={14} />
            Download
          </button>
          <button
            onClick={onClose}
            className="flex-1 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 text-sm py-2.5 rounded-xl hover:text-slate-900 dark:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Hidden thermal-receipt version for PNG download */}
      <div className="fixed left-[-9999px] top-0">
        <div
          ref={printRef}
          style={{
            width: 320,
            padding: "20px 16px",
            backgroundColor: "#fff",
            color: "#111",
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: 13,
            lineHeight: 1.6,
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            <div style={{ fontWeight: "bold", fontSize: 16, letterSpacing: 1 }}>
              {storeName || "Keel Shop"}
            </div>
            {storePhone && (
              <div style={{ fontSize: 11, color: "#555" }}>{storePhone}</div>
            )}
            {storeAddress && (
              <div style={{ fontSize: 11, color: "#555" }}>{storeAddress}</div>
            )}
          </div>

          <div style={{ textAlign: "center", fontSize: 10, color: "#888", marginBottom: 8 }}>
            #{sale.id?.toString().slice(-6).toUpperCase() || "------"}
          </div>

          <div style={{ textAlign: "center", fontSize: 10, color: "#888", marginBottom: 12 }}>
            {dateStr}
          </div>

          <div style={{ letterSpacing: 1, color: "#999", marginBottom: 8 }}>{dash}</div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
            <span style={{ color: "#666", fontWeight: "bold" }}>ITEM</span>
            <span style={{ color: "#666", fontWeight: "bold" }}>QTY</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span>{sale.product_name}</span>
            <span>{sale.quantity}</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
            <span style={{ color: "#666" }}>Payment</span>
            <span>{sale.method}</span>
          </div>

          <div style={{ letterSpacing: 1, color: "#999", margin: "10px 0" }}>{line}</div>

          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: 16, marginBottom: 12 }}>
            <span>TOTAL</span>
            <span>{formatPrice(sale.amount)}</span>
          </div>

          <div style={{ textAlign: "center", fontSize: 10, color: "#888", marginTop: 8 }}>
            {receiptFooter || "Thank you for your purchase!"}
          </div>

          <div style={{ textAlign: "center", fontSize: 10, color: "#999", marginTop: 4 }}>
            Powered by Keel
          </div>
        </div>
      </div>
    </div>
  );
}

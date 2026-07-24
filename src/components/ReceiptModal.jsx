import { useRef } from "react";
import { FiX, FiPrinter } from "react-icons/fi";
import { formatPrice } from "../lib/format";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { useSettings } from "../hooks/useSettings";

export default function ReceiptModal({ order, onClose }) {
  const trapRef = useFocusTrap(true);
  const receiptRef = useRef(null);
  const { storeName } = useSettings();

  function handlePrint() {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>Receipt ${order.id}</title>
      <style>
        body { font-family: 'Courier New', monospace; font-size: 12px; color: #000; margin: 0; padding: 20px; }
        .receipt { max-width: 320px; margin: 0 auto; }
        h2 { text-align: center; font-size: 16px; margin-bottom: 4px; }
        .center { text-align: center; color: #666; margin: 0 0 4px; }
        hr { border: none; border-top: 1px dashed #666; margin: 12px 0; }
        .meta { display: flex; justify-content: space-between; font-size: 11px; color: #666; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 4px 0; text-align: left; font-size: 11px; }
        th { border-bottom: 1px solid #ccc; }
        .total { text-align: right; font-weight: bold; font-size: 14px; margin-top: 8px; }
        .footer { text-align: center; margin-top: 16px; font-size: 10px; color: #888; }
      </style></head><body>
      <div class="receipt">
        <h2>${storeName || "Store"}</h2>
        <p class="center">${new Date(order.created_at).toLocaleDateString()} ${new Date(order.created_at).toLocaleTimeString()}</p>
        <p class="center">${order.id}</p>
        <hr>
        <div style="margin-bottom:8px"><strong>${order.customer.name}</strong><br/>${order.customer.phone}</div>
        <table>
          <tr><th>Item</th><th style="text-align:right">Qty</th><th style="text-align:right">Price</th></tr>
          ${order.items.map((item) => `
            <tr>
              <td>${item.service_name}</td>
              <td style="text-align:right">${item.quantity || 1}</td>
              <td style="text-align:right">${formatPrice(item.line_total || item.service_price * (item.quantity || 1))}</td>
            </tr>
          `).join("")}
        </table>
        <hr>
        <div class="total">Total: ${formatPrice(order.total)}</div>
        <div style="text-align:right;font-size:11px;color:#666;margin-top:4px">Paid: ${order.payment_method || "Cash"}</div>
        ${order.notes ? `<p style="font-size:11px;color:#666;margin-top:8px">${order.notes}</p>` : ""}
        <hr>
        <div class="footer">Thank you for your business!</div>
      </div>
      </body></html>
    `);
    win.document.close();
    setTimeout(() => win.print(), 200);
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div
        ref={trapRef}
        className="bg-white dark:bg-[#16213e] rounded-2xl border border-gray-100 dark:border-white/10 p-6 w-full max-w-sm mx-4"
        role="dialog"
        aria-modal="true"
        aria-label="Receipt"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-gray-800 dark:text-white">Receipt</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg" aria-label="Close"><FiX /></button>
        </div>

        <div ref={receiptRef} className="bg-slate-50 dark:bg-[#1a1a2e] rounded-xl p-4 font-mono text-sm">
          <h3 className="text-center text-base font-semibold text-gray-800 dark:text-white mb-1">{storeName || "Store"}</h3>
          <p className="text-center text-[10px] text-gray-400 dark:text-slate-500">
            {new Date(order.created_at).toLocaleDateString()} {new Date(order.created_at).toLocaleTimeString()}
          </p>
          <p className="text-center text-[10px] text-gray-400 dark:text-slate-500 mb-3">{order.id}</p>
          <hr className="border-t border-dashed border-gray-300 dark:border-white/10 mb-3" />
          <p className="text-gray-800 dark:text-white mb-2"><strong>{order.customer.name}</strong><br /><span className="text-[11px] text-gray-400">{order.customer.phone}</span></p>
          <table className="w-full text-[11px]">
            <thead>
              <tr className="text-gray-400 dark:text-slate-500 border-b border-dashed border-gray-300 dark:border-white/10">
                <th className="text-left pb-1">Item</th>
                <th className="text-right pb-1">Qty</th>
                <th className="text-right pb-1">Price</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr key={i} className="text-gray-800 dark:text-white">
                  <td className="py-1">{item.service_name}</td>
                  <td className="text-right py-1">{item.quantity || 1}</td>
                  <td className="text-right py-1">{formatPrice(item.line_total || item.service_price * (item.quantity || 1))}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <hr className="border-t border-dashed border-gray-300 dark:border-white/10 my-2" />
          <div className="flex justify-between text-sm font-semibold text-gray-800 dark:text-white">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
          <p className="text-[10px] text-gray-400 dark:text-slate-500 text-right mt-1">{order.payment_method || "Cash"}</p>
          {order.notes && <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-2">{order.notes}</p>}
          <hr className="border-t border-dashed border-gray-300 dark:border-white/10 my-3" />
          <p className="text-center text-[10px] text-gray-400 dark:text-slate-500">Thank you for your business!</p>
        </div>

        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="flex-1 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-slate-400 text-sm py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-all">Close</button>
          <button onClick={handlePrint} className="flex-1 bg-blue-600 text-white text-sm py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"><FiPrinter size={14} /> Print</button>
        </div>
      </div>
    </div>
  );
}
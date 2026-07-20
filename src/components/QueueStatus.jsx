import { useState, useEffect, useRef } from "react";
import { FiClock, FiAlertCircle, FiRefreshCw } from "react-icons/fi";
import { getQueue, retryWrite, retryAllFailed } from "../lib/writeQueue";
import { useToast } from "../context/ToastProvider";

const TYPE_LABELS = {
  logSale: "Log sale",
  addProduct: "Add product",
  updateProduct: "Update product",
  deleteProduct: "Delete product",
  adjustStock: "Adjust stock",
};

function getItemLabel(item) {
  const p = item.payload;
  switch (item.type) {
    case "logSale": return p?.sale?.product_name || "";
    case "addProduct": return p?.product?.name || "";
    case "updateProduct": return p?.product?.name || "";
    case "deleteProduct": return p?.name || "";
    case "adjustStock": return p?.movement?.product_name || "";
    default: return "";
  }
}

export default function QueueStatus() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { showToast } = useToast();

  function refresh() {
    setItems(getQueue());
  }

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onCompleted = (e) => {
      refresh();
      showToast(`${TYPE_LABELS[e.detail.type] || "Operation"} saved`, "success");
    };
    const onFailed = (e) => {
      refresh();
      showToast(`${TYPE_LABELS[e.detail.type] || "Operation"} failed after retries`, "error");
    };
    const onRetrying = () => refresh();

    window.addEventListener("writeQueue:completed", onCompleted);
    window.addEventListener("writeQueue:failed", onFailed);
    window.addEventListener("writeQueue:retrying", onRetrying);
    return () => {
      window.removeEventListener("writeQueue:completed", onCompleted);
      window.removeEventListener("writeQueue:failed", onFailed);
      window.removeEventListener("writeQueue:retrying", onRetrying);
    };
  }, []);

  useEffect(() => {
    function onClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const pending = items.filter((i) => i.status !== "completed");
  if (pending.length === 0) return null;

  const failed = pending.filter((i) => i.status === "failed");

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border transition-all ${
          failed.length > 0
            ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20"
            : "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20"
        }`}
      >
        {failed.length > 0 ? <FiAlertCircle size={14} /> : <FiClock size={14} />}
        <span>{pending.length} pending</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-[#16213e] border border-gray-200 dark:border-white/10 rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-700 dark:text-slate-300">
              Pending writes ({pending.length})
            </span>
            {failed.length > 1 && (
              <button
                onClick={() => { retryAllFailed(); refresh(); }}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <FiRefreshCw size={12} /> Retry all
              </button>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto">
            {pending.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-gray-400">All caught up</div>
            ) : (
              pending.map((item) => (
                <div
                  key={item.id}
                  className="px-4 py-3 border-b border-gray-50 dark:border-white/5 last:border-0"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-800 dark:text-white truncate">
                        {TYPE_LABELS[item.type] || item.type}
                      </p>
                      {getItemLabel(item) && (
                        <p className="text-[11px] text-gray-400 dark:text-slate-500 truncate mt-0.5">
                          {getItemLabel(item)}
                        </p>
                      )}
                      <div className="mt-1.5 flex items-center gap-1.5">
                        {item.status === "pending" && (
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400" />
                        )}
                        {item.status === "retrying" && (
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                        )}
                        {item.status === "failed" && (
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" />
                        )}
                        <span className="text-[10px] text-gray-400 dark:text-slate-500">
                          {item.status === "pending" && "Pending"}
                          {item.status === "retrying" && `Retry ${item.retryCount}/${item.maxRetries}`}
                          {item.status === "failed" && `Failed`}
                        </span>
                      </div>
                      {item.lastError && (
                        <p className="text-[10px] text-red-400 mt-0.5 truncate" title={item.lastError}>
                          {item.lastError}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      {item.status === "failed" && (
                        <button
                          onClick={() => { retryWrite(item.id); refresh(); }}
                          className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-all"
                          title="Retry"
                        >
                          <FiRefreshCw size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
}

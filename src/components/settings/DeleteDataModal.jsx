import { useState } from "react";
import { FiAlertTriangle, FiTrash2, FiX } from "react-icons/fi";

export default function DeleteDataModal({ onClose, onConfirm }) {
  const [confirmText, setConfirmText] = useState("");

  function handleClose() {
    setConfirmText("");
    onClose();
  }

  function handleConfirm() {
    onConfirm();
    setConfirmText("");
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={handleClose}
    >
      <div
        className="bg-white dark:bg-[#16213e] rounded-2xl border border-gray-200 dark:border-white/10 p-6 w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center flex-shrink-0">
              <FiAlertTriangle size={18} className="text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Delete all data?</h3>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
            <FiX size={18} />
          </button>
        </div>

        <div className="space-y-3 text-sm text-gray-600 dark:text-slate-400">
          <p>This permanently removes all business data from your shop:</p>
          <ul className="list-disc list-inside text-xs space-y-1">
            <li>All products, variants, and stock history</li>
            <li>All sales records and expenses</li>
            <li>All catalogue listings and banners</li>
            <li>All social posts, page views, and analytics</li>
            <li>All chat history, FAQs, and callbacks</li>
            <li>Storefront deployment</li>
          </ul>
          <p className="pt-1 border-t border-gray-100 dark:border-white/10">
            <strong>Your shop, settings, and account will not be deleted.</strong> You can keep
            using the dashboard right after — it will just be empty.
          </p>
        </div>

        <div className="mt-4">
          <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1.5">
            Type <span className="font-bold text-red-600 dark:text-red-400">DELETE ALL DATA</span> to confirm
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE ALL DATA"
            className="w-full bg-slate-100 dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400/20"
          />
        </div>

        <div className="flex gap-2 mt-5">
          <button
            onClick={handleClose}
            className="flex-1 py-2.5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-slate-400 text-sm font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={confirmText !== "DELETE ALL DATA"}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 disabled:bg-red-300 dark:disabled:bg-red-800 text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed"
          >
            <FiTrash2 size={13} />
            Delete All Data
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { FiAlertTriangle, FiTrash2, FiX } from "react-icons/fi";

export default function DeleteShopModal({ onClose, onConfirm }) {
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
        className="bg-surface-1 rounded-2xl border border-border-subtle p-6 w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-danger-muted flex items-center justify-center flex-shrink-0">
              <FiAlertTriangle size={18} className="text-danger" />
            </div>
            <h3 className="text-base font-bold text-text-primary">Delete this shop?</h3>
          </div>
          <button onClick={handleClose} className="text-text-faint hover:text-text-body dark:hover:text-white transition-colors">
            <FiX size={18} />
          </button>
        </div>

        <div className="space-y-3 text-sm text-text-body">
          <p>This will permanently delete everything associated with this shop:</p>
          <ul className="list-disc list-inside text-xs space-y-1">
            <li>All products, inventory, and stock history</li>
            <li>All sales records, payments, and expenses</li>
            <li>All catalogue listings, banners, and website settings</li>
            <li>All posts, page views, and analytics data</li>
            <li>All store settings and preferences</li>
          </ul>
          <p className="pt-1 border-t border-border-subtle">
            <strong>This action is delayed by 30 days.</strong> You can cancel by logging in
            and visiting Settings within that period. After deletion, you can create a new
            shop with the same email address.
          </p>
        </div>

        <div className="mt-4">
          <label className="block text-xs font-medium text-text-body mb-1.5">
            Type <span className="font-bold text-danger">DELETE</span> to confirm
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            className="w-full bg-surface-2 border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-faint focus:outline-none focus:border-danger focus:ring-1 focus:ring-danger/20"
          />
        </div>

        <div className="flex gap-2 mt-5">
          <button
            onClick={handleClose}
            className="flex-1 py-2.5 border border-border-subtle text-text-body text-sm font-medium rounded-xl hover:bg-surface-2 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={confirmText !== "DELETE"}
            className="flex-1 py-2.5 bg-danger hover:bg-danger-500 disabled:bg-danger/40 text-danger-contrast text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed"
          >
            <FiTrash2 size={13} />
            Delete Shop
          </button>
        </div>
      </div>
    </div>
  );
}

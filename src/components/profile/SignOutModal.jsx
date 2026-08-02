import { FiLogOut, FiX } from "react-icons/fi";

export default function SignOutModal({ onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-surface-1 rounded-2xl border border-border-subtle p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-warning-muted flex items-center justify-center flex-shrink-0">
              <FiLogOut size={18} className="text-warning" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">Sign out?</h3>
              <p className="text-xs text-text-muted mt-0.5">You'll need to sign in again to access your shop.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-text-faint hover:text-text-body dark:hover:text-white transition-colors">
            <FiX size={18} />
          </button>
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 border border-border-subtle text-text-body text-sm font-medium rounded-xl hover:bg-surface-2 transition-all">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-danger hover:bg-danger-500 text-danger-contrast text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2">
            <FiLogOut size={13} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

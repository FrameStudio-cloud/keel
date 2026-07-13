import { FiLogOut, FiX } from "react-icons/fi";

export default function SignOutModal({ onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white dark:bg-[#16213e] rounded-2xl border border-gray-200 dark:border-white/10 p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <FiLogOut size={18} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Sign out?</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">You'll need to sign in again to access your shop.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
            <FiX size={18} />
          </button>
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-slate-400 text-sm font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-all">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2">
            <FiLogOut size={13} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

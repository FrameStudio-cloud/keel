import { FiSave, FiRefreshCw, FiCornerUpLeft } from "react-icons/fi";

export default function SettingsSaveBar({ isDirty, saving, onSave, onDiscard }) {
  return (
    <div className="sticky bottom-0 mt-6 z-10 bg-white/90 dark:bg-[#16213e]/90 backdrop-blur-lg border border-gray-200 dark:border-white/10 rounded-xl p-4 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-2">
        {isDirty && (
          <span className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Unsaved changes
          </span>
        )}
        {!isDirty && (
          <span className="text-xs text-gray-400 dark:text-slate-500">All changes saved</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {isDirty && (
          <button
            onClick={onDiscard}
            className="px-4 py-2 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-slate-400 rounded-lg text-sm hover:text-gray-800 dark:hover:text-white transition-all flex items-center gap-2"
          >
            <FiCornerUpLeft size={14} />
            Discard
          </button>
        )}
        <button
          onClick={onSave}
          disabled={saving}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-bold rounded-lg text-sm transition-all flex items-center gap-2 shadow-lg shadow-blue-600/25"
        >
          {saving ? <FiRefreshCw size={14} className="animate-spin" /> : <FiSave size={14} />}
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}

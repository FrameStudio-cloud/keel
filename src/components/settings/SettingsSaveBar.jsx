import { FiSave, FiRefreshCw, FiCornerUpLeft } from "react-icons/fi";

export default function SettingsSaveBar({ isDirty, saving, onSave, onDiscard }) {
  return (
    <div className="sticky bottom-0 mt-6 z-10 bg-surface-1/90 backdrop-blur-lg border border-border-subtle rounded-xl p-4 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-2">
        {isDirty && (
          <span className="flex items-center gap-1.5 text-xs text-warning font-medium">
            <span className="w-2 h-2 rounded-full bg-warning" />
            Unsaved changes
          </span>
        )}
        {!isDirty && (
          <span className="text-xs text-text-faint">All changes saved</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {isDirty && (
          <button
            onClick={onDiscard}
            className="px-4 py-2 border border-border-subtle text-text-muted rounded-lg text-sm hover:text-text-primary dark:hover:text-white transition-all flex items-center gap-2"
          >
            <FiCornerUpLeft size={14} />
            Discard
          </button>
        )}
        <button
          onClick={onSave}
          disabled={saving}
          className="px-5 py-2 bg-brand hover:bg-brand-soft disabled:bg-brand-soft disabled:cursor-not-allowed text-white font-bold rounded-lg text-sm transition-all flex items-center gap-2 shadow-lg shadow-brand/25"
        >
          {saving ? <FiRefreshCw size={14} className="animate-spin" /> : <FiSave size={14} />}
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}

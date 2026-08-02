import SectionCard from "./SectionCard";
import ProGate from "../ProGate";
import { FiDownload } from "react-icons/fi";

export default function DataTab({ onExport }) {
  return (
    <SectionCard icon={FiDownload} title="Data Export">
      <p className="text-xs text-text-faint mb-4">Download all your data as a JSON backup file.</p>
      <ProGate feature="settings_export">
        <button
          onClick={onExport}
          className="px-4 py-2 bg-surface-1 border border-border-subtle text-text-muted hover:text-text-primary dark:hover:text-white hover:border-border-strong dark:hover:border-white/20 rounded-lg text-sm transition-all flex items-center gap-2"
        >
          <FiDownload size={14} />
          Export All Data
        </button>
      </ProGate>
    </SectionCard>
  );
}

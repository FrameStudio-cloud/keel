import SectionCard from "./SectionCard";
import { FiDownload } from "react-icons/fi";

export default function DataTab({ onExport }) {
  return (
    <SectionCard icon={FiDownload} title="Data Export">
      <p className="text-xs text-gray-400 dark:text-slate-500 mb-4">Download all your data as a JSON backup file.</p>
      <button
        onClick={onExport}
        className="px-4 py-2 bg-white dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/20 rounded-lg text-sm transition-all flex items-center gap-2"
      >
        <FiDownload size={14} />
        Export All Data
      </button>
    </SectionCard>
  );
}

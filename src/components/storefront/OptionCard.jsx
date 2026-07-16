import { FiCheck } from "react-icons/fi";

export default function OptionCard({ option, selected, onSelect }) {
  const isSelected = selected === option.id;

  return (
    <button
      onClick={() => onSelect(option.id)}
      className={`relative w-full text-left rounded-xl border-2 transition-all duration-200 overflow-hidden ${
        isSelected
          ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50 dark:bg-blue-500/10"
          : "border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 bg-white dark:bg-[#16213e]"
      }`}
    >
      {/* Preview block */}
      <div className={`h-28 flex items-center justify-center ${
        isSelected
          ? "bg-blue-100/50 dark:bg-blue-900/20"
          : "bg-gray-50 dark:bg-white/5"
      }`}>
        <div className={`w-20 h-20 rounded-xl flex items-center justify-center ${
          isSelected
            ? "bg-blue-200/50 dark:bg-blue-800/30"
            : "bg-gray-200 dark:bg-white/10"
        }`}>
          <div className={`w-10 h-10 rounded-lg transition-colors ${
            isSelected
              ? "bg-blue-500"
              : "bg-gray-300 dark:bg-white/20"
          }`} />
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
          {option.name}
        </h3>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
          {option.description}
        </p>
      </div>

      {/* Checkmark */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shadow-sm">
          <FiCheck size={13} className="text-white" />
        </div>
      )}
    </button>
  );
}

export default function TabButton({ tab, isActive, onSelect, isMobile }) {
  if (isMobile) {
    return (
      <button
        onClick={() => onSelect(tab.id)}
        className={`shrink-0 px-3.5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
          isActive
            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
            : "bg-white dark:bg-[#16213e] text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-white/10 hover:text-gray-800 dark:hover:text-white"
        }`}
      >
        <tab.icon size={14} />
        {tab.label}
      </button>
    );
  }
  return (
    <button
      onClick={() => onSelect(tab.id)}
      className={`w-full text-left px-3 py-2.5 rounded-xl transition-all group ${
        isActive
          ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400"
          : "text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/[0.05]"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
          isActive
            ? "bg-blue-600/10 dark:bg-blue-500/20"
            : "bg-gray-100 dark:bg-white/[0.05] group-hover:bg-gray-200 dark:group-hover:bg-white/[0.08]"
        }`}>
          <tab.icon size={15} className={isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-slate-500"} />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium leading-tight">{tab.label}</div>
          <div className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5 truncate">{tab.subtitle}</div>
        </div>
      </div>
    </button>
  );
}

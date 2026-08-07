export default function TabButton({ tab, isActive, onSelect, isMobile }) {
  if (isMobile) {
    return (
      <button
        onClick={() => onSelect(tab.id)}
        className={`shrink-0 px-3.5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
          isActive
            ? "bg-brand text-white shadow-lg shadow-brand/25"
            : "bg-surface-1 text-text-muted border border-border-subtle hover:text-text-primary dark:hover:text-white"
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
          ? "bg-brand-muted text-brand"
          : "text-text-body hover:bg-surface-2"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
          isActive
            ? "bg-brand-muted"
            : "bg-surface-2 dark:bg-white/[0.05] group-hover:bg-surface-2 dark:group-hover:bg-white/[0.08]"
        }`}>
          <tab.icon size={15} className={isActive ? "text-brand" : "text-text-faint"} />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium leading-tight">{tab.label}</div>
          <div className="text-[10px] text-text-faint mt-0.5 truncate">{tab.subtitle}</div>
        </div>
      </div>
    </button>
  );
}

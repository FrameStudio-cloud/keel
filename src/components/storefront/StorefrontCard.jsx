export default function StorefrontCard({ item, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 w-[220px] snap-start text-left group"
    >
      {/* Screenshot placeholder */}
      <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-white/5 dark:to-white/[0.02] border border-border-subtle group-hover:border-border-strong dark:group-hover:border-white/20 transition-all duration-200 group-hover:shadow-md">
        <div className="w-full h-full flex items-center justify-center">
          {/* Mini phone mockup */}
          <div className="w-[60%] aspect-[9/19] rounded-lg bg-surface-1 shadow-sm border border-border-subtle overflow-hidden">
            {/* Status bar */}
            <div className="h-2.5 bg-surface-2 dark:bg-white/5 flex items-center justify-between px-2">
              <div className="w-4 h-1 rounded bg-surface-3 dark:bg-white/20" />
              <div className="w-2 h-1 rounded bg-surface-3 dark:bg-white/20" />
            </div>
            {/* Content preview */}
            <div className="p-1.5 space-y-1">
              <div className="h-1.5 rounded bg-surface-2 dark:bg-white/10 w-3/4" />
              <div className="h-1 rounded bg-surface-2 dark:bg-white/5 w-1/2" />
              <div className="grid grid-cols-2 gap-0.5 mt-1">
                <div className="aspect-square rounded bg-surface-2 dark:bg-white/5" />
                <div className="aspect-square rounded bg-surface-2 dark:bg-white/5" />
                <div className="aspect-square rounded bg-surface-2 dark:bg-white/5" />
                <div className="aspect-square rounded bg-surface-2 dark:bg-white/5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Label */}
      <div className="mt-2.5 flex items-center gap-2">
        <span className="text-sm font-medium text-text-primary truncate">
          {item.name}
        </span>
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-2 dark:bg-white/10 text-text-faint font-medium flex-shrink-0">
          {item.shopType}
        </span>
      </div>
    </button>
  );
}

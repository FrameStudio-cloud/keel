export default function StorefrontCard({ item, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 w-[220px] snap-start text-left group"
    >
      {/* Screenshot placeholder */}
      <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-white/5 dark:to-white/[0.02] border border-gray-200 dark:border-white/10 group-hover:border-gray-300 dark:group-hover:border-white/20 transition-all duration-200 group-hover:shadow-md">
        <div className="w-full h-full flex items-center justify-center">
          {/* Mini phone mockup */}
          <div className="w-[60%] aspect-[9/19] rounded-lg bg-white dark:bg-[#1a1a2e] shadow-sm border border-gray-200 dark:border-white/10 overflow-hidden">
            {/* Status bar */}
            <div className="h-2.5 bg-gray-100 dark:bg-white/5 flex items-center justify-between px-2">
              <div className="w-4 h-1 rounded bg-gray-300 dark:bg-white/20" />
              <div className="w-2 h-1 rounded bg-gray-300 dark:bg-white/20" />
            </div>
            {/* Content preview */}
            <div className="p-1.5 space-y-1">
              <div className="h-1.5 rounded bg-gray-200 dark:bg-white/10 w-3/4" />
              <div className="h-1 rounded bg-gray-100 dark:bg-white/5 w-1/2" />
              <div className="grid grid-cols-2 gap-0.5 mt-1">
                <div className="aspect-square rounded bg-gray-100 dark:bg-white/5" />
                <div className="aspect-square rounded bg-gray-100 dark:bg-white/5" />
                <div className="aspect-square rounded bg-gray-100 dark:bg-white/5" />
                <div className="aspect-square rounded bg-gray-100 dark:bg-white/5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Label */}
      <div className="mt-2.5 flex items-center gap-2">
        <span className="text-sm font-medium text-gray-800 dark:text-white truncate">
          {item.name}
        </span>
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-slate-500 font-medium flex-shrink-0">
          {item.shopType}
        </span>
      </div>
    </button>
  );
}

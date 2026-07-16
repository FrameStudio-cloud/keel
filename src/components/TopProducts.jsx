export default function TopProducts({ products = [] }) {
  if (products.length === 0) {
    return (
      <div className="bg-white dark:bg-[#16213e] rounded-xl border border-gray-100 dark:border-white/10 shadow-sm p-4 h-full">
        <p className="text-sm font-medium text-gray-800 dark:text-white mb-4">Top products</p>
        <p className="text-sm text-gray-400 dark:text-slate-500">No sales data yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#16213e] rounded-xl border border-gray-100 dark:border-white/10 shadow-sm p-4 flex flex-col h-full">
      <p className="text-sm font-medium text-gray-800 dark:text-white mb-4">Top products</p>
      <div className="flex flex-col gap-3">
        {products.map((p) => (
          <div key={p.name} className="flex items-center gap-3">
            <span className="text-xs text-gray-400 dark:text-slate-500 w-36 flex-shrink-0 truncate">
              {p.name}
            </span>
            <div className="flex-1 h-1.5 bg-gray-100 dark:bg-[#1a1a2e] rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${p.percent}%` }}
              />
            </div>
            <span className="text-xs text-gray-400 dark:text-slate-500 w-8 text-right">
              {p.percent}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

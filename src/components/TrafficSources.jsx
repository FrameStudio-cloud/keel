const sources = [
  { label: "Direct", pct: 45, color: "#22c55e" },
  { label: "Social", pct: 30, color: "#3b82f6" },
  { label: "Search", pct: 18, color: "#f59e0b" },
  { label: "Other", pct: 7, color: "#6b7280" },
];

export default function TrafficSources() {
  const max = sources[0].pct;

  return (
    <div className="bg-white dark:bg-[#16213e] rounded-xl border border-gray-100 dark:border-white/10 p-4">
      <p className="text-xs font-medium text-gray-800 dark:text-white mb-3">Traffic Sources</p>
      <div className="flex flex-col gap-3">
        {sources.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <span className="text-[11px] text-gray-500 dark:text-slate-400 w-12 flex-shrink-0">
              {s.label}
            </span>
            <div className="flex-1 h-2.5 bg-gray-100 dark:bg-[#1a1a2e] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${Math.round((s.pct / max) * 100)}%`, backgroundColor: s.color }}
              />
            </div>
            <span className="text-[11px] text-gray-500 dark:text-slate-400 w-8 text-right">
              {s.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

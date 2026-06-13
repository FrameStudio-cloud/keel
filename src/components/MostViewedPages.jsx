const mockPages = [
  { name: "Home", views: 1240 },
  { name: "Products", views: 980 },
  { name: "About", views: 540 },
  { name: "Contact", views: 320 },
  { name: "Gallery", views: 210 },
];

export default function MostViewedPages() {
  const max = mockPages[0].views;

  return (
    <div className="bg-white dark:bg-[#16213e] rounded-xl border border-gray-100 dark:border-white/10 p-4">
      <p className="text-xs font-medium text-gray-800 dark:text-white mb-3">Most Viewed Pages</p>
      <div className="flex flex-col gap-2.5">
        {mockPages.map((p) => (
          <div key={p.name} className="flex items-center gap-2">
            <span className="text-[11px] text-gray-500 dark:text-slate-400 w-16 flex-shrink-0 truncate">
              {p.name}
            </span>
            <div className="flex-1 h-2 bg-gray-100 dark:bg-[#1a1a2e] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.round((p.views / max) * 100)}%`,
                  background: "linear-gradient(90deg, #8b5cf6, #a78bfa)",
                }}
              />
            </div>
            <span className="text-[11px] text-gray-500 dark:text-slate-400 w-10 text-right">
              {Math.round((p.views / max) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

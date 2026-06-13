export default function StatCard({ label, value, change, up }) {
  return (
    <div className="bg-white dark:bg-[#16213e] rounded-xl border border-gray-100 dark:border-white/10 p-4">
      <p className="text-xs text-gray-400 dark:text-slate-500 mb-1">{label}</p>
      <p className="text-2xl font-medium text-gray-800 dark:text-white">{value}</p>
      {change && (
        <p
          className={`text-xs mt-1 flex items-center gap-1 ${up ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}
        >
          {up ? "↑" : "↓"} {change}
        </p>
      )}
    </div>
  );
}

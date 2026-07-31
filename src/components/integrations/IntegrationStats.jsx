export default function IntegrationStats({ stats }) {
  if (!stats?.length) return null;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-white dark:bg-[#16213e] rounded-xl border border-gray-200 dark:border-white/10 p-4 text-center"
        >
          <s.icon className="mx-auto text-blue-500" size={18} />
          <p className="mt-2 text-lg font-bold text-gray-800 dark:text-white">{s.value}</p>
          <p className="text-[11px] text-gray-400 dark:text-slate-500">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

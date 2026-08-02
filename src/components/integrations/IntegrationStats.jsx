export default function IntegrationStats({ stats }) {
  if (!stats?.length) return null;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-surface-1 rounded-xl border border-border-subtle p-4 text-center"
        >
          <s.icon className="mx-auto text-brand" size={18} />
          <p className="mt-2 text-lg font-bold text-text-primary">{s.value}</p>
          <p className="text-[11px] text-text-faint">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

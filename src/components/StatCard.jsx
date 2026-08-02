export default function StatCard({ label, value, change, up }) {
  return (
    <div className="bg-surface-1 rounded-card border border-border-subtle shadow-card p-4">
      <p className="text-xs text-text-faint mb-1">{label}</p>
      <p className="text-2xl font-medium text-text-primary">{value}</p>
      {change && (
        <p
          className={`text-xs mt-1 flex items-center gap-1 ${up ? "text-success" : "text-danger"}`}
        >
          {up ? "↑" : "↓"} {change}
        </p>
      )}
    </div>
  );
}

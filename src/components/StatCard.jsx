export default function StatCard({ label, value, change, up }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-medium text-gray-800">{value}</p>
      {change && (
        <p
          className={`text-xs mt-1 flex items-center gap-1 ${up ? "text-green-600" : "text-red-500"}`}
        >
          {up ? "↑" : "↓"} {change}
        </p>
      )}
    </div>
  );
}

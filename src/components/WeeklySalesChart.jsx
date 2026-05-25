import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function WeeklySalesChart({ data = [] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <p className="text-sm font-medium text-gray-800 mb-4">Sales this week</p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} barSize={28}>
          <XAxis
            dataKey="day"
            tick={{ fontSize: 12, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip
            formatter={(value) => [`KSh ${value.toLocaleString()}`, "Sales"]}
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: "1px solid #f3f4f6",
            }}
          />
          <Bar dataKey="sales" fill="#2563eb" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

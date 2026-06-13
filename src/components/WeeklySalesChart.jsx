import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const ranges = ["day", "week", "month"];

export default function WeeklySalesChart({ data = [], timeRange = "week", onTimeRangeChange }) {
  const isDense = timeRange !== "week";
  const barSize = timeRange === "day" ? 8 : timeRange === "month" ? 4 : 28;

  return (
    <div className="bg-white dark:bg-[#16213e] rounded-xl border border-gray-100 dark:border-white/10 p-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-gray-800 dark:text-white">
          Sales {timeRange === "day" ? "today" : `this ${timeRange}`}
        </p>
        <div className="flex gap-1 bg-gray-100 dark:bg-[#1a1a2e] rounded-lg p-0.5">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => onTimeRangeChange(r)}
              className={`px-2.5 py-1 text-xs rounded-md font-medium capitalize ${
                timeRange === r
                  ? "bg-white dark:bg-[#16213e] text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-500 dark:text-slate-400"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} barSize={barSize} barCategoryGap={isDense ? "10%" : "20%"}>
          <XAxis
            dataKey="day"
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            interval={timeRange === "day" ? 3 : timeRange === "month" ? 5 : 0}
            angle={isDense ? 0 : 0}
            textAnchor={isDense ? "end" : "middle"}
            height={isDense ? 40 : 20}
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

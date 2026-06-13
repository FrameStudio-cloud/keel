import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const ranges = ["day", "week", "month"];

const mockData = {
  day: Array.from({ length: 24 }, (_, i) => ({
    day: `${String(i).padStart(2, "0")}:00`,
    views: Math.floor(Math.random() * 80) + 5,
  })),
  week: [
    { day: "Mon", views: 420 },
    { day: "Tue", views: 380 },
    { day: "Wed", views: 510 },
    { day: "Thu", views: 460 },
    { day: "Fri", views: 630 },
    { day: "Sat", views: 720 },
    { day: "Sun", views: 580 },
  ],
  month: Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return {
      day: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      views: Math.floor(Math.random() * 300) + 50,
    };
  }),
};

export default function PageViewsChart() {
  const [range, setRange] = useState("week");
  const data = mockData[range];
  const isDense = range !== "week";
  const barSize = range === "day" ? 8 : range === "month" ? 4 : 24;

  return (
    <div className="bg-white dark:bg-[#16213e] rounded-xl border border-gray-100 dark:border-white/10 p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-gray-800 dark:text-white">Page Views</p>
        <div className="flex gap-1 bg-gray-100 dark:bg-[#1a1a2e] rounded-lg p-0.5">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2 py-0.5 text-[10px] rounded-md font-medium capitalize ${
                range === r
                  ? "bg-white dark:bg-[#16213e] text-purple-600 dark:text-purple-400 shadow-sm"
                  : "text-gray-500 dark:text-slate-400"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={data} barSize={barSize} barCategoryGap={isDense ? "10%" : "20%"}>
          <XAxis
            dataKey="day"
            tick={{ fontSize: 9, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            interval={range === "day" ? 3 : range === "month" ? 5 : 0}
            angle={isDense ? -40 : 0}
            textAnchor={isDense ? "end" : "middle"}
            height={isDense ? 36 : 18}
          />
          <YAxis hide />
          <Tooltip
            formatter={(value) => [`${value.toLocaleString()} views`, "Views"]}
            contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #f3f4f6" }}
          />
          <Bar dataKey="views" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

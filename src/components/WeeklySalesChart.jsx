import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import useThemeColors from "../hooks/useThemeColors";
import { formatPrice } from "../lib/format";

const ranges = ["day", "week", "month"];

export default function WeeklySalesChart({ data = [], timeRange = "week", onTimeRangeChange }) {
  const isDense = timeRange !== "week";
  const barSize = timeRange === "day" ? 8 : timeRange === "month" ? 4 : 28;
  const theme = useThemeColors();

  return (
    <div className="bg-surface-1 rounded-card border border-border-subtle p-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-text-primary">
          Sales {timeRange === "day" ? "today" : `this ${timeRange}`}
        </p>
        <div className="flex gap-1 bg-surface-2 rounded-lg p-0.5">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => onTimeRangeChange(r)}
              className={`px-2.5 py-1 text-xs rounded-md font-medium capitalize ${
                timeRange === r
                  ? "bg-surface-1 text-brand shadow-sm"
                  : "text-text-muted"
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
            tick={{ fontSize: 10, fill: theme.textFaint }}
            axisLine={false}
            tickLine={false}
            interval={timeRange === "day" ? 3 : timeRange === "month" ? 5 : 0}
            angle={isDense ? 0 : 0}
            textAnchor={isDense ? "end" : "middle"}
            height={isDense ? 40 : 20}
          />
          <YAxis hide />
          <Tooltip
            formatter={(value) => [formatPrice(Number(value)), "Sales"]}
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: `1px solid ${theme.borderSubtle}`,
              background: theme.surface1,
              color: theme.textPrimary,
            }}
          />
          <Bar dataKey="sales" fill={theme.brand} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

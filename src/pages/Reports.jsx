import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import PageLayout from "../components/layout/PageLayout";
import ContextTip from "../components/ContextTip";
import Skeleton from "../components/Skeleton";
import StatCard from "../components/StatCard";
import ProGate from "../components/ProGate";
import SlowMovingStock from "../components/SlowMovingStock";
import { formatPrice } from "../lib/format";
import {
  BarChart, Bar, Line, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from "recharts";
import { useDebounce } from "../hooks/useDebounce";
import { useSettings } from "../hooks/useSettings";
import { useQuery } from "@tanstack/react-query";
import { useSlowMovingStock } from "../hooks/useQueries";
import useThemeColors from "../hooks/useThemeColors";
import { getShopId } from "../lib/shop";
import { supabase } from "../lib/supabase";
import { SERVICE_CATEGORIES } from "../lib/constants";
import { fetchOrders, fetchRevenuePerService } from "../lib/serviceData";

const DATE_RANGES = {
  today: { label: "Today", days: 0 },
  week: { label: "This Week", days: 6 },
  month: { label: "This Month", days: 29 },
  year: { label: "This Year", days: 364 },
  last30: { label: "Last 30 Days", days: 29 },
};

function getRangeStart(key) {
  const now = new Date();
  if (key === "today") {
    const s = new Date(now); s.setHours(0, 0, 0, 0); return s;
  }
  if (key === "week") {
    const s = new Date(now);
    const day = s.getDay();
    s.setDate(s.getDate() - (day === 0 ? 6 : day - 1));
    s.setHours(0, 0, 0, 0); return s;
  }
  if (key === "month") {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
  if (key === "year") {
    return new Date(now.getFullYear(), 0, 1);
  }
  const s = new Date(now);
  s.setDate(s.getDate() - 29);
  s.setHours(0, 0, 0, 0);
  return s;
}

function getPrevRange(start, end) {
  const diff = end.getTime() - start.getTime();
  return { start: new Date(start.getTime() - diff), end: new Date(start.getTime() - 1) };
}

const PAYMENT_COLORS = ["chart1", "chart3", "chart2", "chart4", "chart5", "chart6"];

function pctChange(curr, prev) {
  if (!prev || prev === 0) return curr > 0 ? { text: "New", up: true } : null;
  const pct = Math.round(((curr - prev) / prev) * 100);
  if (pct === 0) return null;
  return { text: `${Math.abs(pct)}% vs prev`, up: pct > 0 };
}

function exportCSV(data, filename, columns) {
  const header = columns.map((c) => c.label).join(",");
  const rows = data.map((row) => columns.map((c) => {
    const val = String(c.value(row)).replace(/\n/g, " ");
    return `"${val.replace(/"/g, '""')}"`;
  }).join(","));
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

const tooltipStyle = (theme) => ({
  fontSize: 12, borderRadius: 8,
  border: `1px solid ${theme.borderSubtle}`,
  background: theme.surface1, color: theme.textPrimary,
});

export default function Reports() {
  const { businessCategory } = useSettings();
  const isService = SERVICE_CATEGORIES.includes(businessCategory);
  const theme = useThemeColors();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [dateRange, setDateRange] = useState("month");
  const { data: slowProducts = [] } = useSlowMovingStock();

  const rangeStart = useMemo(() => getRangeStart(dateRange), [dateRange]);
  const rangeEnd = useMemo(() => new Date(), []);
  const prevRange = useMemo(() => getPrevRange(rangeStart, rangeEnd), [rangeStart, rangeEnd]);

  const { data, isLoading } = useQuery({
    queryKey: ["reportsData", dateRange, isService],
    queryFn: async () => {
      const shopId = await getShopId();
      if (!shopId) return null;

      const startStr = rangeStart.toISOString();
      const endStr = rangeEnd.toISOString();
      const prevStartStr = prevRange.start.toISOString();
      const prevEndStr = prevRange.end.toISOString();

      const margins = isService
        ? await fetchRevenuePerService()
        : (await supabase.rpc("get_profit_margins", { p_shop_id: shopId })).data || [];

      let salesResult;
      let prevSalesResult;
      if (isService) {
        const allOrders = await fetchOrders({ status: "completed", pageSize: 5000 });
        salesResult = allOrders.data.filter((o) => {
          const t = new Date(o.created_at);
          return t >= rangeStart && t <= rangeEnd;
        });
        prevSalesResult = allOrders.data.filter((o) => {
          const t = new Date(o.created_at);
          return t >= prevRange.start && t <= prevRange.end;
        });
      } else {
        const [salesRes, prevSalesRes] = await Promise.all([
          supabase.from("sales").select("amount, quantity, product_name, method, created_at")
            .eq("shop_id", shopId).gte("created_at", startStr).lte("created_at", endStr).limit(5000),
          supabase.from("sales").select("amount, quantity, product_name, method, created_at")
            .eq("shop_id", shopId).gte("created_at", prevStartStr).lte("created_at", prevEndStr).limit(5000),
        ]);
        salesResult = salesRes.data || [];
        prevSalesResult = prevSalesRes.data || [];
      }

      const { data: expData } = await supabase.from("expenses").select("amount, category, payment_method, expense_date")
        .eq("shop_id", shopId).gte("expense_date", startStr.slice(0, 10)).lte("expense_date", endStr.slice(0, 10)).limit(2000);
      const expenses = expData || [];

      return { margins, salesRows: salesResult, prevSalesRows: prevSalesResult, expenses };
    },
    staleTime: 30_000,
  });

  const sales = useMemo(() => data?.salesRows || [], [data]);
  const prevSales = useMemo(() => data?.prevSalesRows || [], [data]);
  const expenses = useMemo(() => data?.expenses || [], [data]);
  const profitData = useMemo(() => data?.margins || [], [data]);

  const kpis = useMemo(() => {
    const revenue = sales.reduce((s, r) => s + (r.amount || r.total || 0), 0);
    const orders = sales.length;
    const aov = orders > 0 ? Math.round(revenue / orders) : 0;
    const totalCost = profitData.reduce((s, p) => s + (p.totalCost || 0), 0);
    const profit = revenue - totalCost;

    const prevRevenue = prevSales.reduce((s, r) => s + (r.amount || r.total || 0), 0);
    const prevOrders = prevSales.length;
    const prevAov = prevOrders > 0 ? Math.round(prevRevenue / prevOrders) : 0;
    const prevCost = profitData.reduce((s, p) => s + (p.totalCost || 0), 0);
    const prevProfit = prevRevenue - prevCost;

    return {
      revenue: { value: revenue, change: pctChange(revenue, prevRevenue) },
      profit: { value: profit, change: pctChange(profit, prevProfit) },
      orders: { value: orders, change: pctChange(orders, prevOrders) },
      aov: { value: aov, change: pctChange(aov, prevAov) },
    };
  }, [sales, prevSales, profitData]);

  const pnlData = useMemo(() => {
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const fmt = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const isWeek = dateRange === "week" || dateRange === "today";
    const buckets = {};

    if (isWeek) {
      for (let i = 0; i < (dateRange === "today" ? 1 : 7); i++) {
        const d = new Date(rangeEnd);
        d.setDate(d.getDate() - i);
        const name = dayNames[d.getDay() === 0 ? 6 : d.getDay() - 1];
        buckets[name] = { revenue: 0, expenses: 0 };
      }
      sales.forEach((s) => {
        const d = new Date(s.created_at || s.created_at);
        const name = dayNames[d.getDay() === 0 ? 6 : d.getDay() - 1];
        if (buckets[name]) buckets[name].revenue += s.amount || s.total || 0;
      });
      expenses.forEach((e) => {
        const d = new Date(e.expense_date);
        const name = dayNames[d.getDay() === 0 ? 6 : d.getDay() - 1];
        if (buckets[name]) buckets[name].expenses += e.amount;
      });
    } else {
      const days = dateRange === "year" ? 12 : Math.ceil((rangeEnd - rangeStart) / 86400000) + 1;
      if (dateRange === "year") {
        for (let m = 0; m < 12; m++) {
          const d = new Date(rangeEnd.getFullYear(), m, 1);
          const name = d.toLocaleDateString("en-US", { month: "short" });
          buckets[name] = { revenue: 0, expenses: 0 };
        }
        sales.forEach((s) => {
          const d = new Date(s.created_at);
          const name = d.toLocaleDateString("en-US", { month: "short" });
          if (buckets[name] !== undefined) buckets[name].revenue += s.amount || s.total || 0;
        });
        expenses.forEach((e) => {
          const d = new Date(e.expense_date);
          const name = d.toLocaleDateString("en-US", { month: "short" });
          if (buckets[name] !== undefined) buckets[name].expenses += e.amount;
        });
      } else {
        for (let i = 0; i < days; i++) {
          const d = new Date(rangeStart);
          d.setDate(d.getDate() + i);
          const name = fmt(d);
          buckets[name] = { revenue: 0, expenses: 0 };
        }
        sales.forEach((s) => {
          const key = fmt(new Date(s.created_at));
          if (buckets[key] !== undefined) buckets[key].revenue += s.amount || s.total || 0;
        });
        expenses.forEach((e) => {
          const key = fmt(new Date(e.expense_date));
          if (buckets[key] !== undefined) buckets[key].expenses += e.amount;
        });
      }
    }

    return Object.entries(buckets).map(([day, v]) => ({
      day, revenue: v.revenue, expenses: v.expenses, profit: v.revenue - v.expenses,
    }));
  }, [sales, expenses, dateRange, rangeStart, rangeEnd]);

  const categoryData = useMemo(() => {
    if (isService) return [];
    const map = {};
    sales.forEach((s) => {
      const cat = s.category || "Uncategorized";
      map[cat] = (map[cat] || 0) + (s.amount || 0);
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [sales, isService]);

  const paymentData = useMemo(() => {
    const map = {};
    sales.forEach((s) => {
      const method = s.method || s.payment_method || "Cash";
      map[method] = (map[method] || 0) + (s.amount || s.total || 0);
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [sales]);

  const expenseCatData = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      const cat = e.category || "General";
      map[cat] = (map[cat] || 0) + e.amount;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  const filteredProfitData = useMemo(() => {
    if (!debouncedSearch) return profitData;
    const q = debouncedSearch.toLowerCase();
    return profitData.filter((p) => p.name?.toLowerCase().includes(q));
  }, [profitData, debouncedSearch]);

  const pnlTotals = useMemo(() => {
    let revenue = 0, expenses = 0;
    for (const r of pnlData) { revenue += r.revenue; expenses += r.expenses; }
    return { revenue, expenses, profit: revenue - expenses };
  }, [pnlData]);

  if (isLoading) {
    return (
      <PageLayout title="Reports" searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
          <Skeleton className="h-10 sm:hidden rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Reports" searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
      <Helmet><title>Reports — Keel</title></Helmet>
      <ContextTip tipKey="reports" title="Reports & Insights">
        See how your business is performing — revenue, profit, top categories, and spending breakdowns for the selected period.
      </ContextTip>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex gap-1 bg-surface-2 rounded-lg p-0.5 overflow-x-auto">
          {Object.entries(DATE_RANGES).map(([key, { label }]) => (
            <button
              key={key}
              onClick={() => setDateRange(key)}
              className={`px-2.5 py-1.5 text-xs rounded-md font-medium whitespace-nowrap transition-colors ${
                dateRange === key
                  ? "bg-surface-1 text-brand shadow-sm"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportCSV(profitData, `profit-margins.csv`, [
              { label: "Product", value: (r) => r.name },
              { label: "Units Sold", value: (r) => r.qty },
              { label: "Revenue", value: (r) => r.revenue },
              { label: "Cost", value: (r) => r.totalCost },
              { label: "Profit", value: (r) => r.profit },
              { label: "Margin %", value: (r) => r.margin },
            ])}
            className="text-xs text-brand hover:underline"
          >CSV</button>
          <button onClick={() => window.print()} className="text-xs text-brand hover:underline">Print</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="Revenue" value={formatPrice(kpis.revenue.value)} change={kpis.revenue.change?.text} up={kpis.revenue.change?.up} />
        <StatCard label="Net Profit" value={formatPrice(kpis.profit.value)} change={kpis.profit.change?.text} up={kpis.profit.change?.up} />
        <StatCard label="Orders" value={kpis.orders.value} change={kpis.orders.change?.text} up={kpis.orders.change?.up} />
        <StatCard label="Avg Order Value" value={formatPrice(kpis.aov.value)} change={kpis.aov.change?.text} up={kpis.aov.change?.up} />
      </div>

      <ProGate feature="reports_pnl">
        <div className="bg-surface-1 rounded-xl border border-border-subtle p-4 mb-6">
          <p className="text-sm font-medium text-text-primary mb-4">Profit & Loss</p>
          {pnlData.length === 0 ? (
            <p className="text-xs text-text-faint text-center py-8">No data for this period</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={240}>
                <ComposedChart data={pnlData} barSize={["week", "today"].includes(dateRange) ? 20 : 12} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.borderSubtle} vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: theme.textFaint }} axisLine={false} tickLine={false}
                    interval={pnlData.length > 10 ? Math.floor(pnlData.length / 6) : 0} />
                  <YAxis hide />
                  <Tooltip formatter={(v) => formatPrice(v)} contentStyle={tooltipStyle(theme)} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="revenue" fill={theme.chart1} radius={[4, 4, 0, 0]} name="Revenue" />
                  <Bar dataKey="expenses" fill={theme.chart5} radius={[4, 4, 0, 0]} name="Expenses" />
                  <Line type="monotone" dataKey="profit" stroke={theme.chart3} strokeWidth={2} dot={false} name="Profit" />
                </ComposedChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-3 gap-3 mt-4 sm:flex sm:justify-center sm:gap-6 text-sm">
                <div className="text-center">
                  <p className="text-xs text-text-faint">Total Revenue</p>
                  <p className="font-semibold text-text-primary">{formatPrice(pnlTotals.revenue)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-text-faint">Total Expenses</p>
                  <p className="font-semibold text-danger">{formatPrice(pnlTotals.expenses)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-text-faint">Net Profit</p>
                  <p className={`font-semibold ${pnlTotals.profit >= 0 ? "text-success" : "text-danger"}`}>
                    {formatPrice(pnlTotals.profit)}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </ProGate>

      {categoryData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="bg-surface-1 rounded-xl border border-border-subtle p-4">
            <p className="text-sm font-medium text-text-primary mb-4">Sales by Category</p>
            {categoryData.length === 0 ? (
              <p className="text-xs text-text-faint text-center py-6">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={Math.max(160, categoryData.length * 32)}>
                <BarChart data={categoryData} layout="vertical" barSize={16} margin={{ left: 8, right: 16 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11, fill: theme.textMuted }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => formatPrice(v)} contentStyle={tooltipStyle(theme)} cursor={{ fill: theme.surface2 }} />
                  <Bar dataKey="value" fill={theme.chart1} radius={[0, 4, 4, 0]} name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {paymentData.length > 0 && (
              <div className="bg-surface-1 rounded-xl border border-border-subtle p-4">
                <p className="text-sm font-medium text-text-primary mb-4">Payment Methods</p>
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width={120} height={120}>
                    <PieChart>
                      <Pie data={paymentData} dataKey="value" cx="50%" cy="50%" innerRadius={30} outerRadius={50} strokeWidth={0}>
                        {paymentData.map((_, i) => (
                          <Cell key={i} fill={theme[PAYMENT_COLORS[i % PAYMENT_COLORS.length]]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => formatPrice(v)} contentStyle={tooltipStyle(theme)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-1.5">
                    {paymentData.map((p, i) => (
                      <div key={p.name} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: theme[PAYMENT_COLORS[i % PAYMENT_COLORS.length]] }} />
                          <span className="text-text-body">{p.name}</span>
                        </span>
                        <span className="font-medium text-text-primary">{formatPrice(p.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {expenseCatData.length > 0 && (
              <div className="bg-surface-1 rounded-xl border border-border-subtle p-4">
                <p className="text-sm font-medium text-text-primary mb-4">Expenses by Category</p>
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width={120} height={120}>
                    <PieChart>
                      <Pie data={expenseCatData} dataKey="value" cx="50%" cy="50%" innerRadius={30} outerRadius={50} strokeWidth={0}>
                        {expenseCatData.map((_, i) => (
                          <Cell key={i} fill={theme[PAYMENT_COLORS[i % PAYMENT_COLORS.length]]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => formatPrice(v)} contentStyle={tooltipStyle(theme)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-1.5">
                    {expenseCatData.map((p, i) => (
                      <div key={p.name} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: theme[PAYMENT_COLORS[i % PAYMENT_COLORS.length]] }} />
                          <span className="text-text-body">{p.name}</span>
                        </span>
                        <span className="font-medium text-text-primary">{formatPrice(p.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {paymentData.length > 0 && categoryData.length === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {paymentData.length > 0 && (
            <div className="bg-surface-1 rounded-xl border border-border-subtle p-4">
              <p className="text-sm font-medium text-text-primary mb-4">Payment Methods</p>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={120} height={120}>
                  <PieChart>
                    <Pie data={paymentData} dataKey="value" cx="50%" cy="50%" innerRadius={30} outerRadius={50} strokeWidth={0}>
                      {paymentData.map((_, i) => (
                        <Cell key={i} fill={theme[PAYMENT_COLORS[i % PAYMENT_COLORS.length]]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatPrice(v)} contentStyle={tooltipStyle(theme)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-1.5">
                  {paymentData.map((p, i) => (
                    <div key={p.name} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: theme[PAYMENT_COLORS[i % PAYMENT_COLORS.length]] }} />
                        <span className="text-text-body">{p.name}</span>
                      </span>
                      <span className="font-medium text-text-primary">{formatPrice(p.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {expenseCatData.length > 0 && (
            <div className="bg-surface-1 rounded-xl border border-border-subtle p-4">
              <p className="text-sm font-medium text-text-primary mb-4">Expenses by Category</p>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={120} height={120}>
                  <PieChart>
                    <Pie data={expenseCatData} dataKey="value" cx="50%" cy="50%" innerRadius={30} outerRadius={50} strokeWidth={0}>
                      {expenseCatData.map((_, i) => (
                        <Cell key={i} fill={theme[PAYMENT_COLORS[i % PAYMENT_COLORS.length]]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatPrice(v)} contentStyle={tooltipStyle(theme)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-1.5">
                  {expenseCatData.map((p, i) => (
                    <div key={p.name} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: theme[PAYMENT_COLORS[i % PAYMENT_COLORS.length]] }} />
                        <span className="text-text-body">{p.name}</span>
                      </span>
                      <span className="font-medium text-text-primary">{formatPrice(p.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-surface-1 rounded-xl border border-border-subtle p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <p className="text-sm font-medium text-text-primary">{isService ? "Revenue per Service" : "Profit Margin per Product"}</p>
        </div>
        {profitData.length === 0 ? (
          <p className="text-xs text-text-faint text-center py-6">
            {isService ? "No completed orders yet." : "No sales data yet. Start logging sales to see profit margins."}
          </p>
        ) : filteredProfitData.length === 0 ? (
          <p className="text-xs text-text-faint text-center py-6">No products match your search.</p>
        ) : (
          <>
            <div className="sm:hidden max-h-80 overflow-y-auto space-y-2">
              {filteredProfitData.map((p) => (
                <div key={p.name} className="bg-surface-2 rounded-xl p-3">
                  <p className="text-sm font-semibold text-text-primary mb-2">{p.name}</p>
                  <div className="grid grid-cols-2 gap-y-1.5 text-xs">
                    <span className="text-text-faint">Sold</span>
                    <span className="text-right text-text-body">{p.qty}</span>
                    <span className="text-text-faint">Revenue</span>
                    <span className="text-right font-medium text-text-primary">{formatPrice(p.revenue)}</span>
                    {!isService && <><span className="text-text-faint">Cost</span>
                    <span className="text-right text-text-body">{formatPrice(p.totalCost)}</span>
                    <span className="text-text-faint">Profit</span>
                    <span className={`text-right font-medium ${p.profit >= 0 ? "text-success" : "text-danger"}`}>{formatPrice(p.profit)}</span></>}
                  </div>
                  {!isService && (
                    <div className="mt-2 pt-2 border-t border-border-subtle flex justify-between items-center">
                      <span className="text-xs text-text-faint">Margin</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        p.margin >= 30 ? "bg-success-muted text-success"
                        : p.margin >= 10 ? "bg-warning-muted text-warning"
                        : "bg-danger-muted text-danger"
                      }`}>{p.margin}%</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="hidden sm:block max-h-80 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-surface-1">
                  <tr className="border-b border-border-subtle">
                    <th className="px-3 py-2.5 text-xs font-semibold text-left text-text-muted uppercase">{isService ? "Service" : "Product"}</th>
                    <th className="px-3 py-2.5 text-xs font-semibold text-right text-text-muted uppercase">Sold</th>
                    <th className="px-3 py-2.5 text-xs font-semibold text-right text-text-muted uppercase">Revenue</th>
                    {!isService && <><th className="px-3 py-2.5 text-xs font-semibold text-right text-text-muted uppercase">Cost</th>
                    <th className="px-3 py-2.5 text-xs font-semibold text-right text-text-muted uppercase">Profit</th>
                    <th className="px-3 py-2.5 text-xs font-semibold text-right text-text-muted uppercase">Margin</th></>}
                  </tr>
                </thead>
                <tbody>
                  {filteredProfitData.map((p, i) => (
                    <tr key={p.name} className={`border-b border-border-subtle hover:bg-surface-2 transition-colors ${i === filteredProfitData.length - 1 ? "border-0" : ""}`}>
                      <td className="px-3 py-2.5 font-medium text-text-primary">{p.name}</td>
                      <td className="px-3 py-2.5 text-right text-text-body">{p.qty}</td>
                      <td className="px-3 py-2.5 text-right font-medium text-text-primary">{formatPrice(p.revenue)}</td>
                      {!isService && <><td className="px-3 py-2.5 text-right text-text-body">{formatPrice(p.totalCost)}</td>
                      <td className={`px-3 py-2.5 text-right font-medium ${p.profit >= 0 ? "text-success" : "text-danger"}`}>
                        {formatPrice(p.profit)}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                          p.margin >= 30 ? "bg-success-muted text-success"
                          : p.margin >= 10 ? "bg-warning-muted text-warning"
                          : "bg-danger-muted text-danger"
                        }`}>{p.margin}%</span>
                      </td></>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {slowProducts.length > 0 && (
        <SlowMovingStock />
      )}
    </PageLayout>
  );
}

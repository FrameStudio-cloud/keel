import { useState, useEffect, useMemo, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import PageLayout from "../components/layout/PageLayout";
import ContextTip from "../components/ContextTip";
import Skeleton from "../components/Skeleton";
import ProGate from "../components/ProGate";
import { getShopId } from "../lib/shop";
import { supabase } from "../lib/supabase";
import { formatPrice } from "../lib/format";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useDebounce } from "../hooks/useDebounce";
import { useSettings } from "../hooks/useSettings";
import useThemeColors from "../hooks/useThemeColors";
import { SERVICE_CATEGORIES } from "../lib/constants";
import { fetchOrders, fetchRevenuePerService } from "../lib/serviceData";

export default function Reports() {
  const { businessCategory } = useSettings();
  const isService = SERVICE_CATEGORIES.includes(businessCategory);
  const theme = useThemeColors();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [timeRange, setTimeRange] = useState("week");
  const [profitData, setProfitData] = useState([]);
  const [pnlData, setPnlData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProfitMargins = useCallback(async () => {
    const shopId = await getShopId();
    if (!shopId) return [];
    if (isService) {
      return await fetchRevenuePerService();
    }
    const { data } = await supabase.rpc("get_profit_margins", { p_shop_id: shopId });
    return data || [];
  }, [isService]);

  const fetchPnl = useCallback(async (range) => {
    const shopId = await getShopId();
    if (!shopId) return;

    const now = new Date();
    let start;

    if (range === "week") {
      start = new Date(now);
      start.setDate(start.getDate() - 6);
    } else {
      start = new Date(now);
      start.setDate(start.getDate() - 29);
    }
    start.setHours(0, 0, 0, 0);

    const [expensesRes] = await Promise.all([
      supabase
        .from("expenses")
        .select("amount, expense_date")
        .eq("shop_id", shopId)
        .gte("expense_date", start.toISOString().slice(0, 10))
        .limit(2000),
    ]);

    const expenses = expensesRes.data || [];
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const dayTotals = {};
    const expenseTotals = {};

    if (isService) {
      const result = await fetchOrders({ status: "completed", pageSize: 2000 });
      const completed = result.data;

      if (range === "week") {
        for (let i = 0; i < 7; i++) {
          const d = new Date(now);
          d.setDate(d.getDate() - (6 - i));
          const name = dayNames[d.getDay() === 0 ? 6 : d.getDay() - 1];
          dayTotals[name] = 0;
          expenseTotals[name] = 0;
        }
        completed.forEach((o) => {
          const d = new Date(o.created_at);
          const name = dayNames[d.getDay() === 0 ? 6 : d.getDay() - 1];
          if (dayTotals[name] !== undefined) dayTotals[name] += o.total;
        });
      } else {
        const fmt = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        for (let i = 29; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          dayTotals[fmt(d)] = 0;
          expenseTotals[fmt(d)] = 0;
        }
        completed.forEach((o) => {
          const key = fmt(new Date(o.created_at));
          if (dayTotals[key] !== undefined) dayTotals[key] += o.total;
        });
      }
    } else {
      const [salesRes] = await Promise.all([
        supabase
          .from("sales")
          .select("amount, created_at")
          .eq("shop_id", shopId)
          .gte("created_at", start.toISOString())
          .limit(2000),
      ]);

      const sales = salesRes.data || [];

      if (range === "week") {
        for (let i = 0; i < 7; i++) {
          const d = new Date(now);
          d.setDate(d.getDate() - (6 - i));
          const name = dayNames[d.getDay() === 0 ? 6 : d.getDay() - 1];
          dayTotals[name] = 0;
          expenseTotals[name] = 0;
        }
        sales.forEach((s) => {
          const d = new Date(s.created_at);
          const name = dayNames[d.getDay() === 0 ? 6 : d.getDay() - 1];
          if (dayTotals[name] !== undefined) dayTotals[name] += s.amount;
        });
      } else {
        const fmt = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        for (let i = 29; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          dayTotals[fmt(d)] = 0;
          expenseTotals[fmt(d)] = 0;
        }
        sales.forEach((s) => {
          const key = fmt(new Date(s.created_at));
          if (dayTotals[key] !== undefined) dayTotals[key] += s.amount;
        });
      }
    }

    expenses.forEach((e) => {
      if (range === "week") {
        const d = new Date(e.expense_date);
        const name = dayNames[d.getDay() === 0 ? 6 : d.getDay() - 1];
        if (expenseTotals[name] !== undefined) expenseTotals[name] += e.amount;
      } else {
        const key = new Date(e.expense_date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        if (expenseTotals[key] !== undefined) expenseTotals[key] += e.amount;
      }
    });

    const labels = Object.keys(dayTotals);
    setPnlData(
      labels.map((label) => ({
        day: label,
        revenue: dayTotals[label],
        expenses: expenseTotals[label],
        profit: dayTotals[label] - expenseTotals[label],
      }))
    );
  }, [isService]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const margins = await fetchProfitMargins();
      if (cancelled) return;
      setProfitData(margins);
      await fetchPnl(timeRange);
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [timeRange, fetchProfitMargins, fetchPnl]);

  function exportCSV(data, filename, columns) {
    const header = columns.map((c) => c.label).join(",");
    const rows = data.map((row) => columns.map((c) => {
      const val = String(c.value(row));
      return `"${val.replace(/"/g, '""')}"`;
    }).join(","));
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportPDF() {
    window.print();
  }

  const filteredProfitData = useMemo(() => {
    if (!debouncedSearch) return profitData;
    const q = debouncedSearch.toLowerCase();
    return profitData.filter((p) => p.name?.toLowerCase().includes(q));
  }, [profitData, debouncedSearch]);

  if (loading) {
    return (
      <PageLayout title="Reports" searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
        <div className="space-y-6">
          <Skeleton className="h-10 sm:hidden rounded-xl" />
          <Skeleton className="h-64 sm:h-52 rounded-xl" />
          <Skeleton className="h-64 sm:h-52 rounded-xl" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Reports" searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
      <Helmet><title>Reports — Keel</title></Helmet>
      <ContextTip tipKey="reports" title="Reports & Insights">
        See how each product or service performs — profit margins, revenue, costs. The P&amp;L chart shows your daily profit and loss over a week or month.
      </ContextTip>
      <div className="bg-surface-1 rounded-xl border border-border-subtle p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <p className="text-sm font-medium text-text-primary">{isService ? "Revenue per Service" : "Profit Margin per Product"}</p>
          <div className="flex gap-2">
            <ProGate feature="reports_pnl">
              <button
                onClick={() => exportCSV(profitData, isService ? "service-revenue.csv" : "profit-margins.csv", isService ? [
                  { label: "Service", value: (r) => `"${r.name}"` },
                  { label: "Orders", value: (r) => r.qty },
                  { label: "Revenue", value: (r) => r.revenue },
                ] : [
                  { label: "Product", value: (r) => `"${r.name}"` },
                  { label: "Units Sold", value: (r) => r.qty },
                  { label: "Revenue", value: (r) => r.revenue },
                  { label: "Cost", value: (r) => r.totalCost },
                  { label: "Profit", value: (r) => r.profit },
                  { label: "Margin %", value: (r) => r.margin },
                ])}
                className="text-xs text-brand hover:underline"
              >
                CSV
              </button>
            </ProGate>
            <ProGate feature="reports_pnl">
              <button onClick={exportPDF} className="text-xs text-brand hover:underline">PDF</button>
            </ProGate>
          </div>
        </div>
        {profitData.length === 0 ? (
          <p className="text-xs text-text-faint text-center py-6">
            {isService ? "No completed orders yet." : "No sales data yet. Start logging sales to see profit margins."}
          </p>
        ) : filteredProfitData.length === 0 ? (
          <p className="text-xs text-text-faint text-center py-6">
            No products match your search.
          </p>
        ) : (
          <>
            <div className="sm:hidden space-y-2">
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
                    }`}>
                      {p.margin}%
                    </span>
                  </div>
                  )}
                </div>
              ))}
            </div>
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-subtle bg-surface-0">
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
                        }`}>
                          {p.margin}%
                        </span>
                      </td></>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <ProGate feature="reports_pnl">
        <div className="bg-surface-1 rounded-xl border border-border-subtle p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <p className="text-sm font-medium text-text-primary">Profit & Loss</p>
            <div className="flex items-center gap-3">
              <div className="flex gap-1 bg-surface-2 rounded-lg p-0.5">
                {["week", "month"].map((r) => (
                  <button
                    key={r}
                    onClick={() => setTimeRange(r)}
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
              <button
                onClick={() => exportCSV(pnlData, `pnl-${timeRange}.csv`, [
                  { label: "Period", value: (r) => `"${r.day}"` },
                  { label: "Revenue", value: (r) => r.revenue },
                  { label: "Expenses", value: (r) => r.expenses },
                  { label: "Profit", value: (r) => r.profit },
                ])}
                className="text-xs text-brand hover:underline"
              >
                CSV
              </button>
              <button onClick={exportPDF} className="text-xs text-brand hover:underline">PDF</button>
            </div>
          </div>
          {pnlData.length === 0 ? (
            <p className="text-xs text-text-faint text-center py-8">No data for this period</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={pnlData} barSize={timeRange === "week" ? 20 : 6} barCategoryGap={timeRange === "week" ? "20%" : "10%"}>
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: theme.textFaint }} axisLine={false} tickLine={false} interval={timeRange === "month" ? 5 : 0} />
                  <YAxis hide />
                  <Tooltip
                    formatter={(value) => formatPrice(value)}
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 8,
                      border: `1px solid ${theme.borderSubtle}`,
                      background: theme.surface1,
                      color: theme.textPrimary,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="revenue" fill={theme.chart1} radius={[4, 4, 0, 0]} name="Revenue" />
                  <Bar dataKey="expenses" fill={theme.danger} radius={[4, 4, 0, 0]} name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-3 gap-3 mt-3 sm:flex sm:justify-center sm:gap-6 text-sm">
                <div className="text-center">
                  <p className="text-xs text-text-faint">Total Revenue</p>
                  <p className="font-semibold text-text-primary">
                    {formatPrice(pnlData.reduce((s, r) => s + r.revenue, 0))}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-text-faint">Total Expenses</p>
                  <p className="font-semibold text-danger">
                    {formatPrice(pnlData.reduce((s, r) => s + r.expenses, 0))}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-text-faint">Net Profit</p>
                  <p className={`font-semibold ${pnlData.reduce((s, r) => s + r.profit, 0) >= 0 ? "text-success" : "text-danger"}`}>
                    {formatPrice(pnlData.reduce((s, r) => s + r.profit, 0))}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </ProGate>
    </PageLayout>
  );
}

import { useState, useEffect, useMemo } from "react";
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

export default function Reports() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [timeRange, setTimeRange] = useState("week");
  const [profitData, setProfitData] = useState([]);
  const [pnlData, setPnlData] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchProfitMargins() {
    const shopId = await getShopId();
    if (!shopId) return [];
    const { data } = await supabase.rpc("get_profit_margins", { p_shop_id: shopId });
    return data || [];
  }

  async function fetchPnl(range) {
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

    const [salesRes, expensesRes] = await Promise.all([
      supabase
        .from("sales")
        .select("amount, created_at")
        .eq("shop_id", shopId)
        .gte("created_at", start.toISOString())
        .limit(2000),
      supabase
        .from("expenses")
        .select("amount, expense_date")
        .eq("shop_id", shopId)
        .gte("expense_date", start.toISOString().slice(0, 10))
        .limit(2000),
    ]);

    const sales = salesRes.data || [];
    const expenses = expensesRes.data || [];

    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const dayTotals = {};
    const expenseTotals = {};

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
      expenses.forEach((e) => {
        const d = new Date(e.expense_date);
        const name = dayNames[d.getDay() === 0 ? 6 : d.getDay() - 1];
        if (expenseTotals[name] !== undefined) expenseTotals[name] += e.amount;
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
      expenses.forEach((e) => {
        const key = fmt(new Date(e.expense_date));
        if (expenseTotals[key] !== undefined) expenseTotals[key] += e.amount;
      });
    }

    const labels = Object.keys(dayTotals);
    setPnlData(
      labels.map((label) => ({
        day: label,
        revenue: dayTotals[label],
        expenses: expenseTotals[label],
        profit: dayTotals[label] - expenseTotals[label],
      }))
    );
  }

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
  }, [timeRange]);

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
      <ContextTip tipKey="reports" title="Tip">
        <p>View profit margins per product and export P&amp;L reports as CSV or PDF.</p>
      </ContextTip>
      <div className="bg-white dark:bg-[#16213e] rounded-xl border border-gray-100 dark:border-white/10 p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <p className="text-sm font-medium text-gray-800 dark:text-white">Profit Margin per Product</p>
          <div className="flex gap-2">
            <ProGate feature="reports_pnl">
              <button
                onClick={() => exportCSV(profitData, "profit-margins.csv", [
                  { label: "Product", value: (r) => `"${r.name}"` },
                  { label: "Units Sold", value: (r) => r.qty },
                  { label: "Revenue", value: (r) => r.revenue },
                  { label: "Cost", value: (r) => r.totalCost },
                  { label: "Profit", value: (r) => r.profit },
                  { label: "Margin %", value: (r) => r.margin },
                ])}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                CSV
              </button>
            </ProGate>
            <ProGate feature="reports_pnl">
              <button onClick={exportPDF} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">PDF</button>
            </ProGate>
          </div>
        </div>
        {profitData.length === 0 ? (
          <p className="text-xs text-gray-400 dark:text-slate-500 text-center py-6">
            No sales data yet. Start logging sales to see profit margins.
          </p>
        ) : filteredProfitData.length === 0 ? (
          <p className="text-xs text-gray-400 dark:text-slate-500 text-center py-6">
            No products match your search.
          </p>
        ) : (
          <>
            <div className="sm:hidden space-y-2">
              {filteredProfitData.map((p) => (
                <div key={p.name} className="bg-slate-50 dark:bg-[#1a1a2e] rounded-xl p-3">
                  <p className="text-sm font-semibold text-gray-800 dark:text-white mb-2">{p.name}</p>
                  <div className="grid grid-cols-2 gap-y-1.5 text-xs">
                    <span className="text-gray-400 dark:text-slate-500">Sold</span>
                    <span className="text-right text-gray-700 dark:text-slate-300">{p.qty}</span>
                    <span className="text-gray-400 dark:text-slate-500">Revenue</span>
                    <span className="text-right font-medium text-gray-800 dark:text-white">{formatPrice(p.revenue)}</span>
                    <span className="text-gray-400 dark:text-slate-500">Cost</span>
                    <span className="text-right text-gray-600 dark:text-slate-400">{formatPrice(p.totalCost)}</span>
                    <span className="text-gray-400 dark:text-slate-500">Profit</span>
                    <span className={`text-right font-medium ${p.profit >= 0 ? "text-green-500" : "text-red-500"}`}>{formatPrice(p.profit)}</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-200 dark:border-white/10 flex justify-between items-center">
                    <span className="text-xs text-gray-400 dark:text-slate-500">Margin</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      p.margin >= 30 ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400"
                      : p.margin >= 10 ? "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400"
                      : "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400"
                    }`}>
                      {p.margin}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1a1a2e]">
                    <th className="px-3 py-2.5 text-xs font-semibold text-left text-gray-500 dark:text-slate-400 uppercase">Product</th>
                    <th className="px-3 py-2.5 text-xs font-semibold text-right text-gray-500 dark:text-slate-400 uppercase">Sold</th>
                    <th className="px-3 py-2.5 text-xs font-semibold text-right text-gray-500 dark:text-slate-400 uppercase">Revenue</th>
                    <th className="px-3 py-2.5 text-xs font-semibold text-right text-gray-500 dark:text-slate-400 uppercase">Cost</th>
                    <th className="px-3 py-2.5 text-xs font-semibold text-right text-gray-500 dark:text-slate-400 uppercase">Profit</th>
                    <th className="px-3 py-2.5 text-xs font-semibold text-right text-gray-500 dark:text-slate-400 uppercase">Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProfitData.map((p, i) => (
                    <tr key={p.name} className={`border-b border-white/5 hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-colors ${i === filteredProfitData.length - 1 ? "border-0" : ""}`}>
                      <td className="px-3 py-2.5 font-medium text-gray-800 dark:text-white">{p.name}</td>
                      <td className="px-3 py-2.5 text-right text-gray-600 dark:text-slate-400">{p.qty}</td>
                      <td className="px-3 py-2.5 text-right font-medium text-gray-800 dark:text-white">{formatPrice(p.revenue)}</td>
                      <td className="px-3 py-2.5 text-right text-gray-600 dark:text-slate-400">{formatPrice(p.totalCost)}</td>
                      <td className={`px-3 py-2.5 text-right font-medium ${p.profit >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {formatPrice(p.profit)}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                          p.margin >= 30 ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400"
                          : p.margin >= 10 ? "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400"
                          : "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400"
                        }`}>
                          {p.margin}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <ProGate feature="reports_pnl">
        <div className="bg-white dark:bg-[#16213e] rounded-xl border border-gray-100 dark:border-white/10 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <p className="text-sm font-medium text-gray-800 dark:text-white">Profit & Loss</p>
            <div className="flex items-center gap-3">
              <div className="flex gap-1 bg-gray-100 dark:bg-[#1a1a2e] rounded-lg p-0.5">
                {["week", "month"].map((r) => (
                  <button
                    key={r}
                    onClick={() => setTimeRange(r)}
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
              <button
                onClick={() => exportCSV(pnlData, `pnl-${timeRange}.csv`, [
                  { label: "Period", value: (r) => `"${r.day}"` },
                  { label: "Revenue", value: (r) => r.revenue },
                  { label: "Expenses", value: (r) => r.expenses },
                  { label: "Profit", value: (r) => r.profit },
                ])}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                CSV
              </button>
              <button onClick={exportPDF} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">PDF</button>
            </div>
          </div>
          {pnlData.length === 0 ? (
            <p className="text-xs text-gray-400 dark:text-slate-500 text-center py-8">No data for this period</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={pnlData} barSize={timeRange === "week" ? 20 : 6} barCategoryGap={timeRange === "week" ? "20%" : "10%"}>
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} interval={timeRange === "month" ? 5 : 0} />
                  <YAxis hide />
                  <Tooltip
                    formatter={(value) => formatPrice(value)}
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #f3f4f6" }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} name="Revenue" />
                  <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-3 gap-3 mt-3 sm:flex sm:justify-center sm:gap-6 text-sm">
                <div className="text-center">
                  <p className="text-xs text-gray-400 dark:text-slate-500">Total Revenue</p>
                  <p className="font-semibold text-gray-800 dark:text-white">
                    {formatPrice(pnlData.reduce((s, r) => s + r.revenue, 0))}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400 dark:text-slate-500">Total Expenses</p>
                  <p className="font-semibold text-red-500">
                    {formatPrice(pnlData.reduce((s, r) => s + r.expenses, 0))}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400 dark:text-slate-500">Net Profit</p>
                  <p className={`font-semibold ${pnlData.reduce((s, r) => s + r.profit, 0) >= 0 ? "text-green-500" : "text-red-500"}`}>
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

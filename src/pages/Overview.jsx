import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";

import PageLayout from "../components/layout/PageLayout";
import AnnouncementBanner from "../components/AnnouncementBanner";
import StatCard from "../components/StatCard";
import WeeklySalesChart from "../components/WeeklySalesChart";
import TopProducts from "../components/TopProducts";
import SlowMovingStock from "../components/SlowMovingStock";
import Skeleton from "../components/Skeleton";
import { formatPrice } from "../lib/format";
import { useSettings } from "../hooks/useSettings";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { getShopId } from "../lib/shop";
import { FiSun, FiMoon, FiCloud } from "react-icons/fi";

const pageColors = { Instagram: "#E4405F", WhatsApp: "#25D366", TikTok: "#000000", Google: "#4285F4", Facebook: "#1877F2", Direct: "#6b7280" };

function buildChartData(raw, range) {
  if (!raw?.length) return [];
  const now = new Date();
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const byDay = {};
  raw.forEach(({ day, sales }) => {
    const d = new Date(day);
    const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    byDay[key] = (byDay[key] || 0) + sales;
  });

  if (range === "day") {
    const hours = {};
    for (let i = 0; i < 24; i++) hours[i] = 0;
    raw.forEach(({ day, sales }) => {
      const h = new Date(day).getHours();
      hours[h] += sales;
    });
    return Object.entries(hours).map(([h, sales]) => ({ day: `${h.padStart(2, "0")}:00`, sales }));
  }

  if (range === "week") {
    const totals = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      totals[dayNames[d.getDay() === 0 ? 6 : d.getDay() - 1]] = 0;
    }
    raw.forEach(({ day, sales }) => {
      const d = new Date(day);
      const name = dayNames[d.getDay() === 0 ? 6 : d.getDay() - 1];
      if (name in totals) totals[name] += sales;
    });
    return Object.entries(totals).map(([day, sales]) => ({ day, sales }));
  }

  const totals = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    totals[d.toLocaleDateString("en-US", { month: "short", day: "numeric" })] = 0;
  }
  Object.entries(byDay).forEach(([key, sales]) => {
    if (key in totals) totals[key] += sales;
  });
  return Object.entries(totals).map(([day, sales]) => ({ day, sales }));
}

export default function Overview() {
  const { storeName, lowStockThreshold, websiteUrl } = useSettings();
  const hasWebsite = !!websiteUrl;
  const [timeRange, setTimeRange] = useState("week");

  const { data, isLoading } = useQuery({
    queryKey: ["dashboardSummary"],
    queryFn: async () => {
      const shopId = await getShopId();
      if (!shopId) return null;
      const { data, error } = await supabase
        .rpc("get_dashboard_summary", { p_shop_id: shopId, p_threshold: lowStockThreshold ?? 6 });
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });

  useEffect(() => {
    supabase.rpc("cleanup_expired_shops").then(() => {}).catch(() => {});
  }, []);

  const chartData = buildChartData(data?.chartData, timeRange);

  const topProducts = !data?.topProducts?.length ? [] : (() => {
    const max = data.topProducts[0].qty || 1;
    return data.topProducts.map((p) => ({ name: p.product_name, percent: Math.round((p.qty / max) * 100) }));
  })();

  const pageViews = !data?.pageViews ? null : (() => {
    const pv = data.pageViews;
    const topPagesMax = pv.topPages?.[0]?.count || 1;
    const prodMax = pv.viewedProducts?.[0]?.count || 1;
    return {
      total: pv.total,
      today: pv.today,
      topPages: (pv.topPages || []).map((p) => ({ name: p.page, count: p.count, pct: Math.round((p.count / topPagesMax) * 100) })),
      trafficSources: (pv.trafficSources || []).map((s) => ({
        label: s.label,
        count: s.count,
        color: pageColors[s.label] || "#8b5cf6",
        pct: pv.total ? Math.round((s.count / pv.total) * 100) : 0,
      })),
      viewedProducts: (pv.viewedProducts || []).map((p) => ({ name: p.name, count: p.count, pct: Math.round((p.count / prodMax) * 100) })),
    };
  })();

  const stats = {
    salesToday: data?.todaySales?.amount || 0,
    itemsSold: data?.todaySales?.quantity || 0,
    lowStock: data?.lowStockCount || 0,
    totalProducts: data?.totalProducts || 0,
  };

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" :
    hour < 17 ? "Good afternoon" :
    "Good evening";

  const GreetingIcon = hour < 12 ? FiSun : hour < 17 ? FiCloud : FiMoon;

  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <PageLayout title="Overview">
      <Helmet><title>Overview — Keel</title></Helmet>
      {isLoading ? (
        <div className="space-y-6">
          <div className="flex gap-4 items-start">
            <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-6 w-64 rounded-lg" />
              <Skeleton className="h-4 w-48 rounded-lg" />
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      ) : (
        <>
          <div className="mb-7 flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="hidden sm:flex w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 dark:from-amber-400/10 dark:to-orange-500/10 items-center justify-center shrink-0 mt-0.5">
                <GreetingIcon className="text-lg text-amber-500 dark:text-amber-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                  {greeting}, {storeName || "there"}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {todayStr} &middot; Here's your daily snapshot
                </p>
              </div>
            </div>
          </div>
          <AnnouncementBanner />
          <p className="text-[11px] font-semibold tracking-widest uppercase text-slate-500 dark:text-slate-400 mb-3">Sales Overview</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <StatCard label="Sales today" value={formatPrice(stats.salesToday)} change={stats.salesToday > 0 ? "From today's transactions" : "No sales yet today"} up={stats.salesToday > 0} />
            <StatCard label="Items sold" value={stats.itemsSold} change={stats.itemsSold > 0 ? "Units today" : "None yet"} up={stats.itemsSold > 0} />
            <StatCard label="Low stock alerts" value={stats.lowStock} change={stats.lowStock > 0 ? "Products need restocking" : "All stock healthy"} up={stats.lowStock === 0} />
            <StatCard label="Total products" value={stats.totalProducts} change="In your inventory" up />
          </div>
          <p className="text-[11px] font-semibold tracking-widest uppercase text-slate-500 dark:text-slate-400 mb-3">Performance</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="flex flex-col gap-4 h-full">
              <div className="h-[248px] shrink-0">
                <WeeklySalesChart data={chartData} timeRange={timeRange} onTimeRangeChange={setTimeRange} />
              </div>
              <div className="flex-1 min-h-0">
                <TopProducts products={topProducts} />
              </div>
            </div>
            <SlowMovingStock compact />
          </div>
          {hasWebsite && (
            <>
              <p className="text-[11px] font-semibold tracking-widest uppercase text-slate-500 dark:text-slate-400 mt-8 mb-3">Website Analytics</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard label="Total Views" value={(pageViews?.total || 0).toLocaleString()} change="All time" up />
                <StatCard label="Today" value={(pageViews?.today || 0).toLocaleString()} change="Visits today" up={pageViews?.today > 0} />
                <StatCard label="Most viewed" value={pageViews?.topPages?.[0]?.name || "—"} change={`${pageViews?.topPages?.[0]?.count || 0} visits`} up />
                <StatCard label="Pages" value={pageViews?.topPages?.length || 0} change="Tracked pages" up />
              </div>
              <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
                {pageViews?.topPages?.length > 0 && (
                  <div className="bg-white dark:bg-[#16213e] rounded-xl border border-gray-100 dark:border-white/10 p-4">
                    <p className="text-xs font-medium text-gray-800 dark:text-white mb-3">Most Viewed Pages</p>
                  <div className="flex flex-col gap-2.5">
                    {pageViews.topPages.map((p) => (
                      <div key={p.name} className="flex items-center gap-2">
                        <span className="text-[11px] text-gray-500 dark:text-slate-400 w-16 flex-shrink-0 truncate">{p.name}</span>
                        <div className="flex-1 h-2 bg-gray-100 dark:bg-[#1a1a2e] rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-purple-500" style={{ width: `${p.pct}%` }} />
                        </div>
                        <span className="text-[11px] text-gray-500 dark:text-slate-400 w-10 text-right">{p.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {pageViews?.trafficSources?.length > 0 && (
                <div className="bg-white dark:bg-[#16213e] rounded-xl border border-gray-100 dark:border-white/10 p-4">
                  <p className="text-xs font-medium text-gray-800 dark:text-white mb-3">Traffic Sources</p>
                  <div className="flex flex-col gap-2.5">
                    {pageViews.trafficSources.map((s) => (
                      <div key={s.label} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                        <span className="text-[11px] text-gray-500 dark:text-slate-400 w-20 flex-shrink-0">{s.label}</span>
                        <div className="flex-1 h-2 bg-gray-100 dark:bg-[#1a1a2e] rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${s.pct}%`, backgroundColor: s.color }} />
                        </div>
                        <span className="text-[11px] text-gray-500 dark:text-slate-400 w-10 text-right">{s.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {pageViews?.viewedProducts?.length > 0 && (
                <div className="bg-white dark:bg-[#16213e] rounded-xl border border-gray-100 dark:border-white/10 p-4">
                  <p className="text-xs font-medium text-gray-800 dark:text-white mb-3">Top Viewed Products</p>
                  <div className="flex flex-col gap-2.5">
                    {pageViews.viewedProducts.map((p) => (
                      <div key={p.name} className="flex items-center gap-2">
                        <span className="text-[11px] text-gray-500 dark:text-slate-400 w-24 flex-shrink-0 truncate">{p.name}</span>
                        <div className="flex-1 h-2 bg-gray-100 dark:bg-[#1a1a2e] rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${p.pct}%` }} />
                        </div>
                        <span className="text-[11px] text-gray-500 dark:text-slate-400 w-10 text-right">{p.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </>
    )}
    </PageLayout>
  );
}

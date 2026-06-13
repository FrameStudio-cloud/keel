import { useEffect, useState } from "react";
import PageLayout from "../components/layout/PageLayout";
import StatCard from "../components/StatCard";
import WeeklySalesChart from "../components/WeeklySalesChart";
import TopProducts from "../components/TopProducts";
import SlowMovingStock from "../components/SlowMovingStock";
import TourGuide from "../components/TourGuide";
import PageViewsChart from "../components/PageViewsChart";
import MostViewedPages from "../components/MostViewedPages";
import TrafficSources from "../components/TrafficSources";
import { getShopId } from "../lib/shop";
import { supabase } from "../lib/supabase";

export default function Overview() {
  const [stats, setStats] = useState({
    salesToday: 0,
    itemsSold: 0,
    lowStock: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [timeRange, setTimeRange] = useState("week");
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchStats() {
    const shopId = await getShopId();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: todaySales } = await supabase
      .from("sales")
      .select("amount, quantity")
      .eq("shop_id", shopId)
      .gte("created_at", today.toISOString());

    const salesToday = todaySales?.reduce((sum, s) => sum + s.amount, 0) || 0;
    const itemsSold = todaySales?.reduce((sum, s) => sum + s.quantity, 0) || 0;

    const { data: lowStockProducts } = await supabase
      .from("products")
      .select("id")
      .eq("shop_id", shopId)
      .lte("stock", 6);

    const { count } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("shop_id", shopId);

    setStats({
      salesToday,
      itemsSold,
      lowStock: lowStockProducts?.length || 0,
      totalProducts: count || 0,
    });
  }

  async function fetchChartData(range) {
    const shopId = await getShopId();
    const now = new Date();
    let start;

    if (range === "day") {
      start = new Date(now);
      start.setHours(0, 0, 0, 0);
    } else if (range === "week") {
      start = new Date(now);
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
    } else {
      start = new Date(now);
      start.setDate(start.getDate() - 29);
      start.setHours(0, 0, 0, 0);
    }

    const { data } = await supabase
      .from("sales")
      .select("amount, created_at")
      .eq("shop_id", shopId)
      .gte("created_at", start.toISOString());

    if (!data) return;

    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    if (range === "day") {
      const hours = {};
      for (let i = 0; i < 24; i++) hours[i] = 0;
      data.forEach((s) => {
        const h = new Date(s.created_at).getHours();
        hours[h] += s.amount;
      });
      const result = Object.entries(hours).map(([h, sales]) => ({
        day: `${h.padStart(2, "0")}:00`,
        sales,
      }));
      setChartData(result);
    } else if (range === "week") {
      const dayTotals = {};
      for (let i = 0; i < 7; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() - (6 - i));
        dayTotals[dayNames[d.getDay() === 0 ? 6 : d.getDay() - 1]] = 0;
      }
      data.forEach((s) => {
        const d = new Date(s.created_at);
        const name = dayNames[d.getDay() === 0 ? 6 : d.getDay() - 1];
        if (dayTotals[name] !== undefined) dayTotals[name] += s.amount;
      });
      const result = Object.entries(dayTotals).map(([day, sales]) => ({ day, sales }));
      setChartData(result);
    } else {
      const dayTotals = {};
      const fmt = (d) =>
        d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        dayTotals[fmt(d)] = 0;
      }
      data.forEach((s) => {
        const key = fmt(new Date(s.created_at));
        if (dayTotals[key] !== undefined) dayTotals[key] += s.amount;
      });
      const result = Object.entries(dayTotals).map(([day, sales]) => ({ day, sales }));
      setChartData(result);
    }
  }

  async function fetchTopProducts() {
    const shopId = await getShopId();
    const { data } = await supabase
      .from("sales")
      .select("product_name, quantity")
      .eq("shop_id", shopId);

    if (!data) return;

    const totals = {};
    data.forEach((s) => {
      totals[s.product_name] = (totals[s.product_name] || 0) + s.quantity;
    });

    const sorted = Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    const max = sorted[0]?.[1] || 1;
    const formatted = sorted.map(([name, qty]) => ({
      name,
      percent: Math.round((qty / max) * 100),
    }));

    setTopProducts(formatted);
  }

  useEffect(() => {
    (async () => {
      await Promise.all([fetchStats(), fetchChartData(timeRange), fetchTopProducts()]);
      setLoading(false);
    })();
  }, [timeRange]);

  return (
    <PageLayout title="Overview">
      <TourGuide />
      {loading ? (
        <p className="text-sm text-gray-400 dark:text-slate-500">Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <StatCard
              label="Sales today"
              value={`KSh ${stats.salesToday.toLocaleString()}`}
              change={
                stats.salesToday > 0
                  ? "From today's transactions"
                  : "No sales yet today"
              }
              up={stats.salesToday > 0}
            />
            <StatCard
              label="Items sold"
              value={stats.itemsSold}
              change={stats.itemsSold > 0 ? "Units today" : "None yet"}
              up={stats.itemsSold > 0}
            />
            <StatCard
              label="Low stock alerts"
              value={stats.lowStock}
              change={
                stats.lowStock > 0
                  ? "Products need restocking"
                  : "All stock healthy"
              }
              up={stats.lowStock === 0}
            />
            <StatCard
              label="Total products"
              value={stats.totalProducts}
              change="In your inventory"
              up
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <WeeklySalesChart data={chartData} timeRange={timeRange} onTimeRangeChange={setTimeRange} />
            <TopProducts products={topProducts} />
          </div>
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <SlowMovingStock />
            </div>
            <div className="lg:col-span-1">
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Total Views" value="1,234" change="All time" up />
                <StatCard label="Today" value="56" change="+12% vs yesterday" up />
                <StatCard label="Most viewed" value="Home" change="42% of all visits" up />
                <StatCard label="Top product" value="Phone Case" change="89 views" up />
              </div>
            </div>
          </div>
          <div className="mt-6">
            <p className="text-sm font-semibold text-gray-800 dark:text-white mb-3">Analytics</p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <PageViewsChart />
              <MostViewedPages />
              <TrafficSources />
            </div>
          </div>
        </>
      )}
    </PageLayout>
  );
}

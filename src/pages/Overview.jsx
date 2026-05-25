import { useEffect, useState } from "react";
import PageLayout from "../components/layout/PageLayout";
import StatCard from "../components/StatCard";
import WeeklySalesChart from "../components/WeeklySalesChart";
import TopProducts from "../components/TopProducts";
import { supabase } from "../lib/supabase";

export default function Overview() {
  const [stats, setStats] = useState({
    salesToday: 0,
    itemsSold: 0,
    lowStock: 0,
  });
  const [weeklySales, setWeeklySales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    await Promise.all([fetchStats(), fetchWeeklySales(), fetchTopProducts()]);
    setLoading(false);
  }

async function fetchStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: todaySales } = await supabase
    .from("sales")
    .select("amount, quantity")
    .gte("created_at", today.toISOString());

  const salesToday = todaySales?.reduce((sum, s) => sum + s.amount, 0) || 0;
  const itemsSold = todaySales?.reduce((sum, s) => sum + s.quantity, 0) || 0;

  const { data: lowStockProducts } = await supabase
    .from("products")
    .select("id")
    .lte("stock", 6);

  const { count } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });

  setStats({
    salesToday,
    itemsSold,
    lowStock: lowStockProducts?.length || 0,
    totalProducts: count || 0,
  });
}

  async function fetchWeeklySales() {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const result = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const { data } = await supabase
        .from("sales")
        .select("amount")
        .gte("created_at", date.toISOString())
        .lt("created_at", nextDate.toISOString());

      const total = data?.reduce((sum, s) => sum + s.amount, 0) || 0;
      result.push({
        day: days[date.getDay() === 0 ? 6 : date.getDay() - 1],
        sales: total,
      });
    }

    setWeeklySales(result);
  }

  async function fetchTopProducts() {
    const { data } = await supabase
      .from("sales")
      .select("product_name, quantity");

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

  return (
    <PageLayout title="Overview">
      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-3 mb-6">
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
          <div className="grid grid-cols-2 gap-4">
            <WeeklySalesChart data={weeklySales} />
            <TopProducts products={topProducts} />
          </div>
        </>
      )}
    </PageLayout>
  );
}

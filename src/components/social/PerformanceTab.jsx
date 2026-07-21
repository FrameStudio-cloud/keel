import { useState, useEffect, useMemo } from "react";
import { getShopId } from "../../lib/shop";
import { supabase } from "../../lib/supabase";
import { formatPrice } from "../../lib/format";
import Skeleton from "../Skeleton";

export default function PerformanceTab() {
  const [posts, setPosts] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const shopId = await getShopId();
      if (!shopId) return;

      const [postsRes, salesRes] = await Promise.all([
        supabase.from("posts")
          .select("id, caption, post_type, product_id, platform, status, likes, comments, reach, created_at")
          .eq("shop_id", shopId)
          .order("created_at", { ascending: false })
          .limit(100),
        supabase.from("sales")
          .select("product_id, product_name, quantity, amount, created_at")
          .eq("shop_id", shopId)
          .gte("created_at", new Date(Date.now() - 60 * 86400000).toISOString()),
      ]);

      if (!cancelled) {
        setPosts(postsRes.data ?? []);
        setSales(salesRes.data ?? []);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const stats = useMemo(() => {
    const published = posts.filter((p) => p.status === "published");
    const productPostIds = new Set(posts.filter((p) => p.product_id).map((p) => p.product_id));

    // Sales lift: units sold within 3d of a linked post
    let totalSalesLift = 0;
    let postsWithLift = 0;
    posts.filter((p) => p.product_id).forEach((post) => {
      const postDate = new Date(post.created_at);
      const endDate = new Date(postDate.getTime() + 3 * 86400000);
      const lift = sales
        .filter((s) => s.product_id === post.product_id && new Date(s.created_at) >= postDate && new Date(s.created_at) <= endDate)
        .reduce((sum, s) => sum + (s.quantity || 0), 0);
      if (lift > 0) { totalSalesLift += lift; postsWithLift++; }
    });

    // Revenue lift: total revenue from linked product sales within 3d
    let totalRevenueLift = 0;
    posts.filter((p) => p.product_id).forEach((post) => {
      const postDate = new Date(post.created_at);
      const endDate = new Date(postDate.getTime() + 3 * 86400000);
      const rev = sales
        .filter((s) => s.product_id === post.product_id && new Date(s.created_at) >= postDate && new Date(s.created_at) <= endDate)
        .reduce((sum, s) => sum + (s.amount || 0), 0);
      totalRevenueLift += rev;
    });

    // Post type performance
    const typePerformance = {};
    published.filter((p) => p.post_type).forEach((p) => {
      if (!typePerformance[p.post_type]) {
        typePerformance[p.post_type] = { count: 0, totalLikes: 0, totalComments: 0, totalReach: 0 };
      }
      typePerformance[p.post_type].count++;
      typePerformance[p.post_type].totalLikes += p.likes || 0;
      typePerformance[p.post_type].totalComments += p.comments || 0;
      typePerformance[p.post_type].totalReach += p.reach || 0;
    });

    // Platform breakdown
    const platformCount = {};
    posts.forEach((p) => { platformCount[p.platform] = (platformCount[p.platform] || 0) + 1; });

    // Best time to post: group published posts by hour, avg engagement
    const hourPerformance = {};
    published.forEach((p) => {
      if (!p.created_at) return;
      const h = new Date(p.created_at).getHours();
      if (!hourPerformance[h]) hourPerformance[h] = { count: 0, totalLikes: 0, totalReach: 0 };
      hourPerformance[h].count++;
      hourPerformance[h].totalLikes += p.likes || 0;
      hourPerformance[h].totalReach += p.reach || 0;
    });

    // Revenue by day (mini-chart data)
    const revenueByDay = {};
    sales.forEach((s) => {
      if (!s.created_at) return;
      const day = new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      revenueByDay[day] = (revenueByDay[day] || 0) + (s.amount || 0);
    });

    return {
      total: posts.length,
      published: published.length,
      scheduled: posts.length - published.length,
      linkedProducts: productPostIds.size,
      salesLiftPosts: postsWithLift,
      totalSalesLift,
      totalRevenueLift,
      typePerformance,
      platformCount,
      hourPerformance,
      revenueByDay,
    };
  }, [posts, sales]);

  const bestHour = useMemo(() => {
    let best = null;
    let bestAvg = 0;
    Object.entries(stats.hourPerformance).forEach(([h, perf]) => {
      const avg = perf.totalReach / perf.count;
      if (avg > bestAvg) { bestAvg = avg; best = h; }
    });
    return best;
  }, [stats.hourPerformance]);

  const revenueEntries = useMemo(() =>
    Object.entries(stats.revenueByDay).slice(-14),
    [stats.revenueByDay]
  );

  const maxRev = useMemo(() =>
    Math.max(...revenueEntries.map(([, v]) => v), 1),
    [revenueEntries]
  );

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-100 dark:border-white/5 p-4">
            <Skeleton className="h-3 w-20 mb-2" />
            <Skeleton className="h-6 w-12" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#16213e] p-4">
          <span className="text-xs text-gray-400 dark:text-slate-500">Total posts</span>
          <p className="text-xl font-semibold text-gray-800 dark:text-white mt-1">{stats.total}</p>
          <div className="flex gap-2 mt-1 text-xs text-gray-400">
            <span>{stats.published} published</span>
            <span>{stats.scheduled} scheduled</span>
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#16213e] p-4">
          <span className="text-xs text-gray-400 dark:text-slate-500">Products linked</span>
          <p className="text-xl font-semibold text-gray-800 dark:text-white mt-1">{stats.linkedProducts}</p>
          <p className="text-xs text-gray-400 mt-1">products featured in posts</p>
        </div>
        <div className="rounded-xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#16213e] p-4">
          <span className="text-xs text-gray-400 dark:text-slate-500">Sales lift</span>
          <p className="text-xl font-semibold text-green-600 dark:text-green-400 mt-1">+{stats.totalSalesLift}</p>
          <p className="text-xs text-gray-400 mt-1">
            units within 3d of a post
            {stats.salesLiftPosts > 0 && ` (${stats.salesLiftPosts} posts)`}
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#16213e] p-4">
          <span className="text-xs text-gray-400 dark:text-slate-500">Revenue driven</span>
          <p className="text-xl font-semibold text-blue-600 dark:text-blue-400 mt-1">
            {formatPrice(stats.totalRevenueLift)}
          </p>
          <p className="text-xs text-gray-400 mt-1">from linked product sales within 3d</p>
        </div>
      </div>

      {bestHour !== null && (
        <div className="rounded-xl border border-gray-100 dark:border-white/5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-500/5 dark:to-indigo-500/5 p-4">
          <span className="text-xs text-gray-400 dark:text-slate-500">Best time to post</span>
          <p className="text-lg font-semibold text-gray-800 dark:text-white mt-1">
            {new Date(0, 0, 0, bestHour).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
          </p>
          <p className="text-xs text-gray-400 mt-1">highest avg reach based on your published posts</p>
        </div>
      )}

      {revenueEntries.length > 1 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Revenue trend (last {revenueEntries.length} days)
          </h4>
          <div className="rounded-xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#16213e] p-4">
            <div className="flex items-end gap-1 h-24">
              {revenueEntries.map(([day, rev]) => (
                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-blue-500 dark:bg-blue-400 rounded-t"
                    style={{ height: `${Math.max((rev / maxRev) * 100, 4)}%` }}
                  />
                  <span className="text-[8px] text-gray-400 dark:text-slate-500 truncate w-full text-center">
                    {day.split(" ").pop()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {Object.keys(stats.typePerformance).length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Post type performance
          </h4>
          <div className="flex flex-col gap-1.5">
            {Object.entries(stats.typePerformance).map(([type, perf]) => (
              <div key={type} className="rounded-lg border border-gray-100 dark:border-white/5 bg-white dark:bg-[#16213e] p-3 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-800 dark:text-gray-100 capitalize">
                    {type.replace(/_/g, " ")}
                  </span>
                  <span className="text-gray-400">{perf.count} posts</span>
                </div>
                <div className="flex gap-3 text-gray-500 dark:text-slate-400">
                  <span>❤️ {Math.round(perf.totalLikes / perf.count)} avg</span>
                  <span>💬 {Math.round(perf.totalComments / perf.count)} avg</span>
                  <span>👁 {Math.round(perf.totalReach / perf.count)} avg</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

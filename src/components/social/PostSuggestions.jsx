import { useState, useEffect, useMemo } from "react";
import { FiTrendingUp, FiAlertTriangle, FiStar, FiPackage, FiClock, FiEye, FiX, FiPlus } from "react-icons/fi";
import { getShopId } from "../../lib/shop";
import { supabase } from "../../lib/supabase";
import { useSettings } from "../../hooks/useSettings";
import Skeleton from "../Skeleton";

const SUGGESTION_TYPES = {
  best_seller: {
    icon: FiTrendingUp,
    label: "Best Seller",
    color: "bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400",
  },
  almost_gone: {
    icon: FiAlertTriangle,
    label: "Almost Gone",
    color: "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400",
  },
  new_arrival: {
    icon: FiStar,
    label: "New Arrival",
    color: "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400",
  },
  back_in_stock: {
    icon: FiPackage,
    label: "Back in Stock",
    color: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400",
  },
  needs_boost: {
    icon: FiClock,
    label: "Needs Boost",
    color: "bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20 text-purple-600 dark:text-purple-400",
  },
  popular_views: {
    icon: FiEye,
    label: "Popular",
    color: "bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/20 text-cyan-600 dark:text-cyan-400",
  },
};

function generateCaption(type, product) {
  // type is used via SUGGESTION_TYPES lookup in the template
  switch (type) {
    case "best_seller":
      return `${product.name} is our hottest item right now! 🔥 Sold ${product.sales_count || 0} units this week. Grab yours at KSh ${(product.price || 0).toLocaleString()}.`;
    case "almost_gone":
      return `Only ${product.stock} left of ${product.name}! ⚡ Don't miss out — once they're gone, they're gone. Order now at KSh ${(product.price || 0).toLocaleString()}.`;
    case "new_arrival":
      return `Just landed: ${product.name} 🆕 Get it fresh at KSh ${(product.price || 0).toLocaleString()}. Be the first to try it!`;
    case "back_in_stock":
      return `${product.name} is back in stock! 📦 We've restocked — get yours at KSh ${(product.price || 0).toLocaleString()} before they sell out again.`;
    case "needs_boost":
      return `${product.name} needs some love! 💙 It hasn't sold in ${product.daysSinceLastSale || "a while"} days. KSh ${(product.price || 0).toLocaleString()} — worth another look.`;
    case "popular_views":
      return `${product.name} is getting a lot of attention! 👀 ${product.view_count || 0} people checked it out. See what the buzz is about at KSh ${(product.price || 0).toLocaleString()}.`;
    default:
      return `Check out ${product.name} at KSh ${(product.price || 0).toLocaleString()}!`;
  }
}

export default function PostSuggestions({ onUseSuggestion }) {
  const { lowStockThreshold } = useSettings();
  const threshold = lowStockThreshold ?? 6;
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(new Set());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const shopId = await getShopId();
      if (!shopId) return;

      const results = [];

      // 1. Best sellers (last 7 days)
      const { data: bestSellers } = await supabase
        .from("sales")
        .select("product_id, product_name, quantity")
        .eq("shop_id", shopId)
        .gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString())
        .not("product_id", "is", null);

      if (bestSellers) {
        const agg = {};
        bestSellers.forEach((s) => {
          if (!agg[s.product_id]) agg[s.product_id] = { name: s.product_name, qty: 0, id: s.product_id };
          agg[s.product_id].qty += s.quantity || 0;
        });
        const top = Object.values(agg).sort((a, b) => b.qty - a.qty).slice(0, 3);
        for (const item of top) {
          const { data: prod } = await supabase
            .from("products")
            .select("id, name, price, stock")
            .eq("id", item.id)
            .single();
          if (prod) {
            results.push({
              type: "best_seller",
              product: { ...prod, sales_count: item.qty },
            });
          }
        }
      }

      // 2. Almost gone (low stock)
      const { data: lowStock } = await supabase
        .from("products")
        .select("id, name, price, stock")
        .eq("shop_id", shopId)
        .gt("stock", 0)
        .lte("stock", threshold)
        .limit(3);
      if (lowStock) {
        lowStock.forEach((p) => {
          results.push({ type: "almost_gone", product: p });
        });
      }

      // 3. New arrivals
      const { data: newArrivals } = await supabase
        .from("products")
        .select("id, name, price, stock, category")
        .eq("shop_id", shopId)
        .eq("new_arrival", true)
        .limit(3);
      if (newArrivals) {
        newArrivals.forEach((p) => {
          results.push({ type: "new_arrival", product: p });
        });
      }

      // 4. Back in stock (recent positive stock movements)
      const { data: restocks } = await supabase
        .from("stock_movements")
        .select("product_id, product_name, change, created_at")
        .eq("shop_id", shopId)
        .gt("change", 0)
        .gte("created_at", new Date(Date.now() - 14 * 86400000).toISOString())
        .order("created_at", { ascending: false })
        .limit(5);
      if (restocks) {
        const seen = new Set();
        for (const m of restocks) {
          if (seen.has(m.product_id)) continue;
          seen.add(m.product_id);
          const { data: prod } = await supabase
            .from("products")
            .select("id, name, price, stock")
            .eq("id", m.product_id)
            .single();
          if (prod) {
            results.push({ type: "back_in_stock", product: prod });
          }
          if (seen.size >= 3) break;
        }
      }

      // 5. Needs boost (no sales in 14+ days)
      const { data: allProducts } = await supabase
        .from("products")
        .select("id, name, price, stock")
        .eq("shop_id", shopId)
        .limit(50);
      if (allProducts) {
        for (const p of allProducts) {
          const { data: lastSale } = await supabase
            .from("sales")
            .select("created_at")
            .eq("shop_id", shopId)
            .eq("product_id", p.id)
            .order("created_at", { ascending: false })
            .limit(1);
          const daysSince = lastSale?.length
            ? Math.floor((Date.now() - new Date(lastSale[0].created_at)) / 86400000)
            : 999;
          if (daysSince >= 14) {
            results.push({
              type: "needs_boost",
              product: { ...p, daysSinceLastSale: daysSince },
            });
          }
        }
      }

      // 6. Popular page views
      const { data: popularViews } = await supabase
        .from("page_views")
        .select("product_name")
        .eq("shop_id", shopId)
        .not("product_name", "is", null)
        .gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString());
      if (popularViews) {
        const agg = {};
        popularViews.forEach((v) => {
          agg[v.product_name] = (agg[v.product_name] || 0) + 1;
        });
        const sorted = Object.entries(agg)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3);
        for (const [name, count] of sorted) {
          const { data: prod } = await supabase
            .from("products")
            .select("id, name, price, stock")
            .eq("shop_id", shopId)
            .ilike("name", name)
            .limit(1)
            .single();
          if (prod) {
            results.push({
              type: "popular_views",
              product: { ...prod, view_count: count },
            });
          }
        }
      }

      if (!cancelled) {
        const seen = new Set();
        const deduped = results.filter((r) => {
          const key = r.product?.id;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        setSuggestions(deduped.slice(0, 8));
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [threshold]);

  const visible = useMemo(
    () => suggestions.filter((s) => !dismissed.has(s.product?.id + s.type)),
    [suggestions, dismissed]
  );

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-100 dark:border-white/5 p-3">
            <Skeleton className="h-3 w-24 mb-2" />
            <Skeleton className="h-3 w-full mb-1" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (visible.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">
        Post Ideas
      </h3>
      {visible.map((s) => {
        const meta = SUGGESTION_TYPES[s.type];
        const Icon = meta.icon;
        const caption = generateCaption(s.type, s.product);

        return (
          <div
            key={s.product.id + s.type}
            className={`rounded-xl border ${meta.color} p-3 text-xs`}
          >
            <div className="flex items-start justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Icon size={14} />
                <span className="font-semibold">{meta.label}</span>
              </div>
              <button
                onClick={() =>
                  setDismissed((prev) => new Set(prev).add(s.product.id + s.type))
                }
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label="Dismiss"
              >
                <FiX size={14} />
              </button>
            </div>
            <p className="font-medium text-gray-800 dark:text-gray-100 mb-1">
              {s.product.name}
            </p>
            <p className="text-gray-500 dark:text-slate-400 mb-2 leading-relaxed">
              {caption}
            </p>
            <button
              onClick={() => onUseSuggestion(caption)}
              className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              <FiPlus size={12} /> Add to calendar
            </button>
          </div>
        );
      })}
    </div>
  );
}

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { getShopId } from "../lib/shop";
import { useSettings } from "./useSettings";

export function useLowStockCount() {
  const { lowStockThreshold } = useSettings();
  return useQuery({
    queryKey: ["lowStockCount", lowStockThreshold],
    queryFn: async () => {
      const shopId = await getShopId();
      if (!shopId) return 0;
      const { count } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("shop_id", shopId)
        .lte("stock", lowStockThreshold ?? 6);
      return count || 0;
    },
    staleTime: 30_000,
  });
}

export function useSlowMovingStock() {
  return useQuery({
    queryKey: ["slowMovingStock"],
    queryFn: async () => {
      const shopId = await getShopId();
      if (!shopId) return [];
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { data: sales } = await supabase
        .from("sales")
        .select("product_id, quantity")
        .eq("shop_id", shopId)
        .gte("created_at", thirtyDaysAgo.toISOString())
        .limit(5000);
      const soldIds = new Set();
      const soldCount = {};
      (sales || []).forEach((s) => {
        soldIds.add(s.product_id);
        soldCount[s.product_id] = (soldCount[s.product_id] || 0) + s.quantity;
      });
      const { data: allProducts } = await supabase
        .from("products")
        .select("*")
        .eq("shop_id", shopId)
        .order("stock", { ascending: false })
        .limit(100);
      return (allProducts || [])
        .filter((p) => !soldIds.has(p.id) || (soldCount[p.id] || 0) < 3)
        .slice(0, 5);
    },
    staleTime: 60_000,
  });
}

export function useLowStockProducts() {
  const { lowStockThreshold } = useSettings();
  return useQuery({
    queryKey: ["lowStockProducts", lowStockThreshold],
    queryFn: async () => {
      const shopId = await getShopId();
      if (!shopId) return [];
      const { data } = await supabase
        .from("products")
        .select("id, name, stock")
        .eq("shop_id", shopId)
        .lte("stock", lowStockThreshold ?? 6)
        .order("stock", { ascending: true })
        .limit(200);
      return data || [];
    },
    staleTime: 30_000,
    refetchInterval: 30_000,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
  });
}

export function useAnnouncements() {
  return useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const shopId = await getShopId();
      const now = new Date().toISOString();

      const { data: announcements } = await supabase
        .from("announcements")
        .select("*")
        .eq("active", true)
        .lte("starts_at", now)
        .or(`expires_at.is.null,expires_at.gt.${now}`)
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(5);

      if (!announcements?.length || !shopId) return announcements || [];

      const { data: dismissals } = await supabase
        .from("announcement_dismissals")
        .select("announcement_id")
        .eq("shop_id", shopId);

      const dismissedIds = new Set((dismissals || []).map((d) => d.announcement_id));
      return announcements.filter((a) => !dismissedIds.has(a.id));
    },
    staleTime: 120_000,
  });
}

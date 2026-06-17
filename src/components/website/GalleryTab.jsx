import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { getShopId } from "../../lib/shop";
import Pagination from "../Pagination";

const PAGE_SIZE = 50;

export default function GalleryTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const shopId = await getShopId();
      const { data, error, count } = await supabase
        .from("catalogue")
        .select("id, name, category, image, description", { count: "exact" })
        .eq("shop_id", shopId)
        .not("image", "is", null)
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setItems(data);
        setTotal(count ?? 0);
      }
      setLoading(false);
    })();
  }, [page]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="aspect-square bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-slate-600 dark:text-slate-400">
        <p className="text-sm">No images in your catalogue yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.map((item) => (
          <div key={item.id} className="bg-white dark:bg-[#16213e] border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden">
            {item.image && (
              <img
                src={item.image}
                alt={item.name}
                className="w-full aspect-square object-cover"
              />
            )}
            <div className="p-3">
              <p className="text-slate-900 dark:text-white text-sm font-medium truncate">{item.name}</p>
              {item.category && (
                <p className="text-slate-600 dark:text-slate-400 text-xs">{item.category}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      <Pagination page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
    </>
  );
}

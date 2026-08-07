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
      <div className="text-center py-12 text-text-body">
        <p className="text-sm">No images in your catalogue yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.map((item) => (
          <div key={item.id} className="bg-surface-1 border border-border-subtle rounded-xl overflow-hidden">
            {item.image && (
              <img
                src={item.image}
                alt={item.name}
                className="w-full aspect-square object-cover"
              />
            )}
            <div className="p-3">
              <p className="text-text-primary text-sm font-medium truncate">{item.name}</p>
              {item.category && (
                <p className="text-text-body text-xs">{item.category}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      <Pagination page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
    </>
  );
}

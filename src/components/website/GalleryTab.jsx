import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { getShopId } from "../../lib/shop";



export default function GalleryTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const shopId = await getShopId();
      const { data, error } = await supabase
        .from("catalogue")
        .select("id, name, category, image, description")
        .eq("shop_id", shopId)
        .not("image", "is", null)
        .order("created_at", { ascending: false });

      if (!error && data?.length > 0) {
        setItems(data);
      }
      setLoading(false);
    })();
  }, []);

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
  );
}

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { formatPrice } from "../lib/format";

export default function SlowMovingStock() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: sales } = await supabase
        .from("sales")
        .select("product_id, quantity")
        .gte("created_at", thirtyDaysAgo.toISOString());

      const soldIds = new Set();
      const soldCount = {};
      (sales || []).forEach((s) => {
        soldIds.add(s.product_id);
        soldCount[s.product_id] = (soldCount[s.product_id] || 0) + s.quantity;
      });

      const { data: allProducts } = await supabase
        .from("products")
        .select("*")
        .order("stock", { ascending: false });

      const slow = (allProducts || [])
        .filter((p) => !soldIds.has(p.id) || (soldCount[p.id] || 0) < 3)
        .slice(0, 5);

      setProducts(slow);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5">
        <h3 className="text-[var(--text-primary)] font-semibold text-sm mb-4">
          Slow Moving Stock
        </h3>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5">
       text-[var(--text-primary)]Name="text-[var(--text-primary)] font-semibold text-sm mb-1">
          Slow Moving Stock
        </h3>
        <p className="text-[var(--text-secondary)] text-xs">All products are moving well</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] roundedtext-[var(--text-primary)]
      <h3 className="text-[var(--text-primary)] font-semibold text-sm mb-4">
        Slow Moving Stock
      </h3>

      <div className="sm:hidden space-y-2">
        {products.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between bg-[var(--bg-page)] rounded-xl px-4 py-3"
          text-[var(--text-primary)]    <div>
              <p className="text-[var(--text-primary)] text-sm font-medium">{p.name}</p>
              <p className="text-[var(--text-secondary)] text-xs">{p.category}</p>
            </div>
            <div className="text-right">
              <p className="text-blue-400 text-sm font-semibold">
                {formatPrice(p.price)}
              </p>
              <p className="text-[var(--text-secondary)] text-xs">Stock: {p.stock}</p>
            </div>
          </div>
        ))}
      </div>

      <table className="hidden sm:table w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border)]">
            <th className="text-left text-xs font-medium text-[var(--text-secondary)] px-3 py-2">Product</th>
            <th className="text-left text-xs font-medium text-[var(--text-secondary)] px-3 py-2">Price</th>
            <th className="text-left text-xs font-medium text-[var(--text-secondary)] px-3 py-2">Stock</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b border-white/5 hover:bg-[var(--hover)]">
         text-[var(--text-primary)]lassName="px-3 py-2.5">
                <p className="text-[var(--text-primary)] text-sm">{p.name}</p>
                <p className="text-[var(--text-secondary)] text-xs">{p.category}</p>
              </td>
              <td className="px-3 py-2.5 text-blue-400 font-semibold">{formatPrice(p.price)}</td>
              <td className="px-3 py-2.5 text-[var(--text-primary)]">{p.stock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

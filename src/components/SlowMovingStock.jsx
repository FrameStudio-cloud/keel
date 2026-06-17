import { formatPrice } from "../lib/format";
import { useSlowMovingStock } from "../hooks/useQueries";

export default function SlowMovingStock() {
  const { data: products = [], isLoading } = useSlowMovingStock();

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#16213e] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm p-5">
        <h3 className="text-slate-900 dark:text-white font-semibold text-sm mb-4">
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
      <div className="bg-white dark:bg-[#16213e] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm p-5">
       <h3 className="text-slate-900 dark:text-white font-semibold text-sm mb-1">
           Slow Moving Stock
         </h3>
        <p className="text-slate-600 dark:text-slate-400 text-xs">All products are moving well</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#16213e] border border-slate-200 dark:border-white/10 rounded-2xl p-5">
      <h3 className="text-slate-900 dark:text-white font-semibold text-sm mb-4">
        Slow Moving Stock
      </h3>

      <div className="sm:hidden space-y-2">
        {products.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between bg-slate-100 dark:bg-[#1a1a2e] rounded-xl px-4 py-3"
          >
            <div>
              <p className="text-slate-900 dark:text-white text-sm font-medium">{p.name}</p>
              <p className="text-slate-600 dark:text-slate-400 text-xs">{p.category}</p>
            </div>
            <div className="text-right">
              <p className="text-blue-400 text-sm font-semibold">
                {formatPrice(p.price)}
              </p>
              <p className="text-slate-600 dark:text-slate-400 text-xs">Stock: {p.stock}</p>
            </div>
          </div>
        ))}
      </div>

      <table className="hidden sm:table w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-white/10">
            <th className="text-left text-xs font-medium text-slate-600 dark:text-slate-400 px-3 py-2">Product</th>
            <th className="text-left text-xs font-medium text-slate-600 dark:text-slate-400 px-3 py-2">Price</th>
            <th className="text-left text-xs font-medium text-slate-600 dark:text-slate-400 px-3 py-2">Stock</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b border-white/5 hover:bg-black/[0.03] dark:hover:bg-white/[0.05]">
            <td className="px-3 py-2.5">
                <p className="text-slate-900 dark:text-white text-sm">{p.name}</p>
                <p className="text-slate-600 dark:text-slate-400 text-xs">{p.category}</p>
              </td>
              <td className="px-3 py-2.5 text-blue-400 font-semibold">{formatPrice(p.price)}</td>
              <td className="px-3 py-2.5 text-slate-900 dark:text-white">{p.stock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import { formatPrice } from "../lib/format";
import { useSlowMovingStock } from "../hooks/useQueries";

export default function SlowMovingStock({ compact }) {
  const { data: products = [], isLoading } = useSlowMovingStock();

  if (isLoading) {
    return (
      <div className="bg-surface-1 border border-border-subtle rounded-card shadow-card p-5">
        <h3 className="text-text-primary font-semibold text-sm mb-4">
          Slow Moving Stock
        </h3>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-surface-2 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-surface-1 border border-border-subtle rounded-card shadow-card p-5">
       <h3 className="text-text-primary font-semibold text-sm mb-1">
            Slow Moving Stock
          </h3>
        <p className="text-text-body text-xs">All products are moving well</p>
      </div>
    );
  }

  return (
    <div className={`bg-surface-1 border border-border-subtle rounded-card p-5 ${compact ? "h-full" : ""}`}>
      <h3 className="text-text-primary font-semibold text-sm mb-4">
        Slow Moving Stock
      </h3>

      <div className={`${compact ? "" : "sm:hidden"} ${compact ? "" : "max-h-48"} overflow-y-auto space-y-2`}>
        {products.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between bg-surface-2 rounded-xl px-4 py-3"
          >
            <div className="min-w-0">
              <p className="text-text-primary text-sm font-medium truncate">{p.name}</p>
              <p className="text-text-body text-xs">{p.category}</p>
            </div>
            <div className="text-right shrink-0 ml-3">
              <p className="text-brand text-sm font-semibold">
                {formatPrice(p.price)}
              </p>
              <p className="text-text-body text-xs">Stock: {p.stock}</p>
            </div>
          </div>
        ))}
      </div>

      {!compact && (
        <div className="hidden sm:block max-h-60 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-surface-1">
              <tr className="border-b border-border-subtle">
                <th className="text-left text-xs font-medium text-text-body px-3 py-2">Product</th>
                <th className="text-left text-xs font-medium text-text-body px-3 py-2">Price</th>
                <th className="text-left text-xs font-medium text-text-body px-3 py-2">Stock</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-border-subtle hover:bg-surface-2">
                  <td className="px-3 py-2.5">
                    <p className="text-text-primary text-sm">{p.name}</p>
                    <p className="text-text-body text-xs">{p.category}</p>
                  </td>
                  <td className="px-3 py-2.5 text-brand font-semibold">{formatPrice(p.price)}</td>
                  <td className="px-3 py-2.5 text-text-primary">{p.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

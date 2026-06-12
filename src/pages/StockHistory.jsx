import { useState, useEffect } from "react";
import PageLayout from "../components/layout/PageLayout";
import { supabase } from "../lib/supabase";

export default function StockHistory() {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("stock_movements")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error) setMovements(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <PageLayout title="Stock History">
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : movements.length === 0 ? (
        <div className="text-center py-16 text-[var(--text-secondary)]">
          <p className="text-sm">No stock movements recorded yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {movements.map((movement) => (
            <div
              key={movement.id}
              className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-4 py-3 flex items-center justify-between"
            >
              <div>
                <p className="text-[var(--text-primary)] text-sm font-medium">
                  {movement.product_name}
                </p>
                <p className="text-[var(--text-secondary)] text-xs mt-0.5">
                  {movement.reason}
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`text-sm font-bold ${
                    movement.change > 0
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {movement.change > 0 ? "+" : ""}
                  {movement.change}
                </span>
                <p className="text-xs text-[var(--text-muted)]">
                  {new Date(movement.created_at).toLocaleDateString("en-KE", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageLayout>
  );
}

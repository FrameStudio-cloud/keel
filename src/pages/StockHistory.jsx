import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import PageLayout from "../components/layout/PageLayout";
import Pagination from "../components/Pagination";
import { getShopId } from "../lib/shop";
import { paginateQuery } from "../lib/paginate";

const PAGE_SIZE = 50;

export default function StockHistory() {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const shopId = await getShopId();
      const { data, error, total: count } = await paginateQuery({
        table: "stock_movements",
        shopId,
        page,
        pageSize: PAGE_SIZE,
        orderBy: "created_at",
        ascending: false,
      });
      if (!error) {
        setMovements(data || []);
        setTotal(count);
      }
      setLoading(false);
    })();
  }, [page]);

  return (
    <PageLayout title="Stock History">
      <Helmet><title>Stock History — Keel</title></Helmet>
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : movements.length === 0 ? (
        <div className="text-center py-16 text-slate-600 dark:text-slate-400">
          <p className="text-sm">No stock movements recorded yet.</p>
        </div>
      ) : (
        <>
          <div className="sm:hidden space-y-2 max-w-xl mx-auto">
            {movements.map((movement) => (
              <div
                key={movement.id}
                className="bg-white dark:bg-[#16213e] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-slate-900 dark:text-white text-sm font-medium">
                    {movement.product_name}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 text-xs mt-0.5">
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
                  <p className="text-xs text-slate-400 dark:text-slate-500">
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
          <div className="hidden sm:block bg-white dark:bg-[#16213e] rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#1a1a2e]">
                  <th className="px-4 py-3 text-xs font-semibold text-left text-slate-600 dark:text-slate-400 uppercase">Product</th>
                  <th className="px-4 py-3 text-xs font-semibold text-left text-slate-600 dark:text-slate-400 uppercase">Reason</th>
                  <th className="px-4 py-3 text-xs font-semibold text-right text-slate-600 dark:text-slate-400 uppercase">Qty</th>
                  <th className="px-4 py-3 text-xs font-semibold text-right text-slate-600 dark:text-slate-400 uppercase">Date</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((movement, i) => (
                  <tr key={movement.id} className={`border-b border-white/5 hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-colors ${i === movements.length - 1 ? "border-0" : ""}`}>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{movement.product_name}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-xs capitalize">{movement.reason}</td>
                    <td className={`px-4 py-3 text-right font-bold text-sm ${movement.change > 0 ? "text-green-400" : "text-red-400"}`}>
                      {movement.change > 0 ? "+" : ""}{movement.change}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-slate-400 dark:text-slate-500">
                      {new Date(movement.created_at).toLocaleDateString("en-KE", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
            <Pagination page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
        </>
      )}
    </PageLayout>
  );
}
